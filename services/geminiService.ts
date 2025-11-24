
import { GoogleGenAI, Type } from "@google/genai";
import { CandidateAnalysis, Language, AnalysisMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeCandidate = async (
  cvFile: File,
  jobDescription: string | File,
  language: Language = 'fr',
  mode: AnalysisMode = 'strict'
): Promise<CandidateAnalysis> => {
  const cvBase64 = await fileToBase64(cvFile);
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentYear = new Date().getFullYear();
  
  let promptParts: any[] = [];

  // Instructions de langue strictes
  const langContext = language === 'fr' 
    ? "RÉPONDRE UNIQUEMENT EN FRANÇAIS." 
    : "RESPOND ONLY IN ENGLISH.";

  // --- MODE DEFINITIONS (ALGORITHMIC DIFFERENCES) ---

  const modeInstructions = {
    strict: `
      MODE: STRICT & UNCOMPROMISING (The "Gatekeeper")
      PHILOSOPHY: "When in doubt, Reject."
      
      SCORING ALGORITHM:
      1. Technical (Max 40): 
         - EXACT keyword matching required. 
         - DEDUCT 2 points for EACH missing hard skill from the Job Description.
         - NO points for "conceptual knowledge" without proof.
      2. Experience (Max 30): 
         - GAP PENALTY: Any unexplained gap > 3 months = -5 points.
         - JUNIOR CAP: If total experience < 3 years, CAP experience score at 15/30. No exceptions.
         - JOB HOPPING: < 1 year in a position = Red Flag.
      3. Soft Skills (Max 20): 
         - Only count if PROVEN by numbers/results.
      4. Form (Max 10): 
         - Deduct 1 point per typo/formatting error.
    `,
    balanced: `
      MODE: BALANCED & REALISTIC (The "Hiring Manager")
      PHILOSOPHY: "Look for the best fit, accept minor flaws."
      
      SCORING ALGORITHM:
      1. Technical (Max 40): 
         - Accept SYNONYMS and related tech (e.g., React skills count partially for Vue).
         - Focus on Core Skills (80% match is good).
      2. Experience (Max 30): 
         - GAP TOLERANCE: Gaps < 6 months are acceptable.
         - PROJECTS: Personal projects count as partial experience (up to 5 points).
      3. Soft Skills (Max 20): 
         - Infer skills from project descriptions and background.
      4. Form (Max 10): 
         - Standard professional expectation.
    `,
    flexible: `
      MODE: FLEXIBLE & OPEN (The "Talent Scout")
      PHILOSOPHY: "Hire for attitude, train for skill."
      
      SCORING ALGORITHM:
      1. Technical (Max 40): 
         - Focus on POTENTIAL and TRANSFERABLE skills. 
         - If they know Python, assume they can learn Ruby (Valid).
      2. Experience (Max 30): 
         - IGNORE GAPS under 1 year.
         - EDUCATION/BOOTCAMPS count as Full Experience.
         - VALUE motivation and career transition highly.
      3. Soft Skills (Max 20): 
         - Bonus points for passion, self-learning, and adaptability.
      4. Form (Max 10): 
         - Very lenient.
    `
  };

  const selectedModeInstruction = modeInstructions[mode];

  const systemRole = `
    *** CRITICAL PRIORITY #1: METADATA EXTRACTION ***
    - SCAN HEADER AND FOOTER FIRST.
    - Extract Candidate Name.
    - Extract Email Address (Look for @, 'mail:', or contact icons).
    - NOTE: If email is not found, look at the very bottom of the last page.

    *** PRIORITY #2: DATE & GAP LOGIC (ANTI-HALLUCINATION) ***
    Current Date: ${currentDate} (Year: ${currentYear}).
    
    RULES FOR DATES:
    1. "Present", "Current", "Aujourd'hui" = ${currentDate}.
    2. FUTURE DATES: 
       - If a degree ends in ${currentYear}, it is VALID (Graduating soon/Just graduated). NOT A RED FLAG.
       - If a degree ends in ${currentYear + 1}, mark as "In Progress".
    3. GAP ANALYSIS:
       - Cross-reference WORK dates with EDUCATION dates.
       - Overlap = NO GAP.
       - Period of Schooling/Bootcamp = VALID ACTIVITY (NOT Unemployment).

    ${selectedModeInstruction}

    GENERAL TASKS:
    1. Extract Deep Data: Education, Languages, Interests.
    2. Calculate Score based on the SCORING ALGORITHM above.
    3. Generate 3 "Tricky" Technical Questions (Test specific weaknesses).
    4. Generate 3 Emails (Reject, Waitlist, Invite) customized to the candidate.

    ${langContext}
  `;

  if (jobDescription instanceof File) {
    const jdBase64 = await fileToBase64(jobDescription);
    promptParts = [
      { inlineData: { mimeType: cvFile.type || 'application/pdf', data: cvBase64 } },
      { inlineData: { mimeType: jobDescription.type || 'application/pdf', data: jdBase64 } },
      { text: `${systemRole}\n\nDocument 1 is the CV. Document 2 is the Job Description. Analyze Document 1 based on Document 2.` }
    ];
  } else {
    promptParts = [
      { inlineData: { mimeType: cvFile.type || 'application/pdf', data: cvBase64 } },
      { text: `${systemRole}\n\nHere is the JOB DESCRIPTION:\n"${jobDescription}"\n\nAnalyze the attached CV.` }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: promptParts },
      config: {
        // ROBUSTNESS SETTINGS (Max Determinism)
        temperature: 0,       // No creativity
        topP: 0.95,
        topK: 1,              // FORCE the single most probable token. Eliminates variance.
        seed: 42,             // Fixed seed
        
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            email: { type: Type.STRING },
            // Global Score
            score: { type: Type.NUMBER },
            // Sub Scores
            technicalScore: { type: Type.NUMBER },
            experienceScore: { type: Type.NUMBER },
            softSkillScore: { type: Type.NUMBER },
            formattingScore: { type: Type.NUMBER },
            // Analysis
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING, enum: ['HIRE', 'MAYBE', 'PASS'] },
            reasoning: { type: Type.STRING },
            
            // Deep Extraction
            education: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of degrees and schools found" },
            languages: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of languages spoken" },
            interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hobbies or personal projects found" },

            // Strict Checks
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hasGaps: { type: Type.BOOLEAN },
            gapAnalysis: { type: Type.STRING },
            // Skills
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            
            // Actionable
            interviewQuestions: {
               type: Type.OBJECT,
               properties: {
                 technical: { type: Type.ARRAY, items: { type: Type.STRING } },
                 behavioral: { type: Type.ARRAY, items: { type: Type.STRING } }
               },
               required: ['technical', 'behavioral']
            },
            emailDrafts: {
              type: Type.OBJECT,
              properties: {
                reject: { type: Type.STRING },
                waitlist: { type: Type.STRING },
                invite: { type: Type.STRING }
              }
            }
          },
          required: [
            'candidateName', 'score', 
            'technicalScore', 'experienceScore', 'softSkillScore', 'formattingScore', 
            'summary', 'strengths', 'weaknesses', 'recommendation', 'reasoning', 
            'education', 'languages', 'interests',
            'redFlags', 'hasGaps', 'gapAnalysis',
            'matchingSkills', 'missingSkills',
            'interviewQuestions', 'emailDrafts'
          ],
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        modeUsed: mode,
        ...data
      };
    } else {
      throw new Error("No response text generated");
    }

  } catch (error) {
    console.error("Error analyzing candidate:", error);
    throw error;
  }
};
