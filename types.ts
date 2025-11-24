
export type Language = 'fr' | 'en';
export type Theme = 'light' | 'dark';
export type AnalysisMode = 'strict' | 'balanced' | 'flexible';

export interface StoredJobDescription {
  id: string;
  title: string; // Extrait ou premiers mots
  content: string;
  timestamp: number;
}

export interface StoredCV {
  id: string;
  fileName: string;
  base64: string; // Stockage limité
  timestamp: number;
}

export interface CandidateAnalysis {
  id: string;
  candidateName: string;
  email?: string;
  // Global Score
  score: number; // 0-100
  
  // Detailed Scoring (Total 100)
  technicalScore: number; // /40
  experienceScore: number; // /30
  softSkillScore: number; // /20
  formattingScore: number; // /10
  
  // Analysis Content
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'HIRE' | 'MAYBE' | 'PASS';
  reasoning: string;
  
  // Deep Extraction (Preuve de lecture)
  education: string[];
  languages: string[];
  interests: string[];

  // Strict Checks
  redFlags: string[];
  hasGaps: boolean;
  gapAnalysis: string;
  
  // Skills
  matchingSkills: string[];
  missingSkills: string[];
  
  // Actionable Content (Nouveau)
  interviewQuestions: {
    technical: string[];
    behavioral: string[];
  };
  emailDrafts: {
    reject: string;
    waitlist: string;
    invite: string;
  };

  // Metadata
  date: string; // ISO String
  modeUsed: AnalysisMode;
}

export interface FileWithStatus {
  id: string;
  fileName: string;
  file?: File; // Optional because persistence removes File objects
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  result?: CandidateAnalysis;
  timestamp: number; // Created at for 7-day expiration logic
}

export type ViewState = 'HOME' | 'ARCHIVE';

export interface TranslationDictionary {
  [key: string]: {
    [key: string]: string;
  }
}
