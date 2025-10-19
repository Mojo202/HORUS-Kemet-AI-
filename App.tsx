import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import InputSection from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import Footer from './components/Footer';
import { ContentType, ParsedArticle, GeneratedArticle, BloggerBlog, BloggerUser, AppSettings, CustomFont, PagePreferences, DifficultyLevel, Profile, HorusTemplate, ToolType, ApiKey } from './types';
import { parseRawInput } from './utils/parser';
import { generateArticleContent, classifyNewsSubCategory } from './services/geminiService';
import { bloggerService, BloggerConfig } from './services/bloggerService';
import { apiKeyManager } from './apiKeyManager';
import Alert from './components/Alert';
import FavoritesModal from './components/FavoritesModal';
import { XmlEditor } from './components/XmlEditor';
import { CONTENT_TYPE_OPTIONS, TOOL_OPTIONS } from './constants';
import StaticPageModal from './components/StaticPageModal';
import { ImageStudio } from './components/ImageStudio';
import HomePage from './components/HomePage';
import FontManager from './components/FontManager';
import { initDB, getFonts } from './utils/fontDb';
import SeoStudio from './components/tools/SeoStudio';
import ProfileManagerModal from './components/ProfileManagerModal';
import SchemaFixerModal from './components/SchemaFixerModal';
import { QA_SCHEMA_TEMPLATE } from './services/horusProtocol';
import { VideoStudio } from './components/VideoStudio';
import { STATIC_PAGES } from './staticContent';
import BloggerCleaner from './components/tools/BloggerCleaner';
import CodeConverter from './components/tools/CodeConverter';
import WebpConverter from './components/tools/WebpConverter';
import WordCounter from './components/tools/WordCounter';
import ChatGpt from './components/tools/ChatGpt';
import CssMinifier from './components/tools/CssMinifier';
import AiContentDetector from './components/tools/AiContentDetector';
import PrivacyPolicyGenerator from './components/tools/PrivacyPolicyGenerator';
import TermsOfUseGenerator from './components/tools/TermsOfUseGenerator';
import AboutUsGenerator from './components/tools/AboutUsGenerator';
import RobotsTxtGenerator from './components/tools/RobotsTxtGenerator';
import SitemapGenerator from './components/tools/SitemapGenerator';
import CodeEditor from './components/tools/CodeEditor';
import ContactUsGenerator from './components/tools/ContactUsGenerator';
import KeywordTool from './components/tools/KeywordTool';
import BacklinkChecker from './components/tools/BacklinkChecker';
import PlagiarismChecker from './components/tools/PlagiarismChecker';
import NanoBananaStudio from './components/tools/NanoBananaStudio';
import GuideSection from './components/GuideSection';
import HoroscopeVideoStudio from './components/HoroscopeVideoStudio';
import HorusForge from './components/HorusForge';
import SocialMediaPostGenerator from './components/tools/SocialMediaPostGenerator';
import HeadlineAnalyzer from './components/tools/HeadlineAnalyzer';
import ShortVideoScriptWriter from './components/tools/ShortVideoScriptWriter';
import AdvancedImageEnhancer from './components/tools/AdvancedImageEnhancer';
import EcommerceStudio from './components/tools/EcommerceStudio';
import EmailMarketingGenerator from './components/tools/EmailMarketingGenerator';
import ElearningStudio from './components/tools/ElearningStudio';
import PodcastScriptGenerator from './components/tools/PodcastScriptGenerator';
import { PageBanner } from './components/PageBanner';


const HorusEyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 65" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,30 Q50,0 95,30 Q50,60 5,30 Z" fill="none"/>
      <circle cx="50" cy="30" r="12" fill="white" stroke="none" />
      <path d="M50,42 V55 L40,58" fill="none"/>
      <path d="M95,30 C90,45 80,55 75,58" fill="none"/>
    </svg>
);


type Theme = 'light' | 'dark';
const ESTIMATED_TIME_PER_ARTICLE_SECONDS = 150;

const useHistoryState = <T,>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void, () => void, () => void, boolean, boolean, () => void] => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [index, setIndex] = useState(0);

    const setState = useCallback((action: T | ((prevState: T) => T)) => {
        setHistory(currentHistory => {
            const currentIndex = Math.min(index, currentHistory.length - 1);
            const currentState = currentHistory[currentIndex];
            const newState = typeof action === 'function' ? (action as (prevState: T) => T)(currentState) : action;
            const newHistorySlice = currentHistory.slice(0, currentIndex + 1);
            const newHistory = [...newHistorySlice, newState];
            setIndex(newHistory.length - 1);
            return newHistory;
        });
    }, [index]);

    const undo = useCallback(() => {
        setIndex(prev => Math.max(0, prev - 1));
    }, []);

    const redo = useCallback(() => {
        setIndex(prev => Math.min(history.length - 1, prev + 1));
    }, [history.length]);

    const resetHistory = useCallback((state?: T) => {
        const resetState = state ?? initialState;
        setHistory([resetState]);
        setIndex(0);
    }, [initialState]);

    const canUndo = index > 0;
    const canRedo = index < history.length - 1;

    return [history[index], setState, undo, redo, canUndo, canRedo, resetHistory];
};


const bloggerConfig: BloggerConfig = {
    apiKey: 'AIzaSyCIFl-yril-715SKM6iMugnDhlmqJpknxs', 
    clientId: '454773767191-kssisjcgo0tgagn1gpahgutmkfq18tvc.apps.googleusercontent.com' 
};

const PERSONA_KEY = 'horusPersonaSettings_v1';
const GLOBAL_PERSONA_KEY = 'horusGlobalPersona_v1';
const SOURCE_LIBRARY_KEY = 'horusSourceLibrary_v1';
const FAVORITES_KEY = 'horusFavoriteArticles_v1';
const PROFILES_KEY = 'horusProfiles_v2';
const SESSION_LOG_KEY = 'horusV13SessionLog';


interface ContentCreationPageProps {
    contentType: ContentType;
    onNavigate: (page: ContentType | 'home' | ToolType) => void;
    globalProps: any;
}

const ContentCreationPage: React.FC<ContentCreationPageProps> = ({ contentType, onNavigate, globalProps }) => {
    const {
        logStatus, setError,
        isBloggerAuthenticated, bloggerUser, bloggerBlogs, selectedBlogId, setSelectedBlogId,
        handleBloggerConnect, handleBloggerDisconnect, publishingStatus, handlePublishToBlogger, isPublishDisabled,
        rawInput, setRawInput,
        preferences, setWordCount, setSportsMedicineLanguage, setSelectedNewsSubCategories, setDifficultyLevel, setImageAspectRatio, setVideoOption,
        setFillDynamicPlaceholders,
        setSelectedTextModel, setSelectedImageModel, setOverrideImageSlug, setSelectedImageStyle, setSelectedTypographyStyle,
        manualSourcesInput, setManualSourcesInput,
        useInternetSearch, setUseInternetSearch,
        customPersona, setCustomPersona,
        isGenerating, isGeneratingAll,
        parsedArticles, setParsedArticles, // Added setParsedArticles
        handleGlobalGenerate, handleGenerateArticle, handleStopGeneration,
        selectedSourcesByArticle, setSelectedSourcesByArticle,
        personalTouchByArticle, setPersonalTouchByArticle,
        isMedicalPromptActive,
        horoscopeImagePrompt, setHoroscopeImagePrompt,
        cookingImagePrompt, setCookingImagePrompt,
        newsImagePrompt, setNewsImagePrompt,
        generatedArticles,
        handleUpdateArticleImage, handleArticleUpdate,
        handleFinalizeArticle,
        handleCorrectSchema,
        generationLog, handleSaveLog, handleLoadLog, handleClearLog,
        customFonts,
    } = globalProps;

    const pageConfig = useMemo(() => CONTENT_TYPE_OPTIONS.find(o => o.value === contentType)!, [contentType]);
    const { wordCount, sportsMedicineLanguage, selectedNewsSubCategories, difficultyLevel, imageAspectRatio, videoOption, selectedTextModel, selectedImageModel, overrideImageSlug, fillDynamicPlaceholders, selectedImageStyle, selectedTypographyStyle } = preferences;

    const NewsSubCategorySelector: React.FC = () => {
        if (contentType !== ContentType.News || !pageConfig.subCategories) return null;

        const handleSubCatChange = (value: string, isChecked: boolean) => {
            const currentSubCats = selectedNewsSubCategories || [];
            if (isChecked) {
                if (!currentSubCats.includes(value)) {
                    setSelectedNewsSubCategories([...currentSubCats, value]);
                }
            } else {
                setSelectedNewsSubCategories(currentSubCats.filter(cat => cat !== value));
            }
        };

        return (
            <div className="p-3 bg-gray-900/50 rounded-lg border border-cyan-500/30">
                <h4 className="text-xs font-semibold text-center text-cyan-400 mb-2">اختر أقسام الأخبار (مطلوب واحد على الأقل)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {pageConfig.subCategories.map(subCat => (
                        <label key={subCat.value} className="flex items-center gap-2 p-1.5 bg-gray-800/60 rounded-md cursor-pointer hover:bg-gray-700/60">
                            <input
                                type="checkbox"
                                value={subCat.value}
                                checked={(selectedNewsSubCategories || []).includes(subCat.value)}
                                onChange={e => handleSubCatChange(e.target.value, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-900"
                            />
                            <span className="text-gray-300">{subCat.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <button onClick={() => onNavigate('home')} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title={`إنشاء محتوى ${pageConfig.label}`} iconClass={pageConfig.iconClass} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
                <div className="flex flex-col gap-6">
                    <Controls
                        contentType={contentType}
                        onGenerate={() => handleGlobalGenerate(false, customPersona)}
                        onGenerateAll={() => handleGlobalGenerate(true, customPersona)}
                        onGenerateArticle={(index) => handleGenerateArticle(index, customPersona)}
                        onStopGeneration={handleStopGeneration}
                        isGenerating={isGenerating}
                        isGeneratingAll={isGeneratingAll}
                        isDisabled={parsedArticles.length === 0 || (!apiKeyManager.hasGeminiKeys() && !apiKeyManager.hasOpenAIKeys()) || (contentType === ContentType.News && (selectedNewsSubCategories || []).length === 0)}
                        wordCount={wordCount}
                        setWordCount={setWordCount}
                        manualSourcesInput={manualSourcesInput}
                        setManualSourcesInput={setManualSourcesInput}
                        sportsMedicineLanguage={sportsMedicineLanguage}
                        setSportsMedicineLanguage={setSportsMedicineLanguage}
                        useInternetSearch={useInternetSearch}
                        setUseInternetSearch={setUseInternetSearch}
                        videoOption={videoOption}
                        setVideoOption={setVideoOption}
                        fillDynamicPlaceholders={fillDynamicPlaceholders || false}
                        setFillDynamicPlaceholders={setFillDynamicPlaceholders}
                        customPersona={customPersona}
                        setCustomPersona={setCustomPersona}
                        sourceLibrary={globalProps.sourceLibrary}
                        setSourceLibrary={globalProps.setSourceLibrary}
                        isBloggerAuthenticated={isBloggerAuthenticated}
                        bloggerUser={bloggerUser}
                        bloggerBlogs={bloggerBlogs}
                        selectedBlogId={selectedBlogId}
                        setSelectedBlogId={setSelectedBlogId}
                        onBloggerConnect={handleBloggerConnect}
                        onBloggerDisconnect={handleBloggerDisconnect}
                        personalTouchByArticle={personalTouchByArticle}
                        setPersonalTouchByArticle={setPersonalTouchByArticle}
                        parsedArticles={parsedArticles}
                        setParsedArticles={setParsedArticles} // Pass setter down
                        selectedSourcesByArticle={selectedSourcesByArticle}
                        setSelectedSourcesByArticle={setSelectedSourcesByArticle}
                        selectedTextModel={selectedTextModel}
                        setSelectedTextModel={setSelectedTextModel}
                        isMedicalPromptActive={isMedicalPromptActive}
                        difficultyLevel={difficultyLevel}
                        setDifficultyLevel={setDifficultyLevel}
                        onHoroscopePromptSelect={setHoroscopeImagePrompt}
                        selectedHoroscopePrompt={horoscopeImagePrompt}
                        onCookingPromptSelect={setCookingImagePrompt}
                        selectedCookingPrompt={cookingImagePrompt}
                        logStatus={logStatus}
                        setError={setError}
                        overrideImageSlug={overrideImageSlug || ''}
                        setOverrideImageSlug={setOverrideImageSlug}
                        onNewsPromptSelect={setNewsImagePrompt}
                        selectedNewsPrompt={newsImagePrompt}
                        selectedImageStyle={selectedImageStyle}
                        setSelectedImageStyle={setSelectedImageStyle}
                        selectedTypographyStyle={selectedTypographyStyle}
                        setSelectedTypographyStyle={setSelectedTypographyStyle}
                    />
                    <NewsSubCategorySelector />
                    <InputSection rawInput={rawInput} setRawInput={setRawInput} setError={setError} />
                </div>
                <OutputSection
                    contentType={contentType}
                    articles={generatedArticles}
                    isLoading={isGeneratingAll || Object.values(isGenerating).some(Boolean)}
                    onImageUpdate={handleUpdateArticleImage}
                    onArticleUpdate={handleArticleUpdate}
                    setError={setError}
                    setWarning={globalProps.setWarning}
                    imgbbApiKey={globalProps.imgbbApiKey.key}
                    generationLog={generationLog}
                    logStatus={logStatus}
                    totalGenerationTime={globalProps.totalGenerationTime}
                    onPublish={handlePublishToBlogger}
                    publishingStatus={publishingStatus}
                    isPublishDisabled={isPublishDisabled}
                    selectedTextModel={selectedTextModel}
                    onFinalizeArticle={handleFinalizeArticle}
                    onCorrectSchema={handleCorrectSchema}
                    onSaveLog={handleSaveLog}
                    onLoadLog={handleLoadLog}
                    onClearLog={handleClearLog}
                    customFonts={customFonts}
                />
            </div>
             <GuideSection 
                contentType={contentType} 
                description="انقر على الزر أدناه لعرض أو إخفاء دليل شامل ونصائح SEO متقدمة خاصة بهذا النوع من المحتوى."
             />
        </>
    );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<ContentType | 'home' | ToolType>('home');

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  
  const [geminiApiKeys, setGeminiApiKeys] = useState<ApiKey[]>([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState<number>(0);
  const [openaiApiKeys, setOpenaiApiKeys] = useState<ApiKey[]>([]);
  const [activeOpenAIKeyIndex, setActiveOpenAIKeyIndex] = useState<number>(0);
  const [imgbbApiKey, setImgbbApiKey] = useState<ApiKey>({ key: '', status: 'unknown' });
  const [youtubeApiKey, setYoutubeApiKey] = useState<ApiKey>({ key: '', status: 'unknown' });
  
  const [globalCustomPersona, setGlobalCustomPersona] = useState<{ instructions: string; htmlTemplate: string; }>(() => {
      try {
        const saved = localStorage.getItem(GLOBAL_PERSONA_KEY);
        return saved ? JSON.parse(saved) : { instructions: '', htmlTemplate: '' };
      } catch (e) {
        console.error("Failed to parse global custom persona from localStorage", e);
        return { instructions: '', htmlTemplate: '' };
      }
  });
  const [sourceLibrary, setSourceLibrary] = useState<{ [key in ContentType]?: string }>(() => {
      try {
        const saved = localStorage.getItem(SOURCE_LIBRARY_KEY);
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        console.error("Failed to parse source library from localStorage", e);
        return {};
      }
  });
   const [favoriteArticles, setFavoriteArticles] = useState<GeneratedArticle[]>(() => {
      try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to parse favorite articles from localStorage", e);
        return [];
      }
  });
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  
  const initialEditorArticles = useMemo(() => [], []);
  const [editorArticles, setEditorArticles, undoEditor, redoEditor, canUndoEditor, canRedoEditor, resetEditor] = useHistoryState<GeneratedArticle[]>(initialEditorArticles);
  
  const [activePageControls, setActivePageControls] = useState({
      undo: () => {}, redo: () => {}, canUndo: false, canRedo: false
  });
  const [isGeneratingGlobal, setIsGeneratingGlobal] = useState(false);

  const [isBloggerAuthenticated, setIsBloggerAuthenticated] = useState(false);
  const [bloggerUser, setBloggerUser] = useState<BloggerUser | null>(null);
  const [bloggerBlogs, setBloggerBlogs] = useState<BloggerBlog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(() => localStorage.getItem('selectedBlogId'));
  const [publishingStatus, setPublishingStatus] = useState<{ [key: number]: 'idle' | 'publishing' | 'published' | 'error' }>({});
  const [isGoogleClientReady, setIsGoogleClientReady] = useState(false);

  const [activeStaticPage, setActiveStaticPage] = useState<'about' | 'privacy' | 'terms' | null>(null);

  const [isFontManagerOpen, setIsFontManagerOpen] = useState(false);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(PROFILES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [profileToLoad, setProfileToLoad] = useState<Profile | null>(null);
  const getCurrentSettingsRef = useRef<() => Omit<Profile, 'id' | 'name'>>(() => ({} as any));

  // --- START: State for ContentCreationPage ---
    const [rawInput, setRawInput] = useState<string>('');
     const [customPersona, setCustomPersona] = useState<{ instructions: string; htmlTemplate: string; }>({ instructions: '', htmlTemplate: '' });
    const defaultPagePreferences: PagePreferences = {
        wordCount: 1000,
        sportsMedicineLanguage: 'ar',
        selectedNewsSubCategories: [],
        difficultyLevel: 'medium',
        imageAspectRatio: '16:9',
        videoOption: 'none',
        selectedTextModel: 'gemini-2.5-flash',
        selectedImageModel: 'imagen-4.0-generate-001',
        overrideImageSlug: '',
        fillDynamicPlaceholders: false,
        selectedImageStyle: '',
        selectedTypographyStyle: 'none',
    };
    const [preferences, setPreferences] = useState<PagePreferences>(defaultPagePreferences);
    const [manualSourcesInput, setManualSourcesInput] = useState<string>('');
    const [useInternetSearch, setUseInternetSearch] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<Record<number, boolean>>({});
    const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
    const [parsedArticles, setParsedArticles] = useState<ParsedArticle[]>([]);
    const [generationLog, setGenerationLog] = useState<string[]>([]);
    const [isMedicalPromptActive, setIsMedicalPromptActive] = useState(false);
    const [totalGenerationTime, setTotalGenerationTime] = useState(ESTIMATED_TIME_PER_ARTICLE_SECONDS);
    const [selectedSourcesByArticle, setSelectedSourcesByArticle] = useState<{ [key: number]: Set<string> }>({});
    const [personalTouchByArticle, setPersonalTouchByArticle] = useState<{ [key: number]: string }>({});
    const [horoscopeImagePrompt, setHoroscopeImagePrompt] = useState<string | null>(null);
    const [cookingImagePrompt, setCookingImagePrompt] = useState<string | null>(null);
    const [newsImagePrompt, setNewsImagePrompt] = useState<string | null>(null);
    const initialGeneratedArticles = useMemo(() => [], []);
    const [generatedArticles, setGeneratedArticles, undoGenerated, redoGenerated, canUndoGenerated, canRedoGenerated, resetGenerated] = useHistoryState<GeneratedArticle[]>(initialGeneratedArticles);
    const stopGenerationRef = useRef(false);
  // --- END: State for ContentCreationPage ---
  
  // --- START: State for SchemaFixerModal ---
    const [schemaFixerState, setSchemaFixerState] = useState<{
        isOpen: boolean;
        article: GeneratedArticle | null;
        articleText: string;
        incorrectSchema: string;
        correctedSchema: string;
    }>({ isOpen: false, article: null, articleText: '', incorrectSchema: '', correctedSchema: '' });
    const [isApplyingSchemaFix, setIsApplyingSchemaFix] = useState(false);
  // --- END: State for SchemaFixerModal ---

  const logStatus = useCallback((message: string) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
    setGenerationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // --- START: Logic for Session Log Manager ---
  const handleSaveLog = useCallback(() => {
    try {
        localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(generationLog));
        logStatus("💾 تم حفظ السجل في المتصفح.");
    } catch (e) {
        setError("فشل حفظ السجل. قد تكون مساحة التخزين ممتلئة.");
    }
  }, [generationLog, setError, logStatus]);

  const handleLoadLog = useCallback(() => {
    try {
        const savedLog = localStorage.getItem(SESSION_LOG_KEY);
        if (savedLog) {
            setGenerationLog(JSON.parse(savedLog));
            logStatus("🔄 تم تحميل آخر سجل محفوظ.");
        }
    } catch (e) {
        setError("فشل في تحليل السجل المحفوظ.");
    }
  }, [setError, logStatus]);

  const handleClearLog = useCallback(() => {
    localStorage.removeItem(SESSION_LOG_KEY);
    setGenerationLog([]);
    logStatus("🗑️ تم مسح السجل الحالي والمحفوظ.");
  }, [logStatus]);
  
  useEffect(() => {
      handleLoadLog();
  }, [handleLoadLog]);
  // --- END: Logic for Session Log Manager ---


  // --- START: Logic for ContentCreationPage ---
    const storageKeyPrefix = useMemo(() => {
        if (currentPage === 'home' || Object.values(ToolType).includes(currentPage as ToolType) || currentPage === ContentType.AdvancedEditor || currentPage === ContentType.ImageStudio || currentPage === ContentType.SeoStudio || currentPage === ContentType.VideoStudio || currentPage === ContentType.HoroscopeVideoStudio || currentPage === ContentType.HorusForge) return null;
        return currentPage.replace(/\s/g, '_');
    }, [currentPage]);
    
    // Load state when page changes
    useEffect(() => {
        if (storageKeyPrefix) {
            setRawInput(localStorage.getItem(`${storageKeyPrefix}_rawInput`) || '');
            const savedPersona = localStorage.getItem(`${storageKeyPrefix}_persona`);
            setCustomPersona(savedPersona ? JSON.parse(savedPersona) : { instructions: '', htmlTemplate: '' });

            const savedPrefs = localStorage.getItem(`${storageKeyPrefix}_preferences`);
            const pageConfig = CONTENT_TYPE_OPTIONS.find(o => o.value === currentPage);
            
            const defaultPrefs: PagePreferences = {
                ...defaultPagePreferences,
                selectedNewsSubCategories: pageConfig?.subCategories ? [pageConfig.subCategories[0].value] : [],
            };

            if (savedPrefs) {
                try {
                    const parsed = JSON.parse(savedPrefs);
                    setPreferences({ ...defaultPrefs, ...parsed });
                } catch { setPreferences(defaultPrefs); }
            } else {
                setPreferences(defaultPrefs);
            }
        }
        // Reset generation state on navigation
        resetGenerated();
        setParsedArticles([]);
        setPersonalTouchByArticle({});
        setSelectedSourcesByArticle({});
        // Do not clear generation log on navigation
        // setGenerationLog([]);

    }, [currentPage, storageKeyPrefix, resetGenerated]);

    // Save state when it changes
    useEffect(() => { if (storageKeyPrefix) localStorage.setItem(`${storageKeyPrefix}_rawInput`, rawInput); }, [rawInput, storageKeyPrefix]);
    useEffect(() => { if (storageKeyPrefix) localStorage.setItem(`${storageKeyPrefix}_persona`, JSON.stringify(customPersona)); }, [customPersona, storageKeyPrefix]);
    useEffect(() => { if (storageKeyPrefix) localStorage.setItem(`${storageKeyPrefix}_preferences`, JSON.stringify(preferences)); }, [preferences, storageKeyPrefix]);

    const setWordCount = (newWordCount: number) => setPreferences(p => ({ ...p, wordCount: newWordCount }));
    const setSportsMedicineLanguage = (newLang: 'ar' | 'en') => setPreferences(p => ({ ...p, sportsMedicineLanguage: newLang }));
    const setSelectedNewsSubCategories = (newSubCats: string[]) => setPreferences(p => ({ ...p, selectedNewsSubCategories: newSubCats }));
    const setDifficultyLevel = (newDifficulty: DifficultyLevel) => setPreferences(p => ({...p, difficultyLevel: newDifficulty }));
    const setImageAspectRatio = (newRatio: '16:9' | '1:1' | '9:16' | '4:3' | '3:4') => setPreferences(p => ({ ...p, imageAspectRatio: newRatio }));
    const setVideoOption = (newOption: 'none' | 'youtube' | 'veo') => setPreferences(p => ({ ...p, videoOption: newOption }));
    const setFillDynamicPlaceholders = (fill: boolean) => setPreferences(p => ({...p, fillDynamicPlaceholders: fill}));
    const setSelectedTextModel = (model: string) => setPreferences(p => ({ ...p, selectedTextModel: model }));
    const setSelectedImageModel = (model: string) => setPreferences(p => ({ ...p, selectedImageModel: model }));
    const setOverrideImageSlug = (slug: string) => setPreferences(p => ({ ...p, overrideImageSlug: slug }));
    const setSelectedImageStyle = (style: string) => setPreferences(p => ({ ...p, selectedImageStyle: style }));
    const setSelectedTypographyStyle = (style: string) => setPreferences(p => ({ ...p, selectedTypographyStyle: style }));

    useEffect(() => {
        const newParsedArticles = parseRawInput(rawInput) as ParsedArticle[];
        setParsedArticles(newParsedArticles);
        const newSelectedSources: { [key: number]: Set<string> } = {};
        newParsedArticles.forEach((article, index) => {
            newSelectedSources[index] = new Set(article.sources.map(s => s.url));
        });
        setPersonalTouchByArticle({});
    }, [rawInput]);

    const handleStopGeneration = useCallback(() => {
        stopGenerationRef.current = true;
        logStatus("🛑 تم طلب إيقاف عملية الإنشاء. سيتم التوقف بعد المقال الحالي.");
    }, [logStatus]);

    const handleGenerateArticle = useCallback(async (index: number, pageCustomPersona: { instructions: string; htmlTemplate: string; }): Promise<boolean> => {
        if (currentPage === 'home' || (!apiKeyManager.hasGeminiKeys() && !apiKeyManager.hasOpenAIKeys())) {
          setError("يرجى إضافة مفتاح Gemini API أو OpenAI API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
          return false;
        }
        if (stopGenerationRef.current) return false;

        let originalArticleData = parsedArticles[index];
        if (!originalArticleData) {
          setError(`لا يمكن العثور على بيانات للمقال #${index + 1}.`);
          return false;
        }
        
        const selectedUrls = selectedSourcesByArticle[index] || new Set();
        const filteredSources = originalArticleData.sources.filter(s => selectedUrls.has(s.url));
        let articleData = { ...originalArticleData, sources: filteredSources };

        if (manualSourcesInput.trim()) {
            const manualSources = manualSourcesInput.trim().split('\n').map(line => {
                const url = line.trim();
                if (url.startsWith('http')) {
                    try { return { url, title: new URL(url).hostname }; } catch { return null; }
                } return null;
            }).filter((s): s is { url: string; title: string; } => s !== null);
            if (manualSources.length > 0) {
                const existingUrls = new Set(articleData.sources.map(s => s.url));
                const uniqueNewSources = manualSources.filter(ms => !existingUrls.has(ms.url));
                articleData = { ...articleData, sources: [...articleData.sources, ...uniqueNewSources] };
            }
        }

        setIsGenerating(prev => ({ ...prev, [index]: true }));
        setError(null);
        setWarning(null);
        
        // --- Global Persona Logic ---
        const personaToUse = pageCustomPersona.instructions.trim() ? pageCustomPersona : globalCustomPersona;
        if (personaToUse === globalCustomPersona && globalCustomPersona.instructions.trim()) {
            logStatus("🧠 لم يتم العثور على مخ مخصص، تم استخدام المخ العام.");
        }
        
        try {
          logStatus(`--- بدء إنشاء المقال ${index + 1} من ${parsedArticles.length}: "${articleData.title.substring(0, 50)}" ---`);
          
           const subCategoryToUse = currentPage === ContentType.News ? (preferences.selectedNewsSubCategories[0] || null) : null;
            let finalArticleData = articleData as ParsedArticle & { subCategory?: string | null };
            
            if (currentPage === ContentType.News && preferences.selectedNewsSubCategories.length > 1) {
                const classifiedSubCat = await classifyNewsSubCategory(articleData, preferences.selectedNewsSubCategories, preferences.selectedTextModel, logStatus);
                finalArticleData = { ...articleData, subCategory: classifiedSubCat };
            } else if (currentPage === ContentType.News) {
                 finalArticleData = { ...articleData, subCategory: subCategoryToUse };
            }

            const imagePromptToUse = 
                (currentPage === ContentType.Horoscope && horoscopeImagePrompt) ? horoscopeImagePrompt :
                (currentPage === ContentType.Cooking && cookingImagePrompt) ? cookingImagePrompt :
                (currentPage === ContentType.News && newsImagePrompt) ? newsImagePrompt :
                null;
          
          const { content, warning } = await generateArticleContent(
              finalArticleData, currentPage as ContentType, imgbbApiKey.key, youtubeApiKey.key, preferences,
              logStatus, preferences.sportsMedicineLanguage, useInternetSearch,
              personaToUse, personalTouchByArticle[index] || '', finalArticleData.subCategory || null,
              preferences.videoOption, preferences.fillDynamicPlaceholders || false, imagePromptToUse
          );
          
          if (warning) { setWarning(warning); }

          const newArticle: GeneratedArticle = { id: Date.now() + index, ...content, isFavorite: false, rating: 0 };

          setGeneratedArticles(prev => [...prev, newArticle]);
          logStatus(`✅ اكتمل إنشاء المقال #${index + 1} بنجاح!`);
          return true;
        } catch (e) {
          const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
          setError(friendlyMessage);
          logStatus(`❌ فشل إنشاء المقال #${index + 1}: ${friendlyMessage}`);
          return false;
        } finally {
          setIsGenerating(prev => ({ ...prev, [index]: false }));
        }
      }, [
        currentPage, parsedArticles, imgbbApiKey, youtubeApiKey, preferences, logStatus, useInternetSearch,
        globalCustomPersona, personalTouchByArticle, setError, setWarning, setGeneratedArticles,
        horoscopeImagePrompt, cookingImagePrompt, newsImagePrompt, manualSourcesInput,
        selectedSourcesByArticle
      ]);

      const handleGlobalGenerate = useCallback(async (isBatchAll: boolean = false, pageCustomPersona: { instructions: string; htmlTemplate: string; }) => {
        if (parsedArticles.length === 0) return;
        stopGenerationRef.current = false;
        resetGenerated();
        setGenerationLog([]);
        if (isBatchAll) {
            setIsGeneratingAll(true);
            for (let i = 0; i < parsedArticles.length; i++) {
                if (stopGenerationRef.current) {
                    logStatus("🛑 تم إيقاف عملية الإنشاء بناءً على طلب المستخدم.");
                    break;
                }
                await handleGenerateArticle(i, pageCustomPersona);
            }
            setIsGeneratingAll(false);
        } else {
            handleGenerateArticle(0, pageCustomPersona);
        }
    }, [parsedArticles, handleGenerateArticle, resetGenerated, setGenerationLog, logStatus]);

    const handleArticleUpdate = useCallback((articleId: number, field: keyof GeneratedArticle, value: any) => {
        const updateFn = (articles: GeneratedArticle[]) => 
            articles.map(a => a.id === articleId ? { ...a, [field]: value } : a);
        setGeneratedArticles(updateFn);
    }, [setGeneratedArticles]);
    
    const handleFinalizeArticle = useCallback((articleId: number) => {
        logStatus("✍️ بدء عملية إنهاء وتنسيق وربط المصادر...");
        setGeneratedArticles(prevArticles => {
            const newArticles = [...prevArticles];
            const articleIndex = newArticles.findIndex(a => a.id === articleId);
            if (articleIndex === -1) {
                logStatus("⚠️ لم يتم العثور على المقال المطلوب.");
                return prevArticles;
            }
    
            const article = newArticles[articleIndex];
            const pArticleData = parsedArticles[articleIndex];
            if (!pArticleData) {
                 logStatus("⚠️ لم يتم العثور على بيانات المقال الأصلية، سيتم تخطي تحديث المصادر.");
                 newArticles[articleIndex] = { ...article, isFinalized: true };
                 return newArticles;
            }
            
            const selectedUrls = selectedSourcesByArticle[articleIndex] || new Set();
            const selectedSources = pArticleData.sources.filter(s => selectedUrls.has(s.url));
            let newHtml = article.html;
            
            if (typeof document !== 'undefined') {
                const parser = new DOMParser();
                const doc = parser.parseFromString(newHtml, 'text/html');
    
                // 1. Rebuild the source list
                const sourceHeading = Array.from(doc.querySelectorAll('h3, h2')).find(h => h.textContent?.trim().includes('المصادر'));
                let sourceList = sourceHeading?.nextElementSibling;
    
                if (sourceList && sourceList.tagName.toLowerCase() === 'ul') {
                    // Clear and rebuild existing list
                    sourceList.innerHTML = '';
                } else {
                    // Create a new list if it doesn't exist
                    sourceList = doc.createElement('ul');
                    if (sourceHeading) {
                        sourceHeading.insertAdjacentElement('afterend', sourceList);
                    } else {
                        doc.body.appendChild(sourceList); // Fallback: append to end
                    }
                }
                
                sourceList.setAttribute('style', 'list-style: none; padding: 0px; text-align: right;');
                const newListItemsHtml = selectedSources.map((source, index) => {
                    const newIndex = index + 1;
                    const cleanTitle = source.title.replace(/^\[\d+\]\s*-\s*/, '').trim();
                    return `<li id="ref${newIndex}" style="margin-bottom: 8px;"><a href="#cite${newIndex}" style="color:#2196f3; font-weight:normal; text-decoration:none;" title="اذهب لمكان الاقتباس في النص">[${newIndex}]</a> - <a href="${source.url}" rel="noopener noreferrer nofollow" style="color:#2196f3; text-decoration:underline !important;" target="_blank" title="${cleanTitle}">${cleanTitle}</a></li>`;
                }).join('\n');
                sourceList.innerHTML = newListItemsHtml;
                logStatus(`✅ تم إعادة بناء قائمة المصادر بـ ${selectedSources.length} مصدر.`);
    
                // 2. Remove any old citation links to avoid duplicates
                doc.querySelectorAll('a[id^="cite"]').forEach(a => {
                    const citationText = a.textContent;
                    if (citationText) {
                        const textNode = document.createTextNode(citationText);
                        a.parentNode?.replaceChild(textNode, a);
                    }
                });
    
                // 3. Find and replace all citation markers like [1], [2] in the entire body
                const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
                let node;
                const nodesToModify = [];
                while (node = walker.nextNode()) {
                    if (node.nodeValue && /\[\d+\]/.test(node.nodeValue)) {
                        // Check parent to avoid re-linking inside the source list itself
                        if(node.parentElement?.closest('ul, ol')) {
                            const parentList = node.parentElement.closest('ul, ol');
                            if(parentList && parentList.querySelector('li[id^="ref"]')) continue;
                        }
                         nodesToModify.push(node);
                    }
                }
    
                let citationsLinked = 0;
                nodesToModify.forEach(textNode => {
                    const parent = textNode.parentNode;
                    if (!parent) return;
                    
                    const newHtml = textNode.nodeValue!.replace(/\[(\d+)\]/g, (match, numberStr) => {
                        const number = parseInt(numberStr, 10);
                        if (number > 0 && number <= selectedSources.length) {
                            citationsLinked++;
                            return `<a href="#ref${number}" id="cite${number}" style="color:#2196f3; font-weight: bold; text-decoration: none;">[${number}]</a>`;
                        }
                        return match; // Return original if number is out of bounds
                    });
    
                    if (newHtml !== textNode.nodeValue) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newHtml;
                        const newNodes = Array.from(tempDiv.childNodes);
                        newNodes.forEach(newNode => parent.insertBefore(newNode.cloneNode(true), textNode));
                        parent.removeChild(textNode);
                    }
                });
    
                newHtml = doc.body.innerHTML;
                logStatus(`✅ تم ربط ${citationsLinked} استشهاد رقمي بالمصادر.`);
            }
    
            newArticles[articleIndex] = { ...article, html: newHtml, isFinalized: true };
            return newArticles;
        });
    }, [logStatus, setGeneratedArticles, parsedArticles, selectedSourcesByArticle]);
    
    // --- START: Logic for SchemaFixerModal ---
    const handleCorrectSchema = useCallback((articleId: number) => {
        logStatus("🔍 بدء تدقيق السكيما...");
        const article = generatedArticles.find(a => a.id === articleId);
        if (!article) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(article.html, 'text/html');
        const schemaScript = doc.getElementById('qaData');
        const incorrectSchema = schemaScript ? JSON.stringify(JSON.parse(schemaScript.textContent || '{}'), null, 2) : 'لم يتم العثور على سكيما في المقال.';
        let correctedSchema = 'لا يمكن إنشاء سكيما صحيحة.';
        const articleText = doc.body.textContent || ''; 

        try {
            if (schemaScript && schemaScript.textContent) {
                const schemaJson = JSON.parse(schemaScript.textContent);
                const qaData = schemaJson.mainEntity ? (Array.isArray(schemaJson.mainEntity) ? schemaJson.mainEntity : [schemaJson.mainEntity, ...(schemaJson.hasPart || [])]) : (Array.isArray(schemaJson) ? schemaJson : []);
                if (qaData && qaData.length > 0) {
                    const correctedJson = JSON.stringify(qaData, null, 2);
                    correctedSchema = QA_SCHEMA_TEMPLATE.replace('__QUESTIONS_AND_ANSWERS__', correctedJson).trim();
                }
            }
        } catch (e) {
            logStatus(`⚠️ حدث خطأ أثناء تحليل السكيما الحالية: ${(e as Error).message}`);
        }
        
        setSchemaFixerState({ isOpen: true, article, articleText, incorrectSchema, correctedSchema });
    }, [generatedArticles, logStatus]);

    const handleApplySchemaFix = useCallback((correctedSchema: string) => {
        if (!schemaFixerState.article) return;

        setIsApplyingSchemaFix(true);
        logStatus("...جاري تطبيق إصلاح السكيما");
        
        const article = schemaFixerState.article;
        let newHtml = article.html;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(newHtml, 'text/html');
        const oldSchemaScript = doc.getElementById('qaData');
        
        if (oldSchemaScript) {
            oldSchemaScript.remove();
        }

        newHtml = doc.body.innerHTML + `\n${correctedSchema}`;

        setGeneratedArticles(prev => prev.map(a => a.id === article.id ? { ...a, html: newHtml, isSchemaCorrected: true } : a));
        logStatus("✅ تم إصلاح السكيما بنجاح.");
        
        setIsApplyingSchemaFix(false);
        setSchemaFixerState({ isOpen: false, article: null, articleText: '', incorrectSchema: '', correctedSchema: '' });

    }, [schemaFixerState.article, setGeneratedArticles, logStatus]);

    // --- END: Logic for SchemaFixerModal ---


    const handleUpdateArticleImage = useCallback((articleId: number, newImageUrl: string) => {
        const updateImage = (articles: GeneratedArticle[]) => 
            articles.map(article => {
                if (article.id === articleId) {
                    const escapeRegExp = (string:string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const oldImageUrlPattern = new RegExp(escapeRegExp(article.imageUrl), 'g');
                    return { ...article, imageUrl: newImageUrl, html: article.html.replace(oldImageUrlPattern, newImageUrl) };
                }
                return article;
            });
        setGeneratedArticles(updateImage);
    }, [setGeneratedArticles]);

    useEffect(() => {
        const anyGenerating = isGeneratingAll || Object.values(isGenerating).some(Boolean);
        setIsGeneratingGlobal(anyGenerating);
        if (!anyGenerating) {
            setIsMedicalPromptActive(false);
            return;
        }
        const isMedicalType = currentPage === ContentType.SportsMedicine || currentPage === ContentType.AlternativeMedicine;
        if (!isMedicalType) return;

        const lastLog = generationLog[generationLog.length - 1] || '';
        const imageGenKeywords = ['جاري إنشاء الصورة', 'إنشاء برومبت الصورة', 'جاري تحليل النص لإنشاء الصورة', 'Activating specialized medical image protocol'];
        if (imageGenKeywords.some(kw => lastLog.includes(kw))) setIsMedicalPromptActive(true);
        if (lastLog.includes('اكتمل إنشاء المقال') || lastLog.includes('فشل إنشاء المقال')) setIsMedicalPromptActive(false);
    }, [generationLog, currentPage, isGeneratingAll, isGenerating]);
  // --- END: Logic for ContentCreationPage ---

  const loadAndInjectFonts = useCallback(async () => {
    await initDB();
    const fonts = await getFonts();
    setCustomFonts(fonts);
    const styleId = 'custom-fonts-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }
    const fontFaces = fonts.map(font => `
        @font-face { font-family: "${font.name}"; src: url(${font.data}); }
    `).join('\n');
    styleElement.innerHTML = fontFaces;
  }, []);

  useEffect(() => { loadAndInjectFonts(); }, [loadAndInjectFonts]);
  useEffect(() => { localStorage.setItem(GLOBAL_PERSONA_KEY, JSON.stringify(globalCustomPersona)); }, [globalCustomPersona]);
  useEffect(() => { localStorage.setItem(SOURCE_LIBRARY_KEY, JSON.stringify(sourceLibrary)); }, [sourceLibrary]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteArticles)); }, [favoriteArticles]);
  useEffect(() => { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => {
    if (selectedBlogId) localStorage.setItem('selectedBlogId', selectedBlogId);
    else localStorage.removeItem('selectedBlogId');
  }, [selectedBlogId]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const settings = apiKeyManager.loadSettings();
    setGeminiApiKeys(settings.geminiApiKeys || []);
    setActiveKeyIndex(settings.activeGeminiKeyIndex || 0);
    setOpenaiApiKeys(settings.openaiApiKeys || []);
    setActiveOpenAIKeyIndex(settings.activeOpenAIKeyIndex || 0);
    setImgbbApiKey(settings.imgbbApiKey || { key: '', status: 'unknown' });
    setYoutubeApiKey(settings.youtubeApiKey || { key: '', status: 'unknown' });
  }, []);

   useEffect(() => {
    const loadScript = (src: string, id: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (document.getElementById(id)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = src; script.id = id; script.async = true; script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
    };
    Promise.all([
        loadScript("https://apis.google.com/js/api.js", "gapi-script"),
        loadScript("https://accounts.google.com/gsi/client", "gsi-script")
    ]).then(() => setIsGoogleClientReady(true)).catch(console.error);
  }, []);
  
  const handleExportSettings = useCallback(() => {
    try {
        apiKeyManager.exportSettings();
        setWarning("تم تصدير الإعدادات بنجاح إلى ملف JSON.");
    } catch (e) {
        setError("فشل تصدير الإعدادات.");
    }
  }, []);

  const handleImportSettings = useCallback(async (file: File) => {
      try {
          await apiKeyManager.importSettings(file);
          alert("تم استيراد الإعدادات بنجاح! سيتم إعادة تحميل الصفحة الآن لتطبيق التغييرات.");
          window.location.reload();
      } catch (e) {
          setError(e instanceof Error ? e.message : "حدث خطأ غير معروف أثناء الاستيراد.");
      }
  }, [setError]);
  
  const handleStartOver = useCallback(() => {
      if (window.confirm("هل أنت متأكد؟ سيؤدي هذا إلى إعادة تحميل الصفحة وفقدان أي تغييرات غير محفوظة.")) {
          window.location.reload();
      }
  }, []);

  const updateBloggerAuthStatus = useCallback(async (isSignedIn: boolean) => {
    setIsBloggerAuthenticated(isSignedIn);
    if (isSignedIn) {
        try {
            const user = await bloggerService.getCurrentUser();
            setBloggerUser(user);
            const blogs = await bloggerService.listBlogs();
            setBloggerBlogs(blogs);
            if (blogs.length > 0 && (!selectedBlogId || !blogs.some(b => b.id === selectedBlogId))) {
               setSelectedBlogId(blogs[0].id);
            }
        } catch (error) {
            console.error("Error fetching blogger data:", error);
            setError("فشل في جلب بيانات المدونات.");
        }
    } else {
        setBloggerUser(null);
        setBloggerBlogs([]);
    }
  }, [selectedBlogId, setError]);

  const handleBloggerConnect = useCallback(async () => {
    if (!isGoogleClientReady) {
        setError("خدمات جوجل ليست جاهزة بعد. يرجى الانتظار والمحاولة مرة أخرى.");
        return;
    }
    setError(null);
    try {
        await bloggerService.signIn(bloggerConfig, updateBloggerAuthStatus);
    } catch (error: any) {
         setError(`فشل الربط المباشر مع جوجل. السبب: ${error.message}`);
    }
  }, [updateBloggerAuthStatus, isGoogleClientReady]);
  
  const handleBloggerDisconnect = useCallback(() => {
      bloggerService.signOut(updateBloggerAuthStatus);
  }, [updateBloggerAuthStatus]);

  const handlePublishToBlogger = useCallback(async (article: GeneratedArticle) => {
    if (!isBloggerAuthenticated || !selectedBlogId) {
        setError("يجب أن تكون متصلاً بـ Blogger وأن تختار مدونة للنشر.");
        return;
    }
    setPublishingStatus(prev => ({ ...prev, [article.id]: 'publishing' }));
    try {
        await bloggerService.publishPost(selectedBlogId, article);
        setPublishingStatus(prev => ({ ...prev, [article.id]: 'published' }));
    } catch (error: any) {
        const errorMessage = error.result?.error?.message || error.message || "خطأ غير معروف.";
        setPublishingStatus(prev => ({ ...prev, [article.id]: 'error' }));
        setError(`فشل النشر: ${errorMessage}`);
    }
  }, [isBloggerAuthenticated, selectedBlogId, setError]);
  
  const handleRemoveFavorite = useCallback((articleId: number) => {
      setFavoriteArticles(prev => prev.filter(a => a.id !== articleId));
  }, []);
  
  const handleEditorArticleUpdate = useCallback((articleId: number, field: keyof GeneratedArticle, value: any) => {
    setEditorArticles(articles => articles.map(a => a.id === articleId ? { ...a, [field]: value } : a));
  }, [setEditorArticles]);
  
  const handleEditorImageUpdate = useCallback((articleId: number, newImageUrl: string) => {
    setEditorArticles(articles => articles.map(article => {
        if (article.id === articleId) {
            const escapeRegExp = (string:string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const oldImageUrlPattern = new RegExp(escapeRegExp(article.imageUrl), 'g');
            return { ...article, imageUrl: newImageUrl, html: article.html.replace(oldImageUrlPattern, newImageUrl) };
        }
        return article;
    }));
  }, [setEditorArticles]);
  
    useEffect(() => {
        const isContentPage = currentPage !== 'home' && currentPage !== ContentType.AdvancedEditor;
        setActivePageControls({
            undo: isContentPage ? undoGenerated : undoEditor,
            redo: isContentPage ? redoGenerated : redoEditor,
            canUndo: isContentPage ? canUndoGenerated : canRedoEditor,
            canRedo: isContentPage ? canRedoGenerated : canRedoEditor,
        });
    }, [currentPage, undoGenerated, redoGenerated, canUndoGenerated, canRedoGenerated, undoEditor, redoEditor, canUndoEditor, canRedoEditor]);
    
    // Load profile settings effect
    useEffect(() => {
        if (profileToLoad && profileToLoad.contentType === currentPage && currentPage !== 'home') {
            const profile = profileToLoad;

            setPreferences(prev => ({
                ...prev, 
                ...profile.preferences,
                selectedTextModel: profile.selectedTextModel,
                selectedImageModel: profile.selectedImageModel
            }));
            setUseInternetSearch(profile.useInternetSearch);
            setCustomPersona(profile.customPersona);
            logStatus(`✅ تم تحميل ملف التعريف "${profile.name}".`);
            setProfileToLoad(null); // Clear after loading
        }
    }, [profileToLoad, currentPage, logStatus]);


    getCurrentSettingsRef.current = () => ({
        contentType: currentPage as ContentType,
        preferences,
        useInternetSearch,
        customPersona,

        selectedTextModel: preferences.selectedTextModel,
        selectedImageModel: preferences.selectedImageModel,
    });


  const renderPage = () => {
      const globalProps = {
        theme, setTheme, error, setError, warning, setWarning, 
        geminiApiKeys, setGeminiApiKeys, 
        activeKeyIndex, setActiveKeyIndex,
        openaiApiKeys, setOpenaiApiKeys,
        activeOpenAIKeyIndex, setActiveOpenAIKeyIndex,
        imgbbApiKey, setImgbbApiKey,
        youtubeApiKey, setYoutubeApiKey,
        globalCustomPersona, setGlobalCustomPersona,
        sourceLibrary,
        setSourceLibrary, logStatus, favoriteArticles, setFavoriteArticles, isBloggerAuthenticated,
        bloggerUser, bloggerBlogs, selectedBlogId, setSelectedBlogId, handleBloggerConnect, handleBloggerDisconnect,
        publishingStatus, handlePublishToBlogger, isPublishDisabled: !isBloggerAuthenticated || !selectedBlogId,
        customFonts, onShowFontManager: () => setIsFontManagerOpen(true),
        onImportSettings: handleImportSettings, onExportSettings: handleExportSettings, onStartOver: handleStartOver,
        profileToLoad,
        // --- Pass centralized state and functions to ContentCreationPage ---
        rawInput, setRawInput,
        preferences, setWordCount, setSportsMedicineLanguage, setSelectedNewsSubCategories, setDifficultyLevel, setImageAspectRatio, setVideoOption,
        setFillDynamicPlaceholders,
        setSelectedTextModel, setSelectedImageModel, setOverrideImageSlug, setSelectedImageStyle, setSelectedTypographyStyle,
        manualSourcesInput, setManualSourcesInput,
        useInternetSearch, setUseInternetSearch,
        customPersona, setCustomPersona,
        isGenerating, isGeneratingAll,
        parsedArticles, setParsedArticles, // Pass setter down
        handleGlobalGenerate, handleGenerateArticle, handleStopGeneration,
        selectedSourcesByArticle, setSelectedSourcesByArticle,
        personalTouchByArticle, setPersonalTouchByArticle,
        isMedicalPromptActive,
        horoscopeImagePrompt, setHoroscopeImagePrompt,
        cookingImagePrompt, setCookingImagePrompt,
        newsImagePrompt, setNewsImagePrompt,
        generatedArticles,
        handleUpdateArticleImage, handleArticleUpdate,
        generationLog,
        totalGenerationTime,
        handleFinalizeArticle,
        handleCorrectSchema,
        handleSaveLog, handleLoadLog, handleClearLog
      };

      if (currentPage === 'home') {
          return <HomePage onNavigate={setCurrentPage} globalProps={globalProps} />;
      }
      
      if (currentPage === ContentType.AdvancedEditor) {
        return <XmlEditor
                  articles={editorArticles}
                  setArticles={setEditorArticles}
                  logStatus={logStatus}
                  setError={setError}
                  setWarning={setWarning}
                  imgbbApiKey={imgbbApiKey.key}
                  onPublish={handlePublishToBlogger}
                  publishingStatus={publishingStatus}
                  isPublishDisabled={!isBloggerAuthenticated || !selectedBlogId}
                  onArticleUpdate={handleEditorArticleUpdate}
                  onImageUpdate={handleEditorImageUpdate}
                  onNavigateHome={() => setCurrentPage('home')}
                  customFonts={customFonts}
               />;
      }
      
      if (currentPage === ContentType.ImageStudio) {
        return <ImageStudio
                    imgbbApiKey={imgbbApiKey.key}
                    setImgbbApiKey={(key: string) => setImgbbApiKey({ key, status: 'unknown' })}
                    geminiApiKeys={geminiApiKeys.map(k => k.key)}
                    setGeminiApiKeys={(keys: string[]) => setGeminiApiKeys(keys.map(k => ({ key: k, status: 'unknown' })))}
                    activeKeyIndex={activeKeyIndex}
                    setActiveKeyIndex={setActiveKeyIndex}
                    selectedImageModel={preferences.selectedImageModel}
                    setSelectedImageModel={setSelectedImageModel}
                    logStatus={logStatus}
                    setError={setError}
                    setWarning={setWarning}
                    onNavigateHome={() => setCurrentPage('home')}
                    selectedTextModel={preferences.selectedTextModel}
                    customFonts={customFonts}
                />
      }

      if (currentPage === ContentType.SeoStudio) {
        return <SeoStudio
                  logStatus={logStatus}
                  setError={setError}
                  setWarning={setWarning}
                  onNavigateHome={() => setCurrentPage('home')}
                  selectedTextModel={preferences.selectedTextModel}
               />
      }

      if (currentPage === ContentType.VideoStudio) {
        return <VideoStudio 
            logStatus={logStatus}
            setError={setError}
            onNavigateHome={() => setCurrentPage('home')}
        />
      }

      if (currentPage === ContentType.HoroscopeVideoStudio) {
        return <HoroscopeVideoStudio
            logStatus={logStatus}
            setError={setError}
            onNavigateHome={() => setCurrentPage('home')}
            customFonts={customFonts}
        />
      }
      
      if (currentPage === ContentType.HorusForge) {
          return <HorusForge 
                    onNavigateHome={() => setCurrentPage('home')}
                    logStatus={logStatus}
                    setError={setError}
                 />;
      }

      if (Object.values(ToolType).includes(currentPage as ToolType)) {
          const toolConfig = TOOL_OPTIONS.find(o => o.value === currentPage)!;

          switch(currentPage) {
            case ToolType.NanoBananaStudio:
                return <NanoBananaStudio onNavigateHome={() => setCurrentPage('home')} globalProps={globalProps} />;
            case ToolType.BloggerCleaner:
                return <BloggerCleaner onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.CodeConverter:
                return <CodeConverter onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.WebpConverter:
                return <WebpConverter onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.WordCounter:
                return <WordCounter onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.ChatGpt:
                return <ChatGpt onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.PrivacyPolicy:
                return <PrivacyPolicyGenerator onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.TermsOfUse:
                return <TermsOfUseGenerator onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.AboutUs:
                return <AboutUsGenerator onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.RobotsTxt:
                return <RobotsTxtGenerator onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.Sitemap:
                return <SitemapGenerator onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.CssMinifier:
                return <CssMinifier onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.CodeEditor:
                return <CodeEditor onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.AiContentDetector:
                return <AiContentDetector onNavigateHome={() => setCurrentPage('home')} selectedTextModel={preferences.selectedTextModel} logStatus={logStatus} setError={setError} />;
            case ToolType.ContactUs:
                return <ContactUsGenerator onNavigateHome={() => setCurrentPage('home')} />;
            case ToolType.KeywordTool:
                return <KeywordTool onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.BacklinkChecker:
                return <BacklinkChecker onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.PlagiarismChecker:
                return <PlagiarismChecker onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.SocialMediaPostGenerator:
                return <SocialMediaPostGenerator onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.HeadlineAnalyzer:
                return <HeadlineAnalyzer onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.ShortVideoScriptWriter:
                return <ShortVideoScriptWriter onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.AdvancedImageEnhancer:
                return <AdvancedImageEnhancer onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.EcommerceStudio:
                return <EcommerceStudio onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.EmailMarketingGenerator:
                return <EmailMarketingGenerator onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.ElearningStudio:
                return <ElearningStudio onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            case ToolType.PodcastScriptGenerator:
                return <PodcastScriptGenerator onNavigateHome={() => setCurrentPage('home')} logStatus={logStatus} setError={setError} />;
            default:
                return (
                    <>
                        <button onClick={() => setCurrentPage('home')} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            العودة للرئيسية
                        </button>
                        <PageBanner title={toolConfig.label} iconClass={toolConfig.iconClass} />
                        <div className="flex-grow flex items-center justify-center">
                            <div className="text-center bg-white/50 dark:bg-gray-800/50 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">قيد الإنشاء</h3>
                                <p className="text-gray-500 mt-2">سيتم تفعيل هذه الأداة قريبًا.</p>
                            </div>
                        </div>
                         <GuideSection toolType={currentPage as ToolType} />
                    </>
              );
          }
      }

      if (currentPage !== 'home') {
          const pageConfig = CONTENT_TYPE_OPTIONS.find(o => o.value === currentPage);
          if (pageConfig) {
              return <ContentCreationPage 
                         key={currentPage} 
                         contentType={currentPage} 
                         onNavigate={setCurrentPage} 
                         globalProps={globalProps} 
                     />;
          }
      }

      return (
          <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">صفحة غير معروفة</h2>
              <p>حدث خطأ ما، يرجى العودة للصفحة الرئيسية.</p>
               <button onClick={() => setCurrentPage('home')} className="mt-6 px-4 py-2 text-sm font-semibold rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center gap-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
          </div>
      );
  };
  
  return (
    <>
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        onShowFavorites={() => setIsFavoritesModalOpen(true)} 
        favoritesCount={favoriteArticles.length}
        onUndo={activePageControls.undo}
        onRedo={activePageControls.redo}
        canUndo={activePageControls.canUndo}
        canRedo={activePageControls.canRedo}
        isGenerating={isGeneratingGlobal}
        onShowPage={setActiveStaticPage}
        onShowProfileManager={() => setIsProfileModalOpen(true)}
      />
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {warning && <Alert type="warning" message={warning} onClose={() => setWarning(null)} />}
        {renderPage()}
      </main>
      <Footer onShowPage={setActiveStaticPage} />
    </div>
    <FavoritesModal 
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        articles={favoriteArticles}
        onRemove={handleRemoveFavorite}
    />
     <FontManager
        isOpen={isFontManagerOpen}
        onClose={() => setIsFontManagerOpen(false)}
        customFonts={customFonts}
        onFontChange={loadAndInjectFonts}
    />
    <ProfileManagerModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        setProfiles={setProfiles}
        onLoadProfile={(profile) => {
            setProfileToLoad(profile);
            setCurrentPage(profile.contentType);
        }}
        getCurrentSettings={getCurrentSettingsRef.current}
        logStatus={logStatus}
    />
     <SchemaFixerModal 
        isOpen={schemaFixerState.isOpen}
        onClose={() => setSchemaFixerState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleApplySchemaFix}
        incorrectSchema={schemaFixerState.incorrectSchema}
        correctedSchema={schemaFixerState.correctedSchema}
        isApplying={isApplyingSchemaFix}
        articleText={schemaFixerState.articleText}
        selectedTextModel={preferences.selectedTextModel}
        logStatus={logStatus}
        setError={setError}
     />
    {activeStaticPage && (
        <StaticPageModal
            title={STATIC_PAGES[activeStaticPage].title}
            content={STATIC_PAGES[activeStaticPage].content}
            onClose={() => setActiveStaticPage(null)}
        />
    )}
    </>
  );
};

export default App;