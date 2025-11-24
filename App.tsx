
import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, Loader2, RefreshCw, ChevronRight, CheckCircle2, Trash2, FileText as FileIcon, Moon, Sun, Archive, Menu, X, ShieldAlert, HeartHandshake, Clock, Scale, EyeOff, History, Upload } from 'lucide-react';
import { FileWithStatus, CandidateAnalysis, Language, Theme, ViewState, TranslationDictionary, AnalysisMode, StoredJobDescription, StoredCV } from './types';
import { FileUpload } from './components/FileUpload';
import { analyzeCandidate } from './services/geminiService';
import { AnalysisResult } from './components/AnalysisResult';

// --- TRANSLATIONS DICTIONARY ---
const TRANSLATIONS: TranslationDictionary = {
  fr: {
    heroTitle: "Assistant Recruteur IA",
    heroSubtitle: "Intelligence Artificielle RH",
    heroDesc: "Optimisez vos recrutements grâce à une analyse IA de pointe. Comparez instantanément vos candidats aux exigences du poste avec une précision inégalée.",
    navHome: "Espace de Travail",
    navArchive: "Mes Rapports",
    jdTitle: "1. Fiche de Poste",
    jdPlaceholder: "Collez la description stricte du poste ici...",
    jdBtnText: "Texte",
    jdBtnFile: "PDF",
    jdUploadLabel: "Déposez la fiche de poste (PDF)",
    jdHistoryLabel: "Fiches Récentes :",
    cvTitle: "2. Candidats (CVs)",
    cvReq: "PDF Requis",
    cvUploadLabel: "Déposez les CVs des candidats",
    cvBtnLabel: "Parcourir",
    cvHistoryLabel: "CVs Récents :",
    modeTitle: "3. Mode d'Analyse",
    modeStrictTitle: "Strict",
    modeStrictDesc: "Gatekeeper. Pénalise tout manquement. Idéal pour filtrer massivement.",
    modeBalancedTitle: "Équilibré",
    modeBalancedDesc: "Manager. Cherche le 'Fit'. Tolère les petits écarts.",
    modeFlexTitle: "Souple",
    modeFlexDesc: "Chasseur de tête. Valorise le potentiel et la motivation.",
    btnAnalyze: "Lancer l'Analyse",
    analyzing: "Analyse en cours...",
    poweredBy: "Propulsé par Gemini 2.5",
    resTitle: "Historique des Rapports",
    resSubtitle: "Rapports disponibles",
    retentionWarning: "Les rapports sont conservés 7 jours localement puis supprimés automatiquement.",
    btnClear: "Effacer l'historique",
    btnNew: "Nouvelle analyse",
    scoreMatch: "Adéquation",
    btnView: "Voir le rapport",
    errAnalysis: "Erreur",
    emptyHistory: "Aucun rapport récent ( < 7 jours).",
    waiting: "En attente",
    emailUnknown: "Email non détecté",
    topProfile: "Top Profil",
    modeLabel: "Mode",
    blindMode: "Recrutement à l'aveugle",
    blindModeDesc: "Masquer noms & emails"
  },
  en: {
    heroTitle: "AI Recruiting Assistant",
    heroSubtitle: "HR Artificial Intelligence",
    heroDesc: "Optimize your hiring process with state-of-the-art AI analysis. Instantly match candidates against job requirements with unmatched precision.",
    navHome: "Workspace",
    navArchive: "My Reports",
    jdTitle: "1. Job Description",
    jdPlaceholder: "Paste the job description here...",
    jdBtnText: "Text",
    jdBtnFile: "PDF",
    jdUploadLabel: "Drop Job Description (PDF)",
    jdHistoryLabel: "Recent JDs:",
    cvTitle: "2. Candidates (CVs)",
    cvReq: "PDF Required",
    cvUploadLabel: "Drop Candidate CVs",
    cvBtnLabel: "Browse",
    cvHistoryLabel: "Recent CVs:",
    modeTitle: "3. Analysis Mode",
    modeStrictTitle: "Strict",
    modeStrictDesc: "Gatekeeper. Penalizes everything. Good for high-volume filtering.",
    modeBalancedTitle: "Balanced",
    modeBalancedDesc: "Hiring Manager. Looks for fit. Tolerates minor gaps.",
    modeFlexTitle: "Flexible",
    modeFlexDesc: "Talent Scout. Values potential and motivation above all.",
    btnAnalyze: "Start Analysis",
    analyzing: "Analyzing...",
    poweredBy: "Powered by Gemini 2.5",
    resTitle: "Report History",
    resSubtitle: "Available reports",
    retentionWarning: "Reports are stored locally for 7 days and then automatically deleted.",
    btnClear: "Clear History",
    btnNew: "New Analysis",
    scoreMatch: "Match",
    btnView: "View Report",
    errAnalysis: "Error",
    emptyHistory: "No recent reports (< 7 days).",
    waiting: "Waiting",
    emailUnknown: "Email not detected",
    topProfile: "Top Profile",
    modeLabel: "Mode",
    blindMode: "Blind Recruitment",
    blindModeDesc: "Hide names & emails"
  }
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const App: React.FC = () => {
  // Settings
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('light');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('strict');
  const [blindMode, setBlindMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  // Inputs
  const [jdMode, setJdMode] = useState<'text' | 'file'>('text');
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jdHistory, setJdHistory] = useState<StoredJobDescription[]>([]);
  const [cvHistory, setCvHistory] = useState<StoredCV[]>([]);

  // Data & State
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [view, setView] = useState<ViewState>('HOME');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CandidateAnalysis | null>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('recruitai_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    // Load Files History
    const savedFiles = localStorage.getItem('recruitai_files');
    if (savedFiles) {
      try {
        const parsed: FileWithStatus[] = JSON.parse(savedFiles);
        // Filter out files older than 7 days
        const now = Date.now();
        const validFiles = parsed.filter(f => (now - f.timestamp) < SEVEN_DAYS_MS);
        setFiles(validFiles);
      } catch (e) { console.error("History load error", e); }
    }

    // Load JD History
    const savedJDs = localStorage.getItem('recruitai_jd_history');
    if (savedJDs) {
      try {
        const parsed = JSON.parse(savedJDs);
        setJdHistory(parsed);
      } catch (e) { console.error("JD History load error", e); }
    }

    // Load CV History
    const savedCVs = localStorage.getItem('recruitai_cv_history');
    if (savedCVs) {
      try {
        const parsed = JSON.parse(savedCVs);
        setCvHistory(parsed);
      } catch (e) { console.error("CV History load error", e); }
    }
  }, []);

  // Save Logic
  useEffect(() => {
    const filesToSave = files.map(f => ({
      id: f.id,
      fileName: f.fileName,
      status: f.status,
      result: f.result,
      timestamp: f.timestamp
    }));
    localStorage.setItem('recruitai_files', JSON.stringify(filesToSave));
  }, [files]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('recruitai_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // --- Handlers ---

  const handleFilesSelected = (newFiles: File[]) => {
    const filesWithStatus: FileWithStatus[] = newFiles.map(f => ({ 
      id: crypto.randomUUID(),
      fileName: f.name,
      file: f, 
      status: 'idle',
      timestamp: Date.now()
    }));
    setFiles(prev => [...prev, ...filesWithStatus]);
  };

  const handleJdFileSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) setJobDescriptionFile(newFiles[0]);
  };

  const clearHistory = () => {
    if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
      setFiles([]);
      localStorage.removeItem('recruitai_files');
    }
  };

  const deleteReport = (id: string) => {
    if(confirm("Supprimer ce rapport ?")) {
        setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const saveJdToHistory = (text: string) => {
    if (!text || text.length < 10) return;
    const title = text.split('\n')[0].substring(0, 30) + '...';
    
    setJdHistory(prev => {
        const filtered = prev.filter(item => item.content !== text);
        const newItem: StoredJobDescription = {
            id: crypto.randomUUID(),
            title,
            content: text,
            timestamp: Date.now()
        };
        const newHistory = [newItem, ...filtered].slice(0, 5); 
        localStorage.setItem('recruitai_jd_history', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  // Helper to convert base64 to file
  const base64ToFile = (base64: string, fileName: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, {type:mime});
  };

  const saveCvToHistory = async (file: File) => {
    try {
        const base64 = await fileToBase64(file);
        // Only save if file < 1MB to respect LocalStorage limits roughly
        if (file.size > 1024 * 1024) return;

        setCvHistory(prev => {
            const filtered = prev.filter(item => item.fileName !== file.name);
            const newItem: StoredCV = {
                id: crypto.randomUUID(),
                fileName: file.name,
                base64: base64,
                timestamp: Date.now()
            };
            // Keep only last 3 to be safe with storage
            const newHistory = [newItem, ...filtered].slice(0, 3);
            
            try {
                localStorage.setItem('recruitai_cv_history', JSON.stringify(newHistory));
                return newHistory;
            } catch (e) {
                console.warn("Storage quota exceeded, could not save CV history");
                return prev;
            }
        });
    } catch (e) {
        console.error("Error saving CV", e);
    }
  };

  const handleCvHistorySelect = (stored: StoredCV) => {
      try {
        const file = base64ToFile(stored.base64, stored.fileName);
        handleFilesSelected([file]);
      } catch (e) {
        console.error("Failed to restore file", e);
      }
  };

  const startAnalysis = async () => {
    const jdContent = jdMode === 'text' ? jobDescriptionText : jobDescriptionFile;
    if (!jdContent) return;
    
    // Save JD if text
    if (jdMode === 'text') {
        saveJdToHistory(jobDescriptionText);
    }
    
    // Save new CVs to history (only the idle ones that are about to be processed)
    const cvsToProcess = files.filter(f => f.status === 'idle' && f.file);
    for (const fileObj of cvsToProcess) {
        if (fileObj.file) {
            await saveCvToHistory(fileObj.file);
        }
    }

    setView('ARCHIVE');
    setAnalyzing(true);

    const newFilesState = [...files];
    
    for (let i = 0; i < newFilesState.length; i++) {
      if (newFilesState[i].status === 'done' || newFilesState[i].status === 'error') continue; 
      
      if (!newFilesState[i].file) {
         newFilesState[i].status = 'error'; 
         continue;
      }

      newFilesState[i] = { ...newFilesState[i], status: 'analyzing' };
      setFiles([...newFilesState]);

      try {
         const result = await analyzeCandidate(
            newFilesState[i].file!, 
            jdContent,
            language,
            analysisMode
         );
         newFilesState[i] = { 
           ...newFilesState[i], 
           status: 'done', 
           result 
         };
      } catch (error) {
        console.error(error);
        newFilesState[i] = { ...newFilesState[i], status: 'error' };
      }
      
      setFiles([...newFilesState]);
    }

    setAnalyzing(false);
  };

  // --- Render Sections ---

  const renderHeader = () => (
    <nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-brand-divider dark:border-gray-800 transition-colors duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => setView('HOME')}>
            <div className="relative w-10 h-10 mr-3">
              <div className="absolute inset-0 bg-brand-gradient rounded-xl transform rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-brand-gradient rounded-xl flex items-center justify-center shadow-lg shadow-brand-violet/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold font-display text-brand-dark dark:text-white tracking-tight">
              Recruit<span className="text-transparent bg-clip-text bg-brand-gradient">AI</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-6">
             <div className="flex space-x-1 bg-brand-bg dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
               <button 
                onClick={() => setView('HOME')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'HOME' ? 'bg-white dark:bg-gray-700 text-brand-dark dark:text-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-brand-dark'}`}
               >
                 {t.navHome}
               </button>
               <button 
                onClick={() => setView('ARCHIVE')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'ARCHIVE' ? 'bg-white dark:bg-gray-700 text-brand-dark dark:text-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-brand-dark'}`}
               >
                 {t.navArchive}
                 {files.length > 0 && <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-brand-violet text-white text-[10px] rounded-full">{files.length}</span>}
               </button>
             </div>

             <div className="flex items-center px-1 bg-brand-bg dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button onClick={() => setLanguage('fr')} className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'fr' ? 'bg-white dark:bg-gray-700 text-brand-dark dark:text-white shadow-sm' : 'text-gray-400'}`}>FR</button>
                <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 text-brand-dark dark:text-white shadow-sm' : 'text-gray-400'}`}>EN</button>
             </div>

             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-brand-dark dark:text-white transition-colors">
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
             <button onClick={toggleTheme} className="p-2 text-brand-dark dark:text-white">
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-brand-dark dark:text-white">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 shadow-xl">
             <button 
                onClick={() => { setView('HOME'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 font-bold ${view === 'HOME' ? 'bg-brand-bg text-brand-dark dark:bg-gray-800 dark:text-white' : 'text-gray-500'}`}
             >
                 {t.navHome}
             </button>
             <button 
                onClick={() => { setView('ARCHIVE'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 font-bold ${view === 'ARCHIVE' ? 'bg-brand-bg text-brand-dark dark:bg-gray-800 dark:text-white' : 'text-gray-500'}`}
             >
                 {t.navArchive}
             </button>
             <div className="flex space-x-2 mt-4 px-4">
                <button onClick={() => setLanguage('fr')} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${language === 'fr' ? 'border-brand-violet text-brand-violet' : 'border-gray-200 text-gray-500'}`}>FR</button>
                <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${language === 'en' ? 'border-brand-violet text-brand-violet' : 'border-gray-200 text-gray-500'}`}>EN</button>
             </div>
        </div>
      )}
    </nav>
  );

  const renderHome = () => (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="bg-brand-bg dark:bg-gray-900 pt-16 pb-20 border-b border-gray-200 dark:border-gray-800 transition-colors relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-dark/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-brand-violet font-bold text-xs uppercase tracking-widest mb-4 border border-brand-violet/20 shadow-sm">
            {t.heroSubtitle}
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-text dark:text-white leading-tight">
             {t.heroTitle}
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            {t.heroDesc}
          </p>
        </div>
      </section>

      {/* Workspace */}
      <section className="bg-white dark:bg-black/20 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            {/* Left Column: Job Description & Mode */}
            <div className="space-y-8">
                {/* 1. Job Description */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-brand-dark/5 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-brand-bg/50 dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-dark text-white flex items-center justify-center shadow-md shadow-brand-dark/20">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-display font-bold text-brand-text dark:text-white">{t.jdTitle}</h2>
                        </div>
                        <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
                            <button onClick={() => setJdMode('text')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${jdMode === 'text' ? 'bg-brand-dark text-white shadow-sm' : 'text-gray-500 hover:text-brand-dark dark:hover:text-white'}`}>{t.jdBtnText}</button>
                            <button onClick={() => setJdMode('file')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${jdMode === 'file' ? 'bg-brand-dark text-white shadow-sm' : 'text-gray-500 hover:text-brand-dark dark:hover:text-white'}`}>{t.jdBtnFile}</button>
                        </div>
                    </div>

                    <div className="p-8">
                        {jdMode === 'text' && jdHistory.length > 0 && (
                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.jdHistoryLabel}</span>
                                <div className="flex flex-wrap gap-2">
                                    {jdHistory.map(hist => (
                                        <button 
                                            key={hist.id}
                                            onClick={() => setJobDescriptionText(hist.content)}
                                            className="px-3 py-1 bg-brand-bg dark:bg-gray-700 text-xs text-brand-dark dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 hover:border-brand-violet hover:text-brand-violet transition-colors truncate max-w-[150px]"
                                            title={hist.content}
                                        >
                                            {hist.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {jdMode === 'text' ? (
                            <textarea
                            value={jobDescriptionText}
                            onChange={(e) => setJobDescriptionText(e.target.value)}
                            placeholder={t.jdPlaceholder}
                            className="w-full h-64 p-5 rounded-2xl border border-gray-200 dark:border-gray-600 bg-brand-bg dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-brand-violet focus:border-transparent resize-none text-base text-brand-text dark:text-gray-200 leading-relaxed placeholder:text-gray-400 transition-all"
                            />
                        ) : (
                            <div className="h-64 flex flex-col justify-center">
                            <FileUpload 
                                files={jobDescriptionFile ? [jobDescriptionFile] : []}
                                onFilesSelected={handleJdFileSelected}
                                onRemoveFile={() => setJobDescriptionFile(null)}
                                multiple={false}
                                label={t.jdUploadLabel}
                                btnLabel={t.cvBtnLabel}
                            />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Analysis Mode Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-brand-dark/5 dark:shadow-none border border-gray-100 dark:border-gray-700 p-8">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-display font-bold text-brand-text dark:text-white flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-brand-violet text-white flex items-center justify-center mr-3 shadow-md shadow-brand-violet/20">
                                <Scale className="w-4 h-4" />
                            </div>
                            {t.modeTitle}
                        </h2>
                        
                        {/* Blind Mode Toggle */}
                        <button 
                            onClick={() => setBlindMode(!blindMode)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${blindMode ? 'bg-brand-dark text-white border-brand-dark' : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-600'}`}
                        >
                            <EyeOff className="w-3 h-3" />
                            <span className="text-xs font-bold">{t.blindMode}</span>
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Strict Card */}
                        <button 
                            onClick={() => setAnalysisMode('strict')}
                            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group h-full flex flex-col
                                ${analysisMode === 'strict' 
                                ? 'border-brand-dark bg-brand-dark/5 dark:border-blue-500 dark:bg-blue-900/20 shadow-md ring-1 ring-brand-dark/10' 
                                : 'border-gray-200 hover:border-brand-dark/30 dark:border-gray-600'
                                }
                            `}
                        >
                             <div className="flex items-center mb-2">
                                <ShieldAlert className={`w-4 h-4 mr-2 ${analysisMode === 'strict' ? 'text-brand-dark' : 'text-gray-400'}`} />
                                <span className={`font-bold text-sm ${analysisMode === 'strict' ? 'text-brand-dark' : 'text-gray-600 dark:text-gray-300'}`}>{t.modeStrictTitle}</span>
                             </div>
                             <p className="text-[10px] text-gray-500 leading-relaxed">{t.modeStrictDesc}</p>
                             {analysisMode === 'strict' && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-dark"></div>}
                        </button>

                         {/* Balanced Card */}
                         <button 
                            onClick={() => setAnalysisMode('balanced')}
                            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group h-full flex flex-col
                                ${analysisMode === 'balanced' 
                                ? 'border-brand-violet bg-brand-violet/5 dark:border-violet-500 dark:bg-violet-900/20 shadow-md ring-1 ring-brand-violet/10' 
                                : 'border-gray-200 hover:border-brand-violet/30 dark:border-gray-600'
                                }
                            `}
                        >
                             <div className="flex items-center mb-2">
                                <Scale className={`w-4 h-4 mr-2 ${analysisMode === 'balanced' ? 'text-brand-violet' : 'text-gray-400'}`} />
                                <span className={`font-bold text-sm ${analysisMode === 'balanced' ? 'text-brand-violet' : 'text-gray-600 dark:text-gray-300'}`}>{t.modeBalancedTitle}</span>
                             </div>
                             <p className="text-[10px] text-gray-500 leading-relaxed">{t.modeBalancedDesc}</p>
                             {analysisMode === 'balanced' && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-violet"></div>}
                        </button>

                        {/* Flexible Card */}
                        <button 
                            onClick={() => setAnalysisMode('flexible')}
                            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group h-full flex flex-col
                                ${analysisMode === 'flexible' 
                                ? 'border-brand-teal bg-brand-teal/5 dark:border-teal-500 dark:bg-teal-900/20 shadow-md ring-1 ring-brand-teal/10' 
                                : 'border-gray-200 hover:border-brand-teal/30 dark:border-gray-600'
                                }
                            `}
                        >
                             <div className="flex items-center mb-2">
                                <HeartHandshake className={`w-4 h-4 mr-2 ${analysisMode === 'flexible' ? 'text-brand-teal' : 'text-gray-400'}`} />
                                <span className={`font-bold text-sm ${analysisMode === 'flexible' ? 'text-brand-teal' : 'text-gray-600 dark:text-gray-300'}`}>{t.modeFlexTitle}</span>
                             </div>
                             <p className="text-[10px] text-gray-500 leading-relaxed">{t.modeFlexDesc}</p>
                             {analysisMode === 'flexible' && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-teal"></div>}
                        </button>
                     </div>
                </div>
            </div>

            {/* 2. CV Upload & Action */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-brand-dark/5 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
               <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-brand-bg/50 dark:bg-gray-800">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal text-white flex items-center justify-center shadow-md shadow-brand-teal/20">
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-brand-text dark:text-white">{t.cvTitle}</h2>
                </div>
                 <div className="px-4 py-1.5 bg-brand-teal/10 text-brand-teal dark:text-teal-300 text-xs font-bold rounded-full border border-brand-teal/20">
                   {t.cvReq}
                 </div>
              </div>

              <div className="p-8 flex flex-col h-full">
                
                {cvHistory.length > 0 && (
                    <div className="mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.cvHistoryLabel}</span>
                        <div className="flex flex-wrap gap-2">
                            {cvHistory.map(hist => (
                                <button 
                                    key={hist.id}
                                    onClick={() => handleCvHistorySelect(hist)}
                                    className="px-3 py-1 bg-brand-bg dark:bg-gray-700 text-xs text-brand-dark dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 hover:border-brand-violet hover:text-brand-violet transition-colors flex items-center"
                                    title={hist.fileName}
                                >
                                    <FileIcon className="w-3 h-3 mr-1" />
                                    {hist.fileName}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <FileUpload 
                  files={files.filter(f => f.status === 'idle').map(f => f.file!).filter(Boolean)} 
                  onFilesSelected={handleFilesSelected} 
                  onRemoveFile={(idx) => {
                      const idleFiles = files.filter(f => f.status === 'idle');
                      const fileToRemove = idleFiles[idx];
                      if (fileToRemove) {
                          setFiles(prev => prev.filter(f => f.id !== fileToRemove.id));
                      }
                  }} 
                  label={t.cvUploadLabel}
                  btnLabel={t.cvBtnLabel}
                />
                
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={startAnalysis}
                    disabled={analyzing || files.filter(f => f.status === 'idle').length === 0 || (jdMode === 'text' ? !jobDescriptionText.trim() : !jobDescriptionFile)}
                    className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center text-lg font-bold font-display transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden group
                      ${(files.filter(f => f.status === 'idle').length === 0 || (jdMode === 'text' ? !jobDescriptionText.trim() : !jobDescriptionFile))
                        ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-brand-gradient text-white shadow-brand-violet/30 hover:shadow-brand-violet/50'
                      }`}
                  >
                    <span className="relative flex items-center z-10">
                      {analyzing ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            {t.analyzing}
                          </>
                      ) : (
                          <>
                            {t.btnAnalyze}
                            <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-brand-gradient-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                    {t.poweredBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderArchive = () => {
    const sortedFiles = [...files].reverse();

    return (
      <div className="animate-in fade-in duration-500 min-h-[calc(100vh-80px)] bg-brand-bg dark:bg-gray-900 transition-colors">
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 7-Day Warning Banner */}
            <div className="bg-white dark:bg-gray-800 border-l-4 border-orange-400 rounded-r-xl p-4 mb-8 flex items-start shadow-sm">
               <Clock className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
               <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.retentionWarning}</p>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-display font-bold text-brand-dark dark:text-white">{t.resTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  {files.filter(f => f.status === 'done').length} {t.resSubtitle}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                 {files.length > 0 && (
                    <button 
                        onClick={clearHistory}
                        className="flex items-center px-5 py-2.5 text-sm font-bold text-red-600 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-sm"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t.btnClear}
                    </button>
                 )}
                 <button 
                    onClick={() => setView('HOME')}
                    className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-brand-dark rounded-xl hover:bg-brand-dark/90 transition-colors shadow-lg shadow-brand-dark/20"
                 >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.btnNew}
                 </button>
              </div>
            </div>

            {/* Empty State */}
            {sortedFiles.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="w-20 h-20 bg-brand-bg dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Archive className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 font-display">{t.emptyHistory}</h3>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
              {sortedFiles.map((fileObj) => {
                const isDone = fileObj.status === 'done';
                const isAnalyzing = fileObj.status === 'analyzing';
                const score = fileObj.result?.score || 0;
                
                return (
                  <div 
                    key={fileObj.id}
                    className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 group
                      ${isAnalyzing 
                        ? 'border-brand-violet/40 shadow-lg shadow-brand-violet/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-violet/50 hover:shadow-xl hover:shadow-brand-violet/5'
                      }
                    `}
                  >
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Left: Info */}
                      <div className="flex items-center space-x-6">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl font-display shadow-inner transition-transform group-hover:scale-105 flex-shrink-0
                            ${!isDone ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 
                              score >= 80 ? 'bg-brand-teal text-white' :
                              score >= 50 ? 'bg-yellow-400 text-white' : 'bg-red-500 text-white'
                            }
                         `}>
                           {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin text-brand-violet" /> : (isDone ? score : '-')}
                         </div>
                         <div>
                           <h3 className="font-bold text-xl font-display text-brand-text dark:text-white group-hover:text-brand-violet transition-colors flex items-center">
                             {isDone ? (blindMode ? t.blindModeDesc : fileObj.result?.candidateName) : fileObj.fileName}
                             {blindMode && isDone && <EyeOff className="w-4 h-4 ml-2 text-gray-400" />}
                           </h3>
                           <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2 mt-1">
                             <span className="flex items-center">
                                {isAnalyzing
                                    ? <span className="text-brand-violet font-bold animate-pulse">{t.analyzing}</span> 
                                    : (isDone ? (!blindMode && fileObj.result?.email || t.emailUnknown) : t.waiting)}
                             </span>
                             {isDone && fileObj.result?.modeUsed && (
                                <span className={`text-[10px] uppercase font-bold border px-2 py-0.5 rounded-full
                                    ${fileObj.result.modeUsed === 'strict' ? 'text-brand-dark border-brand-dark/20' : 
                                      fileObj.result.modeUsed === 'balanced' ? 'text-brand-violet border-brand-violet/20' : 
                                      'text-brand-teal border-brand-teal/20'}
                                `}>
                                    {t.modeLabel}: {fileObj.result.modeUsed}
                                </span>
                             )}
                             {isDone && fileObj.result?.recommendation === 'HIRE' && (
                               <span className="bg-brand-teal/10 text-brand-teal text-xs px-3 py-1 rounded-full font-bold border border-brand-teal/20 flex items-center">
                                 <CheckCircle2 className="w-3 h-3 mr-1" />
                                 {t.topProfile}
                               </span>
                             )}
                           </div>
                         </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                        {isDone && (
                          <>
                            <div className="hidden lg:block text-right min-w-[160px] mr-4">
                               <div className="flex justify-between text-xs uppercase font-bold text-gray-400 mb-2 tracking-wider">
                                    <span>{t.scoreMatch}</span>
                                    <span>{score}%</span>
                               </div>
                               <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out
                                        ${score >= 80 ? 'bg-brand-teal' : score >= 50 ? 'bg-yellow-400' : 'bg-red-500'}
                                    `} 
                                    style={{ width: `${score}%` }}
                                 />
                               </div>
                            </div>
                            <button 
                              onClick={() => deleteReport(fileObj.id)}
                              className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                              title="Supprimer ce rapport"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => fileObj.result && setSelectedAnalysis(fileObj.result)}
                              className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 rounded-xl bg-brand-bg dark:bg-gray-700/50 text-brand-dark dark:text-white hover:bg-brand-violet/10 hover:text-brand-violet dark:hover:text-brand-violet border border-gray-200 dark:border-gray-600 hover:border-brand-violet/30 transition-all text-sm font-bold shadow-sm"
                            >
                              {t.btnView}
                              <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
                            </button>
                          </>
                        )}
                        {fileObj.status === 'error' && (
                           <div className="flex items-center gap-2">
                             <span className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/30">{t.errAnalysis}</span>
                             <button 
                              onClick={() => deleteReport(fileObj.id)}
                              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-brand-bg dark:bg-gray-900 min-h-screen selection:bg-brand-violet selection:text-white font-sans">
        {renderHeader()}
        <main>
          {view === 'HOME' ? renderHome() : renderArchive()}
        </main>
        {selectedAnalysis && (
          <AnalysisResult 
            analysis={selectedAnalysis} 
            onClose={() => setSelectedAnalysis(null)}
            lang={language}
            blindMode={blindMode}
          />
        )}
      </div>
    </div>
  );
};

export default App;
