import React, { useState } from 'react';
import { CandidateAnalysis, Language } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Brain, TrendingUp, Printer, AlertTriangle, MessageSquare, Mail, User, GraduationCap, Languages, Sparkles, Copy, Eye, EyeOff, ClipboardList, Ban, Clock } from 'lucide-react';

interface AnalysisResultProps {
  analysis: CandidateAnalysis;
  onClose: () => void;
  lang: Language;
  blindMode: boolean;
}

type Tab = 'analysis' | 'interview' | 'email';

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onClose, lang, blindMode }) => {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-brand-teal bg-brand-teal/10 ring-brand-teal/20';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-500 ring-yellow-500/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-500 ring-red-500/20';
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'HIRE':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">{lang === 'fr' ? '✅ Recommandé' : '✅ Hire'}</span>;
      case 'MAYBE':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800">{lang === 'fr' ? '⚠️ À considérer' : '⚠️ Maybe'}</span>;
      case 'PASS':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border border-red-200 dark:border-red-800">{lang === 'fr' ? '❌ Refusé' : '❌ Pass'}</span>;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple feedback could be added here
  };

  const labels = {
    fr: {
      summary: "Synthèse & Analyse",
      reasoning: "Justification",
      strengths: "Points Forts",
      weaknesses: "Points Faibles",
      matched: "Compétences Validées",
      missing: "Compétences Manquantes",
      tech: "Technique",
      exp: "Expérience",
      soft: "Culture/Soft",
      form: "Forme/Std",
      redFlags: "Red Flags & Risques",
      gaps: "Analyse des Trous (Gaps)",
      close: "Fermer",
      download: "Imprimer",
      tabAnalysis: "Analyse",
      tabInterview: "Entretien (Cheat Sheet)",
      tabEmail: "Emails",
      education: "Parcours & Formation",
      languages: "Langues",
      interests: "Intérêts",
      interviewTitle: "Questions Suggérées",
      techQuestions: "Questions Techniques (Ciblées)",
      softQuestions: "Questions Comportementales",
      emailTitle: "Brouillons de réponse",
      copy: "Copier",
      blindName: "Candidat Anonyme",
      scoreDetail: "Détail du Score"
    },
    en: {
      summary: "Executive Summary",
      reasoning: "Reasoning",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      matched: "Matched Skills",
      missing: "Missing Skills",
      tech: "Technical",
      exp: "Experience",
      soft: "Culture/Soft",
      form: "Form/Std",
      redFlags: "Red Flags & Risks",
      gaps: "Gap Analysis",
      close: "Close",
      download: "Print",
      tabAnalysis: "Analysis",
      tabInterview: "Interview (Cheat Sheet)",
      tabEmail: "Emails",
      education: "Education & Background",
      languages: "Languages",
      interests: "Interests",
      interviewTitle: "Suggested Questions",
      techQuestions: "Technical Questions (Targeted)",
      softQuestions: "Behavioral Questions",
      emailTitle: "Response Drafts",
      copy: "Copy",
      blindName: "Anonymous Candidate",
      scoreDetail: "Score Breakdown"
    }
  };

  const t = labels[lang];

  // Helper for score bars
  const ScoreBar = ({ label, value, max, colorClass }: { label: string, value: number, max: number, colorClass: string }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value} / {max}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto print:bg-white print:p-0 print:static">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-brand-bg dark:bg-gray-800/50 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ring-1 ring-inset shadow-sm ${getScoreColor(analysis.score)} print:border print:border-black print:text-black print:bg-transparent`}>
              <div className="text-center">
                 <span className="text-3xl font-bold font-display block">{analysis.score}</span>
                 <span className="text-[10px] uppercase font-bold opacity-60">/ 100</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold font-display text-brand-text dark:text-white print:text-black flex items-center">
                {blindMode ? (
                  <>
                     <EyeOff className="w-6 h-6 mr-2 text-gray-400" />
                     {t.blindName}
                  </>
                ) : analysis.candidateName}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                {getRecommendationBadge(analysis.recommendation)}
                {!blindMode && analysis.email && <span className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">• {analysis.email}</span>}
                <span className="text-xs text-gray-400 print:text-gray-500">• {new Date(analysis.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 print:hidden">
            <button 
                onClick={() => window.print()}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 hover:text-brand-dark transition-colors"
                title={t.download}
            >
                <Printer className="w-6 h-6" />
            </button>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                title={t.close}
            >
                <XCircle className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 print:hidden">
            <button 
                onClick={() => setActiveTab('analysis')}
                className={`mr-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'analysis' ? 'border-brand-violet text-brand-violet' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
                <Brain className="w-4 h-4 mr-2" />
                {t.tabAnalysis}
            </button>
            <button 
                onClick={() => setActiveTab('interview')}
                className={`mr-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'interview' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t.tabInterview}
            </button>
            <button 
                onClick={() => setActiveTab('email')}
                className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'email' ? 'border-brand-dark text-brand-dark dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
                <Mail className="w-4 h-4 mr-2" />
                {t.tabEmail}
            </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-8 bg-brand-bg/30 dark:bg-black/20 print:overflow-visible print:p-0">
          
          {/* --- TAB: ANALYSIS --- */}
          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                {/* 1. Score Breakdown & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold font-display text-brand-dark dark:text-white mb-4 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-brand-violet" />
                                {t.summary}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                {analysis.summary}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t.reasoning}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{analysis.reasoning}"</p>
                            </div>
                        </div>

                        {/* Pros / Cons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
                                <h4 className="text-green-800 dark:text-green-400 font-bold mb-3 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" /> {t.strengths}
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.strengths?.map((str, i) => (
                                        <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                                            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 opacity-70" />
                                            {str}
                                        </li>
                                    )) || <span className="text-sm text-gray-400">N/A</span>}
                                </ul>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                                <h4 className="text-red-800 dark:text-red-400 font-bold mb-3 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" /> {t.weaknesses}
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.weaknesses?.map((weak, i) => (
                                        <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                                            <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 opacity-70" />
                                            {weak}
                                        </li>
                                    )) || <span className="text-sm text-gray-400">N/A</span>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right: Score Details */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold font-display text-brand-dark dark:text-white mb-4 flex items-center">
                                <ClipboardList className="w-5 h-5 mr-2 text-brand-dark" />
                                {t.scoreDetail}
                            </h3>
                            <div className="space-y-2">
                                <ScoreBar label={t.tech} value={analysis.technicalScore} max={40} colorClass="bg-brand-violet" />
                                <ScoreBar label={t.exp} value={analysis.experienceScore} max={30} colorClass="bg-brand-dark" />
                                <ScoreBar label={t.soft} value={analysis.softSkillScore} max={20} colorClass="bg-brand-teal" />
                                <ScoreBar label={t.form} value={analysis.formattingScore} max={10} colorClass="bg-gray-400" />
                            </div>
                        </div>

                        {/* Red Flags */}
                        {(analysis.redFlags?.length > 0 || analysis.hasGaps) && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 ring-1 ring-red-500/10">
                                <h3 className="text-red-600 dark:text-red-400 font-bold mb-4 flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    {t.redFlags}
                                </h3>
                                {analysis.hasGaps && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300">
                                        <strong>{t.gaps}:</strong> {analysis.gapAnalysis}
                                    </div>
                                )}
                                <ul className="space-y-2">
                                    {analysis.redFlags?.map((flag, i) => (
                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                            <span className="mr-2 text-red-500">•</span>
                                            {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Deep Extraction (Proof of Read) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold font-display text-brand-dark dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                        <User className="w-5 h-5 mr-2 text-brand-teal" />
                        {t.education}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                <GraduationCap className="w-4 h-4 mr-2" /> Education
                            </h4>
                            <ul className="space-y-2">
                                {analysis.education?.length > 0 ? analysis.education.map((edu, i) => (
                                    <li key={i} className="text-sm text-brand-text dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">{edu}</li>
                                )) : <span className="text-gray-400 italic text-sm">None detected</span>}
                            </ul>
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                <Languages className="w-4 h-4 mr-2" /> {t.languages}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.languages?.length > 0 ? analysis.languages.map((lang, i) => (
                                    <span key={i} className="text-xs font-bold text-brand-dark dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/30">{lang}</span>
                                )) : <span className="text-gray-400 italic text-sm">None detected</span>}
                            </div>
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                <Sparkles className="w-4 h-4 mr-2" /> {t.interests}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.interests?.length > 0 ? analysis.interests.map((int, i) => (
                                    <span key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{int}</span>
                                )) : <span className="text-gray-400 italic text-sm">None detected</span>}
                            </div>
                         </div>
                    </div>
                </div>

                {/* 3. Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t.matched}</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matchingSkills?.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-brand-teal/10 text-brand-teal border border-brand-teal/20 text-sm font-bold">
                                    {skill}
                                </span>
                            )) || <span className="text-gray-400">None</span>}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t.missing}</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingSkills?.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600 text-sm line-through decoration-red-400 decoration-2">
                                    {skill}
                                </span>
                            )) || <span className="text-gray-400">None</span>}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* --- TAB: INTERVIEW --- */}
          {activeTab === 'interview' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-brand-violet/5 border border-brand-violet/20 p-6 rounded-2xl mb-6">
                    <h3 className="text-xl font-display font-bold text-brand-violet mb-2">{t.interviewTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {lang === 'fr' 
                            ? "Ces questions sont générées spécifiquement pour challenger les points faibles détectés dans le CV." 
                            : "These questions are specifically generated to challenge the weaknesses detected in the CV."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4 text-brand-dark dark:text-blue-400">
                            <Brain className="w-5 h-5 mr-2" />
                            <h4 className="font-bold text-lg">{t.techQuestions}</h4>
                        </div>
                        <ul className="space-y-4">
                            {analysis.interviewQuestions?.technical?.map((q, i) => (
                                <li key={i} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 border-l-4 border-brand-dark">
                                    "{q}"
                                </li>
                            )) || <p className="text-gray-400 italic">No technical questions generated.</p>}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4 text-brand-violet">
                            <User className="w-5 h-5 mr-2" />
                            <h4 className="font-bold text-lg">{t.softQuestions}</h4>
                        </div>
                        <ul className="space-y-4">
                            {analysis.interviewQuestions?.behavioral?.map((q, i) => (
                                <li key={i} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 border-l-4 border-brand-violet">
                                    "{q}"
                                </li>
                            )) || <p className="text-gray-400 italic">No behavioral questions generated.</p>}
                        </ul>
                    </div>
                </div>
            </div>
          )}

          {/* --- TAB: EMAIL --- */}
          {activeTab === 'email' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invite */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-200 dark:border-green-900 overflow-hidden flex flex-col">
                        <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-100 dark:border-green-900/30 flex justify-between items-center">
                            <span className="font-bold text-green-800 dark:text-green-400 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Invite
                            </span>
                            <button onClick={() => copyToClipboard(analysis.emailDrafts?.invite)} className="text-green-700 hover:text-green-900 dark:text-green-400">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
                            {analysis.emailDrafts?.invite || "No draft available."}
                        </div>
                    </div>

                    {/* Waitlist */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-900 overflow-hidden flex flex-col">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-4 border-b border-yellow-100 dark:border-yellow-900/30 flex justify-between items-center">
                            <span className="font-bold text-yellow-800 dark:text-yellow-400 flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> Waitlist
                            </span>
                            <button onClick={() => copyToClipboard(analysis.emailDrafts?.waitlist)} className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-400">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
                            {analysis.emailDrafts?.waitlist || "No draft available."}
                        </div>
                    </div>

                    {/* Reject */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900 overflow-hidden flex flex-col">
                         <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center">
                            <span className="font-bold text-red-800 dark:text-red-400 flex items-center">
                                <Ban className="w-4 h-4 mr-2" /> Reject
                            </span>
                            <button onClick={() => copyToClipboard(analysis.emailDrafts?.reject)} className="text-red-700 hover:text-red-900 dark:text-red-400">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
                            {analysis.emailDrafts?.reject || "No draft available."}
                        </div>
                    </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};