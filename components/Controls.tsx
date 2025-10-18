import React, { useState } from 'react';
import { ContentType, ParsedArticle, BloggerUser, BloggerBlog } from '../types';
import { COOKING_IMAGE_PROMPTS, GEMINI_TEXT_MODELS, ZODIAC_SIGN_MAP, HOROSCOPE_IMAGE_PROMPTS, NEWS_IMAGE_PROMPTS, IMAGE_GENERATION_STYLES } from '../constants';
import LoadingIndicator from './LoadingIndicator';
import { MEDICAL_IMAGE_PROMPT_TEMPLATE } from '../services/horusProtocol';
import { generateExpertTouchSuggestions } from '../services/geminiService';
import { apiKeyManager } from '../apiKeyManager';
import CollapsiblePersonaEditor from './CollapsiblePersonaEditor';

type DifficultyLevel = 'easy' | 'medium' | 'advanced';
type VideoOption = 'none' | 'youtube' | 'veo';

// New: Typography styles, consistent with ImageStudio
const TYPOGRAPHY_STYLES = [
  { value: 'none', label: 'بدون (افتراضي)' },
  { value: 'dramatic_scene', label: 'مشهد درامي سينمائي' },
  { value: 'dramatic', label: 'درامي (حجري/ناري)' },
  { value: 'joyful', label: 'مبهج (ملون/مضيء)' },
  { value: 'feminine', label: 'بناتي (ناعم/وردي)' },
  { value: 'sporty', label: 'رياضي (ديناميكي/معدني)' },
  { value: 'medical_alt', label: 'طبي فني (للأعشاب)' },
  { value: 'auto_fire', label: 'تلقائي: ناري' },
  { value: 'auto_ice', label: 'تلقائي: جليدي' },
  { value: 'auto_metallic', label: 'تلقائي: معدني لامع' },
];


interface ControlsProps {
  contentType: ContentType;
  onGenerate: () => void;
  onGenerateAll: () => void;
  onGenerateArticle: (index: number) => void;
  onStopGeneration: () => void; // New prop for stopping
  isGenerating: Record<number, boolean>;
  isGeneratingAll: boolean;
  isDisabled: boolean;
  wordCount: number;
  setWordCount: (count: number) => void;
  manualSourcesInput: string;
  setManualSourcesInput: (sources: string) => void;
  sportsMedicineLanguage: 'ar' | 'en';
  setSportsMedicineLanguage: (lang: 'ar' | 'en') => void;
  useInternetSearch: boolean;
  setUseInternetSearch: (use: boolean) => void;
  videoOption: VideoOption;
  setVideoOption: (option: VideoOption) => void;
  fillDynamicPlaceholders: boolean;
  setFillDynamicPlaceholders: (fill: boolean) => void;
  customPersona: { instructions: string; htmlTemplate: string; };
  setCustomPersona: (persona: { instructions: string; htmlTemplate: string; }) => void;
  sourceLibrary: { [key in ContentType]?: string };
  setSourceLibrary: (library: { [key in ContentType]?: string }) => void;
  isBloggerAuthenticated: boolean;
  bloggerUser: BloggerUser | null;
  bloggerBlogs: BloggerBlog[];
  selectedBlogId: string | null;
  setSelectedBlogId: (id: string | null) => void;
  onBloggerConnect: () => void;
  onBloggerDisconnect: () => void;
  personalTouchByArticle: { [key: number]: string };
  setPersonalTouchByArticle: (touches: { [key: number]: string }) => void;
  parsedArticles: ParsedArticle[];
  setParsedArticles: (updateFn: (prev: ParsedArticle[]) => ParsedArticle[]) => void;
  selectedSourcesByArticle: { [key: number]: Set<string> };
  setSelectedSourcesByArticle: (sources: { [key: number]: Set<string> }) => void;
  selectedTextModel: string;
  setSelectedTextModel: (model: string) => void;
  isMedicalPromptActive?: boolean;
  difficultyLevel: DifficultyLevel;
  setDifficultyLevel: (level: DifficultyLevel) => void;
  onHoroscopePromptSelect: (prompt: string | null) => void;
  selectedHoroscopePrompt: string | null;
  onCookingPromptSelect: (prompt: string | null) => void;
  selectedCookingPrompt: string | null;
  logStatus: (message: string) => void; // Added for AI generation logging
  setError: (error: string | null) => void; // Added for error handling
  overrideImageSlug: string;
  setOverrideImageSlug: (slug: string) => void;
  onNewsPromptSelect: (prompt: string | null) => void;
  selectedNewsPrompt: string | null;
  selectedImageStyle?: string;
  setSelectedImageStyle?: (style: string) => void;
  selectedTypographyStyle?: string;
  setSelectedTypographyStyle?: (style: string) => void;
}

const MedicalImagePromptBox: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const boxClasses = `p-3 bg-cyan-950/25 backdrop-blur-sm rounded-lg border transition-all duration-500 ${isActive ? 'border-green-400/80 shadow-lg shadow-green-400/30' : 'border-cyan-500/40 shadow-lg shadow-cyan-500/25'}`;
    const titleClasses = `text-xs font-semibold text-center mb-2 transition-colors duration-500 ${isActive ? 'text-green-400' : 'text-cyan-400'}`;

    return (
        <div className={boxClasses}>
            <style>{`
                @keyframes pulse-icon {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                .icon-pulse {
                    animation: pulse-icon 1.5s infinite ease-in-out;
                }
            `}</style>
            <h4 className={titleClasses}>
                <div className="flex items-center justify-center gap-2">
                    {isActive ? <i className="fas fa-check-circle icon-pulse"></i> : '🧬'}
                    <span>بروتوكول الصور الطبية الموحد (نشط)</span>
                </div>
            </h4>
            <textarea
                readOnly
                value={MEDICAL_IMAGE_PROMPT_TEMPLATE.replace('{{ARTICLE_TITLE}}', 'عنوان المقال الديناميكي')}
                rows={5}
                className="w-full bg-gray-800/60 border-0 rounded-md p-2 font-mono text-xs text-gray-300 resize-none"
            />
        </div>
    );
};

const HoroscopeImagePromptSelector: React.FC<{
    parsedArticles: ParsedArticle[];
    onSelect: (prompt: string | null) => void;
    selectedPrompt: string | null;
}> = ({ parsedArticles, onSelect, selectedPrompt }) => {
    
    const getZodiacSign = () => {
        const title = parsedArticles[0]?.title || '';
        const text = parsedArticles[0]?.text || '';
        const content = `${title} ${text}`; // Check both title and text content
        if (!content.trim()) return null;

        for (const arabicName in ZODIAC_SIGN_MAP) {
            if (content.includes(arabicName)) {
                return {
                    arabic: arabicName,
                    english: ZODIAC_SIGN_MAP[arabicName]
                };
            }
        }
        return null;
    };
    
    const zodiacSign = getZodiacSign();
    const [selectedStyle, setSelectedStyle] = useState<string | null>(() => {
        if (selectedPrompt) {
            const matchingPrompt = HOROSCOPE_IMAGE_PROMPTS.find(p => selectedPrompt.includes(p.prompt.substring(0, 50)));
            return matchingPrompt?.name || null;
        }
        return null;
    });


    const handleSelectStyle = (styleName: string, promptTemplate: string) => {
        if (!zodiacSign) {
            return;
        }
        const finalPrompt = promptTemplate.replace(/{{ZODIAC_SIGN_EN}}/g, zodiacSign.english);
        onSelect(finalPrompt);
        setSelectedStyle(styleName);
    };
    
    const handleClearSelection = () => {
        onSelect(null);
        setSelectedStyle(null);
    };

    return (
        <div className="p-3 bg-purple-950/25 backdrop-blur-sm rounded-lg border border-purple-400/40 shadow-lg shadow-purple-500/30 space-y-3">
            <h4 className="text-xs font-semibold text-center text-purple-400 mb-2">
                <i className="fas fa-star-of-david"></i> بروتوكول صور الأبراج الثابت
            </h4>
            
            {!zodiacSign && parsedArticles.length > 0 && (
                 <p className="text-xs text-center text-yellow-400 bg-yellow-900/40 p-2 rounded-md">
                    لم يتم التعرف على اسم البرج في عنوان المقال الأول أو محتواه. يرجى التأكد من كتابة اسم البرج (مثل "الجدي") بشكل صحيح.
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HOROSCOPE_IMAGE_PROMPTS.map(({ name, prompt }) => (
                    <div key={name} className={`p-3 border-2 rounded-lg transition-all duration-300 ${selectedStyle === name ? 'border-green-500 bg-green-900/30' : 'border-gray-600 bg-gray-800/50'}`}>
                        <h5 className="font-bold text-sm text-center mb-2 text-gray-200">{name}</h5>
                        <textarea
                            readOnly
                            value={zodiacSign ? prompt.replace(/{{ZODIAC_SIGN_EN}}/g, zodiacSign.english) : prompt}
                            rows={6}
                            className="w-full bg-gray-900/70 border-0 rounded-md p-2 font-mono text-xs text-gray-400 resize-none"
                        />
                        <button
                            onClick={() => handleSelectStyle(name, prompt)}
                            disabled={!zodiacSign}
                            className="w-full mt-2 px-3 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                           {selectedStyle === name ? '✓ تم الاختيار' : 'اختر هذا النمط'}
                        </button>
                    </div>
                ))}
            </div>
             {selectedStyle && (
                <div className="text-center">
                    <button onClick={handleClearSelection} className="text-xs text-red-400 hover:text-red-300 underline">
                        إلغاء الاختيار
                    </button>
                </div>
            )}
        </div>
    );
};

const CookingImagePromptSelector: React.FC<{
    parsedArticles: ParsedArticle[];
    onSelect: (prompt: string | null) => void;
    selectedPrompt: string | null;
}> = ({ parsedArticles, onSelect, selectedPrompt }) => {

    const getDishName = () => {
        const title = parsedArticles[0]?.title || 'the dish';
        return title.replace(/^(طريقة عمل|وصفة|كيفية تحضير)\s+/i, '').trim();
    };

    const dishName = getDishName();
    const [selectedStyle, setSelectedStyle] = useState<string | null>(() => {
        if (selectedPrompt) {
            const matchingPrompt = COOKING_IMAGE_PROMPTS.find(p => selectedPrompt === p.prompt.replace(/{{DISH_NAME}}/g, dishName));
            return matchingPrompt?.name || null;
        }
        return null;
    });

    const handleSelectStyle = (styleName: string, promptTemplate: string) => {
        if (selectedStyle === styleName) {
            onSelect(null);
            setSelectedStyle(null);
        } else {
            const finalPrompt = promptTemplate.replace(/{{DISH_NAME}}/g, dishName);
            onSelect(finalPrompt);
            setSelectedStyle(styleName);
        }
    };

    return (
        <div className="p-3 bg-amber-950/25 backdrop-blur-sm rounded-lg border border-amber-500/40 shadow-lg shadow-amber-500/25 space-y-3">
             <style>{`
                @keyframes pulse-glow-icon {
                    0%, 100% {
                        filter: drop-shadow(0 0 5px var(--glow-color-soft)) drop-shadow(0 0 10px var(--glow-color));
                        transform: scale(1.0);
                    }
                    50% {
                        filter: drop-shadow(0 0 15px var(--glow-color)) drop-shadow(0 0 25px var(--glow-color));
                        transform: scale(1.08);
                    }
                }
                .icon-glow-pulse {
                    animation: pulse-glow-icon 5s infinite ease-in-out;
                }
            `}</style>
            <h4 className="text-xs font-semibold text-center text-amber-400 mb-2">
                <i className="fas fa-utensils"></i> بروتوكول صور الطبخ الاحترافي
            </h4>

            {parsedArticles.length === 0 && (
                 <p className="text-xs text-center text-yellow-400 bg-yellow-900/40 p-2 rounded-md">
                    أدخل بيانات الوصفة أولاً لتفعيل أنماط الصور.
                </p>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {COOKING_IMAGE_PROMPTS.map(({ name, prompt, icon, color }) => (
                     <button
                        key={name}
                        onClick={() => handleSelectStyle(name, prompt)}
                        disabled={parsedArticles.length === 0}
                        className={`relative aspect-square group overflow-hidden rounded-lg border-4 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-gray-700 to-gray-900 ${selectedStyle === name ? 'border-green-500 scale-105 shadow-lg' : 'border-gray-800 hover:border-cyan-500'}`}
                        title={name}
                    >
                        <i
                           className={`${icon} text-4xl text-white transition-transform duration-300 group-hover:scale-110 icon-glow-pulse`}
                           style={{ '--glow-color': color, '--glow-color-soft': `${color}99` } as React.CSSProperties}
                        ></i>
                        <p className="text-white text-[10px] font-semibold mt-2">{name}</p>
                        
                        {selectedStyle === name && (
                            <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const NewsImagePromptSelector: React.FC<{
    parsedArticles: ParsedArticle[];
    onSelect: (prompt: string | null) => void;
    selectedPrompt: string | null;
}> = ({ parsedArticles, onSelect, selectedPrompt }) => {
    const getArticleTitle = () => {
        return parsedArticles[0]?.title || 'the news topic';
    };

    const articleTitle = getArticleTitle();
    const [selectedStyle, setSelectedStyle] = useState<string | null>(() => {
        if (selectedPrompt) {
            const matchingPrompt = NEWS_IMAGE_PROMPTS.find(p => selectedPrompt === p.prompt.replace(/{{ARTICLE_TITLE}}/g, articleTitle));
            return matchingPrompt?.name || null;
        }
        return null;
    });

    const handleSelectStyle = (styleName: string, promptTemplate: string) => {
        if (selectedStyle === styleName) {
            onSelect(null);
            setSelectedStyle(null);
        } else {
            const finalPrompt = promptTemplate.replace(/{{ARTICLE_TITLE}}/g, articleTitle);
            onSelect(finalPrompt);
            setSelectedStyle(styleName);
        }
    };

    return (
        <div className="p-3 bg-blue-950/25 backdrop-blur-sm rounded-lg border border-blue-500/40 shadow-lg shadow-blue-500/25 space-y-3">
            <style>{`
                @keyframes pulse-glow-icon {
                    0%, 100% {
                        filter: drop-shadow(0 0 5px var(--glow-color-soft)) drop-shadow(0 0 10px var(--glow-color));
                        transform: scale(1.0);
                    }
                    50% {
                        filter: drop-shadow(0 0 15px var(--glow-color)) drop-shadow(0 0 25px var(--glow-color));
                        transform: scale(1.08);
                    }
                }
                .icon-glow-pulse {
                    animation: pulse-glow-icon 5s infinite ease-in-out;
                }
            `}</style>
            <h4 className="text-xs font-semibold text-center text-blue-400 mb-2">
                <i className="fas fa-newspaper"></i> بروتوكول صور الأخبار الاحترافي
            </h4>

            {parsedArticles.length === 0 && (
                 <p className="text-xs text-center text-yellow-400 bg-yellow-900/40 p-2 rounded-md">
                    أدخل بيانات الخبر أولاً لتفعيل أنماط الصور.
                </p>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {NEWS_IMAGE_PROMPTS.map(({ name, prompt, icon, color }) => (
                     <button
                        key={name}
                        onClick={() => handleSelectStyle(name, prompt)}
                        disabled={parsedArticles.length === 0}
                        className={`relative aspect-square group overflow-hidden rounded-lg border-4 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-gray-700 to-gray-900 ${selectedStyle === name ? 'border-green-500 scale-105 shadow-lg' : 'border-gray-800 hover:border-cyan-500'}`}
                        title={name}
                    >
                        <i
                           className={`${icon} text-4xl text-white transition-transform duration-300 group-hover:scale-110 icon-glow-pulse`}
                           style={{ '--glow-color': color, '--glow-color-soft': `${color}99` } as React.CSSProperties}
                        ></i>
                        <p className="text-white text-[10px] font-semibold mt-2">{name}</p>
                        
                        {selectedStyle === name && (
                            <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};


const DifficultySelector: React.FC<{
    value: DifficultyLevel;
    onChange: (level: DifficultyLevel) => void;
}> = ({ value, onChange }) => {
    const options = [
        { value: 'easy', label: 'سهل', icon: '🧘' },
        { value: 'medium', label: 'متوسط', icon: '📝' },
        { value: 'advanced', label: 'متقدم', icon: '🧠' },
    ] as const;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">مستوى عمق المقال</label>
            <div className="flex w-full bg-gray-200 dark:bg-gray-900/70 rounded-lg p-1 border border-gray-300 dark:border-gray-600">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                            value === opt.value
                                ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'
                        }`}
                        aria-pressed={value === opt.value}
                    >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                    </button>
                ))}
            </div>
             <p className="text-xs text-gray-500 mt-2">
                 يؤثر على عمق البحث، تعقيد اللغة، وتفاصيل المقال.
            </p>
        </div>
    );
};

const VideoOptionSelector: React.FC<{
    value: VideoOption;
    onChange: (option: VideoOption) => void;
}> = ({ value, onChange }) => {
    const options = [
        { value: 'none', label: 'بدون فيديو', icon: '🚫' },
        { value: 'youtube', label: 'يوتيوب', icon: '▶️' },
        { value: 'veo', label: 'إنشاء AI', icon: '🤖' },
    ] as const;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">خيار الفيديو</label>
            <div className="flex w-full bg-gray-200 dark:bg-gray-900/70 rounded-lg p-1 border border-gray-300 dark:border-gray-600">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                            value === opt.value
                                ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'
                        }`}
                        aria-pressed={value === opt.value}
                    >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                    </button>
                ))}
            </div>
             <p className="text-xs text-gray-500 mt-2">
                اختر لتضمين فيديو مقترح من يوتيوب، أو إنشاء فيديو قصير بالذكاء الاصطناعي (Veo).
            </p>
        </div>
    );
};

const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

const Controls: React.FC<ControlsProps> = (props) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('general');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const { personalTouchByArticle, setPersonalTouchByArticle, parsedArticles, setParsedArticles, logStatus, setError, selectedTextModel, setSelectedTextModel, videoOption, setVideoOption, onStopGeneration } = props;
  
  const [eatSuggestions, setEatSuggestions] = useState<string[]>([]);
  const [isGeneratingEat, setIsGeneratingEat] = useState(false);
  const [newSourcesText, setNewSourcesText] = useState('');

  const isAnyGenerationRunning = props.isGeneratingAll || Object.values(props.isGenerating).some(Boolean);

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };
  
  const glassButtonClasses = "w-full flex justify-between items-center p-3 rounded-lg bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-all duration-300 shadow-lg";
  
  const Accordion: React.FC<{ title: string; name: string; children: React.ReactNode; icon: string; }> = ({ title, name, children, icon }) => (
    <div className="bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button onClick={() => toggleAccordion(name)} className={`w-full flex justify-between items-center p-3 transition-colors duration-300 ${activeAccordion === name ? 'bg-gray-200/80 dark:bg-gray-900/80' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
                <span className={`text-lg transition-transform duration-500 ${activeAccordion === name ? 'text-cyan-500' : ''}`}>{icon}</span>
                {title}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform text-gray-500 ${activeAccordion === name ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {activeAccordion === name && <div className="p-4 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">{children}</div>}
    </div>
  );

  const isMedicalContent = props.contentType === ContentType.SportsMedicine || props.contentType === ContentType.AlternativeMedicine;
  const isHoroscopeContent = props.contentType === ContentType.Horoscope;
  const isCookingContent = props.contentType === ContentType.Cooking;
  const isNewsContent = props.contentType === ContentType.News;

  const handlePersonalTouchChange = (value: string) => {
    const newTouches = { ...personalTouchByArticle };
    props.parsedArticles.forEach((_, index) => {
        newTouches[index] = value;
    });
    setPersonalTouchByArticle(newTouches);
  };
  
  const handleGenerateEatSuggestions = async () => {
    if (!apiKeyManager.hasGeminiKeys()) {
        setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
        return;
    }
    if (!parsedArticles[0]?.text) {
        setError("يرجى إدخال محتوى مقال أولاً لتوليد اقتراحات.");
        return;
    }
    setIsGeneratingEat(true);
    setError(null);
    setEatSuggestions([]);
    try {
        const textForContext = `${parsedArticles[0].title}\n${parsedArticles[0].text}`;
        const suggestions = await generateExpertTouchSuggestions(textForContext, selectedTextModel, logStatus);
        setEatSuggestions(suggestions);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsGeneratingEat(false);
    }
  };
  
  const handleSourceSelectionChange = (articleIndex: number, sourceUrl: string, isChecked: boolean) => {
    const newSelectedSources = { ...props.selectedSourcesByArticle };
    const articleSources = new Set(newSelectedSources[articleIndex] || []);

    if (isChecked) {
        articleSources.add(sourceUrl);
    } else {
        articleSources.delete(sourceUrl);
    }

    newSelectedSources[articleIndex] = articleSources;
    props.setSelectedSourcesByArticle(newSelectedSources);
  };

  const handleAddSources = (articleIndex: number) => {
    const lines = newSourcesText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
  
    const addedSources: { title: string, url: string }[] = [];
    const addedUrls = new Set<string>();
  
    lines.forEach(line => {
      let title = '', url = '';
      const parts = line.split(' - ');
      if (parts.length > 1 && isValidUrl(parts[parts.length - 1].trim())) {
        url = parts.pop()!.trim();
        title = parts.join(' - ').trim();
      } else if (isValidUrl(line.trim())) {
        url = line.trim();
        title = new URL(url).hostname;
      }
  
      if (url) {
        addedSources.push({ title, url });
        addedUrls.add(url);
      }
    });
  
    setParsedArticles(prev => {
      const newParsed = [...prev];
      if (newParsed[articleIndex]) {
        const existingUrls = new Set(newParsed[articleIndex].sources.map(s => s.url));
        const uniqueNewSources = addedSources.filter(s => !existingUrls.has(s.url));
        newParsed[articleIndex].sources.push(...uniqueNewSources);
      }
      return newParsed;
    });
  
    props.setSelectedSourcesByArticle(prev => {
      const newSelected = { ...prev };
      const currentSet = new Set(newSelected[articleIndex] || []);
      addedUrls.forEach(url => currentSet.add(url));
      newSelected[articleIndex] = currentSet;
      return newSelected;
    });
  
    setNewSourcesText('');
    logStatus(`تمت إضافة ${addedUrls.size} مصدر جديد للمقال #${articleIndex + 1}.`);
  };

  const totalSelectedSources = Object.values(props.selectedSourcesByArticle).reduce((acc: number, currentSet) => acc + (currentSet as Set<string>).size, 0);
  const totalAvailableSources = props.parsedArticles.reduce((acc: number, p) => acc + p.sources.length, 0);


  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <button onClick={props.onGenerate} disabled={props.isDisabled || isAnyGenerationRunning} className="h-12 text-base font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
          {Object.values(props.isGenerating).some(Boolean) ? <LoadingIndicator/> : '🚀 إنشاء مقال واحد'}
        </button>
        <button onClick={props.onGenerateAll} disabled={props.isDisabled || props.parsedArticles.length <= 1 || isAnyGenerationRunning} className="h-12 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
          {props.isGeneratingAll ? <LoadingIndicator/> : '✨ إنشاء كل المقالات'}
        </button>
      </div>
      
      {isAnyGenerationRunning && (
        <button onClick={onStopGeneration} className="h-12 text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-lg flex items-center justify-center">
            🛑 إيقاف الإنشاء
        </button>
      )}

      {isNewsContent && (
          <NewsImagePromptSelector
              parsedArticles={props.parsedArticles}
              onSelect={props.onNewsPromptSelect}
              selectedPrompt={props.selectedNewsPrompt}
          />
      )}

      {isMedicalContent && <MedicalImagePromptBox isActive={!!props.isMedicalPromptActive} />}

      {isHoroscopeContent && (
          <HoroscopeImagePromptSelector
              parsedArticles={props.parsedArticles}
              onSelect={props.onHoroscopePromptSelect}
              selectedPrompt={props.selectedHoroscopePrompt}
          />
      )}

      {isCookingContent && (
        <CookingImagePromptSelector
            parsedArticles={props.parsedArticles}
            onSelect={props.onCookingPromptSelect}
            selectedPrompt={props.selectedCookingPrompt}
        />
      )}

      <div className="space-y-2">
         <Accordion title="⚙️ الإعدادات العامة للمقال" name="general" icon="⚙️">
           <div className="space-y-4">
                <div>
                  <label htmlFor="text-model-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">نموذج الذكاء الاصطناعي (للنصوص)</label>
                  <select 
                    id="text-model-select" 
                    value={selectedTextModel} 
                    onChange={(e) => setSelectedTextModel(e.target.value)} 
                    className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                  >
                      {GEMINI_TEXT_MODELS.map(model => (
                          <option key={model.value} value={model.value}>{model.name}</option>
                      ))}
                  </select>
                </div>
                <DifficultySelector value={props.difficultyLevel} onChange={props.setDifficultyLevel} />
                <VideoOptionSelector value={videoOption} onChange={setVideoOption} />
                <div>
                  <label htmlFor="word-count" className="block text-sm font-medium text-gray-600 dark:text-gray-400">عدد الكلمات التقريبي: <span className="font-bold text-cyan-500">{props.wordCount}</span></label>
                  <input id="word-count" type="range" min="300" max="3000" step="50" value={props.wordCount} onChange={(e) => props.setWordCount(parseInt(e.target.value))} className="w-full mt-1"/>
                </div>
                 <div>
                  <label htmlFor="image-slug" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    الرابط المخصص للصورة (اختياري)
                  </label>
                  <input 
                    id="image-slug" 
                    type="text" 
                    value={props.overrideImageSlug || ''} 
                    onChange={(e) => props.setOverrideImageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="يستخدم رابط المقال تلقائيًا إذا ترك فارغًا"
                    className="w-full mt-1 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm font-mono"
                  />
                </div>
                
                 <div>
                  <label htmlFor="image-style-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    🎨 نمط الصورة العام
                  </label>
                  <select
                    id="image-style-select"
                    value={props.selectedImageStyle || ''}
                    onChange={(e) => props.setSelectedImageStyle?.(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                  >
                      {IMAGE_GENERATION_STYLES.map(s => <option key={s.name} value={s.prompt}>{s.name}</option>)}
                  </select>
                   <p className="text-xs text-gray-500 mt-2">
                    يحدد الأسلوب الفني العام للصورة التي سيتم إنشاؤها مع المقال.
                  </p>
                </div>

                 <div>
                  <label htmlFor="typography-style-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    ✍️ نمط الخط ثلاثي الأبعاد (اختياري)
                  </label>
                  <select
                    id="typography-style-select"
                    value={props.selectedTypographyStyle || 'none'}
                    onChange={(e) => props.setSelectedTypographyStyle?.(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                  >
                      {TYPOGRAPHY_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                   <p className="text-xs text-gray-500 mt-2">
                    سيتم تطبيق النمط المختار على عنوان المقال النهائي وإدراجه في الصورة.
                  </p>
                </div>


                {props.contentType === ContentType.SportsMedicine && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">لغة المقال</label>
                        <select value={props.sportsMedicineLanguage} onChange={(e) => props.setSportsMedicineLanguage(e.target.value as 'ar' | 'en')} className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                            <option value="ar">العربية (للعامة)</option>
                            <option value="en">الإنجليزية (للمتخصصين)</option>
                        </select>
                    </div>
                )}
                
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={props.useInternetSearch} onChange={(e) => props.setUseInternetSearch(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">🌐 استخدام بحث جوجل للمعلومات الحديثة</span>
                </label>

                <div>
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                        <input type="checkbox" checked={props.fillDynamicPlaceholders} onChange={(e) => props.setFillDynamicPlaceholders(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">🔄 ملء المتغيرات الديناميكية (مثل __POST_DATE__)</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 pl-6">
                        عند التفعيل، سيحاول الذكاء الاصطناعي ملء المتغيرات. اتركه معطلاً إذا كانت منصة النشر (مثل بلوجر) تعالجها تلقائيًا.
                    </p>
                </div>
           </div>
        </Accordion>

        <CollapsiblePersonaEditor
            title="المخ المخصص للصفحة"
            description="سيتم استخدام هذا المخ لهذه الصفحة فقط. إذا تُرك فارغًا، سيتم استخدام 'المخ العام' من الصفحة الرئيسية."
            persona={props.customPersona}
            setPersona={props.setCustomPersona}
            logStatus={logStatus}
            setError={setError}
        />
        
        <button onClick={() => toggleAccordion('expertTouch')} className={glassButtonClasses}>
            <span className="font-semibold text-sm flex items-center gap-3"><span className={`text-lg transition-transform duration-500 ${activeAccordion === 'expertTouch' ? 'text-cyan-400 eye-animation' : ''}`}>💡</span> لمسة الخبير (تعزيز المصداقية E-A-T)</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${activeAccordion === 'expertTouch' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {activeAccordion === 'expertTouch' && (
            <div className="p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg -mt-2 space-y-3">
                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">اكتب رأيك الخاص أو تجربتك الشخصية هنا...</label>
                <textarea 
                    value={personalTouchByArticle[0] || ''} 
                    onChange={(e) => handlePersonalTouchChange(e.target.value)}
                    rows={4} 
                    placeholder="مثال: بصفتي خبيرًا في التغذية، لاحظت أن..."
                    className="w-full text-sm bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                ></textarea>
                 <button onClick={handleGenerateEatSuggestions} disabled={isGeneratingEat || parsedArticles.length === 0} className="w-full px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isGeneratingEat ? <LoadingIndicator /> : '💡 توليد اقتراحات بالذكاء الاصطناعي'}
                </button>
                {eatSuggestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                        {eatSuggestions.map((suggestion, index) => (
                            <button key={index} onClick={() => handlePersonalTouchChange(suggestion)} className="w-full p-2 text-sm text-right bg-gray-200 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-800 rounded-md border border-gray-300 dark:border-gray-600">
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-xs text-gray-500">سيتم دمج هذا النص في المقال لزيادة مصداقيته.</p>
            </div>
        )}

        <button onClick={() => setIsSourceModalOpen(true)} className={glassButtonClasses} disabled={parsedArticles.length === 0}>
            <span className="font-semibold text-sm flex items-center gap-3"><i className="fas fa-link text-lg"></i> إدارة المصادر</span>
            {parsedArticles.length > 0 && (
              <span className="text-xs font-mono bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full">
                {totalSelectedSources} / {totalAvailableSources}
              </span>
            )}
        </button>

        <button onClick={() => toggleAccordion('blogger')} className={glassButtonClasses}>
            <span className="font-semibold text-sm flex items-center gap-3"><i className="fab fa-blogger-b text-lg"></i> الربط مع Blogger</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${activeAccordion === 'blogger' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {activeAccordion === 'blogger' && (
            <div className="p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg -mt-2">
            {props.isBloggerAuthenticated && props.bloggerUser ? (
                <div className="space-y-3 text-center">
                    {props.bloggerUser.imageUrl && <img src={props.bloggerUser.imageUrl} alt="User" className="w-12 h-12 rounded-full mx-auto" />}
                    <p>متصل كـ: <span className="font-semibold">{props.bloggerUser.name}</span></p>
                    {props.bloggerBlogs.length > 0 ? (
                        <select
                            value={props.selectedBlogId || ''}
                            onChange={(e) => props.setSelectedBlogId(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                        >
                            <option value="" disabled>اختر مدونة للنشر...</option>
                            {props.bloggerBlogs.map(blog => <option key={blog.id} value={blog.id}>{blog.name}</option>)}
                        </select>
                    ) : (<p className="text-sm text-yellow-500">لم يتم العثور على مدونات.</p>)}
                    <button onClick={props.onBloggerDisconnect} className="w-full px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white">قطع الاتصال</button>
                </div>
            ) : (
                <button onClick={props.onBloggerConnect} className="w-full px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2">
                    <i className="fab fa-blogger-b"></i> الربط مع حساب Blogger
                </button>
            )}
            </div>
        )}
      </div>
       {isSourceModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
          onClick={() => setIsSourceModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-300 dark:border-cyan-500/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">المصادر المجمعة (محدد {totalSelectedSources} / {totalAvailableSources})</h3>
              <button 
                onClick={() => setIsSourceModalOpen(false)} 
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
                {parsedArticles.length > 0 ? (
                    <div className="space-y-6">
                        {parsedArticles.map((article, index) => (
                            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-bold text-md text-cyan-700 dark:text-cyan-400 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                                    مصادر المقال #{index + 1}: <span className="font-normal text-gray-600 dark:text-gray-300">"{article.title}"</span>
                                </h4>
                                {article.sources.length > 0 ? (
                                    <ul className="space-y-3">
                                        {article.sources.map((source, sourceIndex) => {
                                            const isValid = isValidUrl(source.url);
                                            const isChecked = props.selectedSourcesByArticle[index]?.has(source.url) || false;
                                            return (
                                                <li key={sourceIndex} className="bg-gray-100/50 dark:bg-gray-900/50 p-3 rounded-md">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex-shrink-0 pt-1">
                                                            <input
                                                                type="checkbox"
                                                                id={`source-checkbox-${index}-${sourceIndex}`}
                                                                checked={isChecked}
                                                                onChange={(e) => handleSourceSelectionChange(index, source.url, e.target.checked)}
                                                                className="h-5 w-5 rounded border-gray-400 text-cyan-600 shadow-sm focus:ring-cyan-500 cursor-pointer"
                                                            />
                                                        </div>
                                                        <label htmlFor={`source-checkbox-${index}-${sourceIndex}`} className="flex-grow cursor-pointer">
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200 break-words">{source.title}</p>
                                                            <a 
                                                              href={source.url} 
                                                              target="_blank" 
                                                              rel="noopener noreferrer"
                                                              onClick={e => e.stopPropagation()}
                                                              className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline break-all"
                                                            >
                                                              {source.url}
                                                            </a>
                                                        </label>
                                                        <span title={isValid ? 'تنسيق الرابط صحيح' : 'تنسيق الرابط غير صحيح'} className={`text-xl flex-shrink-0 ${isValid ? 'text-green-500' : 'text-red-500'}`}>
                                                            {isValid ? '✅' : '❌'}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                     <p className="text-gray-500 text-center py-4">لم يتم العثور على مصادر لهذا المقال في النص المدخل.</p>
                                )}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <h5 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">إضافة مصادر جديدة لهذا المقال</h5>
                                    <textarea
                                      value={newSourcesText}
                                      onChange={(e) => setNewSourcesText(e.target.value)}
                                      rows={3}
                                      placeholder={`الصق المصادر هنا، كل مصدر في سطر.\nالتنسيق: Title - https://example.com\nأو فقط: https://example.com`}
                                      className="w-full text-sm bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono"
                                    />
                                    <button onClick={() => handleAddSources(index)} className="mt-2 w-full px-4 py-2 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700">
                                      إضافة المصادر
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">لم يتم العثور على مقالات قابلة للتحليل.</p>
                )}
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setIsSourceModalOpen(false)} className="px-6 py-2 text-sm rounded-md bg-cyan-600 text-white hover:bg-cyan-700">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;