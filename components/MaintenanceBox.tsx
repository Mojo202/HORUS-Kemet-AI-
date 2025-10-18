import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GeneratedArticle, SeoAnalysis, CustomFont, ContentType } from '../types';
import LoadingIndicator from './LoadingIndicator';
import { editImage, restructureContent, rewriteArticleAcademically, addCitationsAndSources, addExpertTouch } from '../services/geminiService';
import { fileToImageObject, imageUrlToImageObject } from '../utils/file';
import { exportToBloggerXml } from '../utils/bloggerExport';
import { exportArticlesAsZip } from '../utils/zipExport';
import SeoAnalyzer from './SeoAnalyzer';
import { convertToWebp } from '../utils/image';
import { uploadImageToHost } from '../services/geminiService';
import TextToSpeechPlayer from './TextToSpeechPlayer';
import { apiKeyManager } from '../apiKeyManager';
import { CanvasEditorImpl } from './CanvasEditor';

// Add hljs to the window interface to avoid TypeScript errors
declare const hljs: any;
declare const fabric: any;
declare const JSZip: any;

// New: Helper function to determine progress status from logs
const STATUS_MAP = [
  { keywords: ['بدء إنشاء المقال'], step: 1, text: '🚀 بدء العملية...' },
  { keywords: ['جاري إنشاء المحتوى'], step: 2, text: '✍️ جاري إنشاء المحتوى النصي...' },
  { keywords: ['تحليل المحتوى', 'إنشاء برومبت الصورة'], step: 3, text: '🧠 جاري تحليل النص لإنشاء الصورة...' },
  { keywords: ['جاري إنشاء الصورة', 'جاري تحويلها إلى WebP'], step: 4, text: '🎨 جاري توليد الصورة ومعالجتها...' },
  { keywords: ['رفع الصورة', 'إدراج رابط الصورة'], step: 5, text: '☁️ جاري رفع الصورة ودمجها...' },
  { keywords: ['اكتمل إنشاء المقال'], step: 6, text: '✅ اكتمل الإنشاء بنجاح!' },
];
const TOTAL_STEPS = STATUS_MAP.length;

function getProgressInfo(log: string[]): { statusText: string, progress: number } {
  const lastMessage = log[log.length - 1] || '';
  
  // Search from the end of the map to find the latest matching step
  for (let i = STATUS_MAP.length - 1; i >= 0; i--) {
    const status = STATUS_MAP[i];
    if (status.keywords.some(kw => lastMessage.includes(kw))) {
      return {
        statusText: status.text,
        progress: status.step / TOTAL_STEPS,
      };
    }
  }
  
  // Fallback for initial state
  return { statusText: '⏳ جاري التهيئة...', progress: 0.1 / TOTAL_STEPS };
}


interface CopyableInfoBoxProps {
    label: string;
    value: string;
    isCodeBlock?: boolean;
}

const CopyableInfoBox: React.FC<CopyableInfoBoxProps> = ({ label, value, isCodeBlock = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
            <div className="flex items-start gap-2">
                 {isCodeBlock ? (
                    <textarea
                        readOnly
                        dir="ltr"
                        className="flex-grow bg-gray-100 dark:bg-gray-900/70 p-2 rounded-md text-xs text-cyan-700 dark:text-cyan-300 h-32 resize-y w-full font-mono text-left"
                        value={value}
                    />
                ) : (
                    <pre dir="ltr" className="flex-grow bg-gray-100 dark:bg-gray-900/70 p-2 rounded-md text-xs text-cyan-700 dark:text-cyan-300 whitespace-pre-wrap break-all text-left">
                        <code>{value}</code>
                    </pre>
                )}
                <button
                    onClick={handleCopy}
                    className="px-3 py-2 text-xs rounded-md bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 text-white transition-colors flex-shrink-0"
                    aria-label={`Copy ${label}`}
                >
                    {copied ? '✔' : '📋'}
                </button>
            </div>
        </div>
    );
};

// ... (StarRating and countWords components remain the same) ...

const StarRating: React.FC<{
    rating: number;
    setRating: (rating: number) => void;
}> = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        className={ratingValue <= (hover || rating) ? 'on' : 'off'}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`Rate ${ratingValue} out of 5 stars`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

const countWords = (html: string): number => {
    if (typeof document === 'undefined') return 0;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const MaintenanceBox: React.FC<{
    article: GeneratedArticle;
    handleAiAction: (actionType: string, actionFn: (html: string, model: string, log: (msg: string) => void) => Promise<string>) => void;
    restructureState: { [key: string]: boolean };
    isEditorMode?: boolean;
    selectedTextModel: string;
    onFinalizeArticle: (articleId: number) => void;
    onCorrectSchema: (articleId: number) => void;
    onPublish: (article: GeneratedArticle) => void;
    publishStatus: 'idle' | 'publishing' | 'published' | 'error';
    isPublishDisabled: boolean;
    onOpenImageInserter: () => void;
}> = ({ article, handleAiAction, restructureState, isEditorMode, selectedTextModel, onFinalizeArticle, onCorrectSchema, onPublish, publishStatus, isPublishDisabled, onOpenImageInserter }) => {
    
    const canDoFinalActions = !isEditorMode;
    const canPublishAndExport = article.isFinalized && article.isSchemaCorrected;
    const actionButtonClass = "p-2 text-xs rounded-md text-white transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed";

    const getPublishButtonContent = () => {
        switch (publishStatus) {
            case 'publishing': return <LoadingIndicator />;
            case 'published': return <>✓ تم النشر</>;
            case 'error': return <>⚠️ فشل</>;
            default: return <>📤 نشر إلى Blogger</>;
        }
    };
    const getPublishButtonClasses = () => {
        let base = `${actionButtonClass}`;
        switch (publishStatus) {
            case 'publishing': return `${base} bg-gray-500 cursor-wait`;
            case 'published': return `${base} bg-green-700 cursor-default`;
            case 'error': return `${base} bg-red-700`;
            default: return `${base} bg-orange-600 hover:bg-orange-700`;
        }
    };

    return (
        <div className="my-4 p-3 bg-purple-900/30 rounded-lg border-2 border-dashed border-purple-500/50 space-y-3">
            <h4 className="font-bold text-center text-purple-300 flex items-center justify-center gap-2">
                <i className="fas fa-tools"></i>
                صندوق الصيانة والتعديل
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {canDoFinalActions && (
                    <>
                        <button 
                            onClick={() => onFinalizeArticle(article.id)}
                            disabled={!!article.isFinalized}
                            className={`${actionButtonClass} bg-blue-600 hover:bg-blue-700`}
                            title={article.isFinalized ? "تم إنهاء وتنسيق هذا المقال بالفعل" : "تطبيق التنسيق النهائي للمقال وربط المصادر"}
                        >
                            {article.isFinalized ? <><i className="fas fa-check-circle"></i> تم الإنهاء</> : <><i className="fas fa-flag-checkered"></i> إنهاء وتنسيق</>}
                        </button>
                        <button 
                            onClick={() => onCorrectSchema(article.id)}
                            disabled={!article.isFinalized || !!article.isSchemaCorrected}
                            className={`${actionButtonClass} bg-purple-600 hover:bg-purple-700`}
                            title={!article.isFinalized ? "يجب إنهاء وتنسيق المقال أولاً" : (article.isSchemaCorrected ? "تم تدقيق وإصلاح السكيما بالفعل" : "فحص وإصلاح سكيما الأسئلة والأجوبة")}
                        >
                            {article.isSchemaCorrected ? <><i className="fas fa-check-circle"></i> تم الإصلاح</> : <><i className="fas fa-wrench"></i> إصلاح السكيما</>}
                        </button>
                         <button
                            onClick={() => onPublish(article)}
                            disabled={!canPublishAndExport || isPublishDisabled || publishStatus === 'publishing' || publishStatus === 'published'}
                            className={getPublishButtonClasses()}
                            title={!canPublishAndExport ? "يجب إنهاء المقال وتدقيق السكيما أولاً قبل النشر" : (isPublishDisabled ? "الرجاء الربط مع Blogger واختيار مدونة أولاً" : "نشر المقال كمسودة على مدونتك المختارة")}
                        >
                            {getPublishButtonContent()}
                        </button>
                    </>
                 )}
                 <button 
                    onClick={onOpenImageInserter}
                    className={`${actionButtonClass} bg-green-600 hover:bg-green-700 ${!canDoFinalActions ? 'col-span-2 md:col-span-4' : ''}`}
                    title="رفع صورة من جهازك، وإنشاء رابط مخصص لها، ثم إدراجها في المقال"
                >
                    <i className="fas fa-image"></i> إدراج صورة
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-purple-500/30">
                <button onClick={() => handleAiAction('sections', (html) => restructureContent(html, 'sections', selectedTextModel, () => {}))} disabled={restructureState.sections} className={`${actionButtonClass} bg-indigo-600 hover:bg-indigo-700`}>
                    {restructureState.sections ? <LoadingIndicator /> : <><i className="fas fa-stream"></i> إضافة أقسام</>}
                </button>
                <button onClick={() => handleAiAction('numbered-list', (html) => restructureContent(html, 'numbered-list', selectedTextModel, () => {}))} disabled={restructureState['numbered-list']} className={`${actionButtonClass} bg-indigo-600 hover:bg-indigo-700`}>
                    {restructureState['numbered-list'] ? <LoadingIndicator /> : <><i className="fas fa-list-ol"></i> قائمة مرقمة</>}
                </button>
                 <button onClick={() => handleAiAction('bullet-list', (html) => restructureContent(html, 'bullet-list', selectedTextModel, () => {}))} disabled={restructureState['bullet-list']} className={`${actionButtonClass} bg-indigo-600 hover:bg-indigo-700`}>
                    {restructureState['bullet-list'] ? <LoadingIndicator /> : <><i className="fas fa-list-ul"></i> قائمة منقطة</>}
                </button>
                <button onClick={() => handleAiAction('table', (html) => restructureContent(html, 'table', selectedTextModel, () => {}))} disabled={restructureState.table} className={`${actionButtonClass} bg-indigo-600 hover:bg-indigo-700`}>
                    {restructureState.table ? <LoadingIndicator /> : <><i className="fas fa-table"></i> إضافة جدول</>}
                </button>
                 <button onClick={() => handleAiAction('academic', (html) => rewriteArticleAcademically(html, selectedTextModel, () => {}))} disabled={restructureState.academic} className={`${actionButtonClass} bg-teal-600 hover:bg-teal-700`} title="إعادة صياغة المقال بأسلوب أكاديمي وتعليمي">
                    {restructureState.academic ? <LoadingIndicator /> : <><i className="fas fa-graduation-cap"></i> صياغة أكاديمية</>}
                </button>
                <button onClick={() => handleAiAction('citations', (html) => addCitationsAndSources(html, selectedTextModel, () => {}))} disabled={restructureState.citations} className={`${actionButtonClass} bg-teal-600 hover:bg-teal-700`} title="إضافة مصادر وترقيم استشهادية للمحتوى">
                    {restructureState.citations ? <LoadingIndicator /> : <><i className="fas fa-book-medical"></i> إضافة استشهادات</>}
                </button>
                <button onClick={() => handleAiAction('expert', (html) => addExpertTouch(html, selectedTextModel, () => {}))} disabled={restructureState.expert} className={`${actionButtonClass} bg-teal-600 hover:bg-teal-700 col-span-2 md:col-span-1`} title="إضافة لمسة الخبير لتعزيز المصداقية (E-A-T)">
                    {restructureState.expert ? <LoadingIndicator /> : <><i className="fas fa-brain"></i> لمسة الخبير</>}
                </button>
            </div>
        </div>
    );
};


const OutputArticle: React.FC<{
    article: GeneratedArticle;
    onImageUpdate: (articleId: number, newImageUrl: string) => void;
    onArticleUpdate: (articleId: number, field: keyof GeneratedArticle, value: any) => void;
    setError: (error: string | null) => void;
    setWarning: (warning: string | null) => void;
    imgbbApiKey?: string;
    logStatus: (message: string) => void;
    onPublish: (article: GeneratedArticle) => void;
    publishStatus: 'idle' | 'publishing' | 'published' | 'error';
    isPublishDisabled: boolean;
    isEditorMode?: boolean;
    selectedTextModel: string;
    onFinalizeArticle: (articleId: number) => void;
    onCorrectSchema: (articleId: number) => void;
    customFonts: CustomFont[];
    isSelected: boolean;
    onSelect: (articleId: number, isSelected: boolean) => void;
    contentType: ContentType;
}> = ({ article, onImageUpdate, onArticleUpdate, setError, setWarning, imgbbApiKey, logStatus, onPublish, publishStatus, isPublishDisabled, isEditorMode = false, selectedTextModel, onFinalizeArticle, onCorrectSchema, customFonts, isSelected, onSelect, contentType }) => {
    const [activeTab, setActiveTab] = useState<'preview' | 'seo' | 'editor'>('preview');
    const [isManuallyUploading, setIsManuallyUploading] = useState(false);
    const [showHiddenElements, setShowHiddenElements] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const previewRef = useRef<HTMLDivElement>(null);
    const [restructureState, setRestructureState] = useState<{ [key: string]: boolean }>({});
    const [isInsertingVideo, setIsInsertingVideo] = useState(false);

    const isDataUrl = article.imageUrl.startsWith('data:');

     // Run syntax highlighting when the preview is visible and the HTML changes.
    useEffect(() => {
        if (activeTab === 'preview' && previewRef.current) {
            try {
                // Find all <pre><code> blocks and highlight them
                const blocks = previewRef.current.querySelectorAll('pre code');
                blocks.forEach((block) => {
                    hljs.highlightElement(block as HTMLElement);
                });
            } catch (e) {
                console.error("Syntax highlighting failed:", e);
            }
        }
    }, [activeTab, article.html]);

    const handleManualUpload = async () => {
        if (!imgbbApiKey) {
            setError("لا يمكن الرفع. يرجى إضافة مفتاح ImgBB API في قسم إدارة المفاتيح أولاً.");
            return;
        }
        if (!isDataUrl) return;

        setIsManuallyUploading(true);
        setError(null);
        logStatus(`--- بدء عملية الرفع اليدوي للصورة للمقال: "${article.title}" ---`);

        try {
            const base64Data = article.imageUrl.split(',')[1];
            const newImageUrl = await uploadImageToHost(base64Data, imgbbApiKey, article.slug);
            onImageUpdate(article.id, newImageUrl);
            logStatus("✅ نجح الرفع اليدوي للصورة.");
        } catch (e) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            setError(`فشل الرفع اليدوي: ${friendlyMessage}`);
            logStatus(`❌ فشل الرفع اليدوي: ${friendlyMessage}`);
        } finally {
            setIsManuallyUploading(false);
        }
    };

    const handleAiAction = async (actionType: string, actionFn: (html: string, model: string, log: (msg: string) => void) => Promise<string>) => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        setRestructureState(prev => ({ ...prev, [actionType]: true }));
        setError(null);
        logStatus(`--- بدء عملية AI: ${actionType} ---`);
        try {
            const newHtml = await actionFn(article.html, selectedTextModel, logStatus);
            onArticleUpdate(article.id, 'html', newHtml);
            logStatus(`✅ تمت عملية ${actionType} بنجاح.`);
        } catch (e) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            setError(`فشل ${actionType}: ${friendlyMessage}`);
            logStatus(`❌ فشلت عملية ${actionType}: ${friendlyMessage}`);
        } finally {
            setRestructureState(prev => ({ ...prev, [actionType]: false }));
        }
    };

    const handleInsertVideo = (position: 'after-image' | 'before-sources') => {
        if (!article.videoUrl) return;
    
        const videoEmbedBlock = `<div class="video-container" style="margin: 1.5rem auto; max-width: 640px;"><iframe src="${article.videoUrl}" title="Embedded Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    
        const parser = new DOMParser();
        const doc = parser.parseFromString(article.html, 'text/html');
    
        doc.querySelectorAll('.video-container, .horus-inserted-video').forEach(el => el.remove());
    
        let targetElement: Element | null = null;
    
        if (position === 'after-image') {
            targetElement = doc.querySelector('table.tr-caption-container');
            if (targetElement) {
                targetElement.insertAdjacentHTML('afterend', videoEmbedBlock);
            }
        } else if (position === 'before-sources') {
            targetElement = Array.from(doc.querySelectorAll('h3, h2')).find(h => h.textContent?.trim().includes('المصادر'));
            if (targetElement) {
                targetElement.insertAdjacentHTML('beforebegin', videoEmbedBlock);
            }
        }
    
        if (!targetElement) {
            doc.body.insertAdjacentHTML('beforeend', videoEmbedBlock);
            logStatus("⚠️ لم يتم العثور على الموقع المحدد، تم إدراج الفيديو في نهاية المقال.");
        }
    
        const newHtml = doc.body.innerHTML;
        onArticleUpdate(article.id, 'html', newHtml);
        logStatus("✅ تم إدراج الفيديو في المقال بنجاح.");
        setIsInsertingVideo(false);
    };
    
    const isRtl = /[\u0600-\u06FF]/.test(article.title || article.html);
    const previewHtml = article.html;
    const wordCount = useMemo(() => countWords(article.html), [article.html]);
    
    const isMedical = contentType === ContentType.SportsMedicine || contentType === ContentType.AlternativeMedicine;
    const articleFrameClasses = `bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${isMedical ? 'medical-glow-frame' : ''}`;
    const isYoutubeVideo = article.videoUrl?.includes('youtube.com');

    return (
        <div className={articleFrameClasses}>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={e => onSelect(article.id, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer flex-shrink-0"
                        aria-label={`Select article ${article.title}`}
                    />
                    <h3 className="font-semibold text-cyan-700 dark:text-cyan-400 truncate">{article.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                     <button
                        onClick={() => onArticleUpdate(article.id, 'isFavorite', !article.isFavorite)}
                        className={`p-2 rounded-full transition-colors duration-200 ${article.isFavorite ? 'text-amber-400 bg-amber-400/20' : 'text-gray-400 hover:text-amber-400 hover:bg-gray-700'}`}
                        title="حفظ في المفضلة"
                        aria-label="Save to favorites"
                    >
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                </div>
            </div>
             <TextToSpeechPlayer htmlContent={article.html} />
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex">
                <button 
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'preview' ? 'bg-gray-100 dark:bg-gray-700 text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}
                >
                    معاينة المقال
                </button>
                 <button 
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'seo' ? 'bg-gray-100 dark:bg-gray-700 text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}
                >
                    تحليل السيو 🚀
                </button>
                 <button 
                    onClick={() => setActiveTab('editor')}
                    disabled={!article.imageUrl}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'editor' ? 'bg-gray-100 dark:bg-gray-700 text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'} disabled:cursor-not-allowed disabled:text-gray-600`}
                >
                    محرر الصور
                </button>
            </div>
            
            <div className="h-[600px] overflow-y-auto">
                {activeTab === 'preview' && (
                    <div className="p-4" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700/50 p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs backdrop-blur-sm flex-wrap gap-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-600 dark:text-gray-300">عدد الكلمات:</span>
                                    <span className="font-mono text-cyan-600 dark:text-cyan-400">{wordCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-900/50 p-1 rounded-md">
                                    {([['desktop', 'fas fa-desktop'], ['tablet', 'fas fa-tablet-alt'], ['mobile', 'fas fa-mobile-alt']] as const).map(([mode, icon]) => (
                                        <button key={mode} onClick={() => setPreviewMode(mode)} className={`px-2 py-1 rounded-md ${previewMode === mode ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'}`} title={`معاينة ${mode}`}>
                                            <i className={icon}></i>
                                        </button>
                                    ))}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-gray-600 dark:text-gray-300">إظهار المخفي</span>
                                    <div className="relative">
                                        <input type="checkbox" checked={showHiddenElements} onChange={(e) => setShowHiddenElements(e.target.checked)} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full ${showHiddenElements ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showHiddenElements ? 'translate-x-full' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <MaintenanceBox 
                            article={article}
                            handleAiAction={handleAiAction}
                            restructureState={restructureState}
                            isEditorMode={isEditorMode}
                            selectedTextModel={selectedTextModel}
                            onFinalizeArticle={onFinalizeArticle}
                            onCorrectSchema={onCorrectSchema}
                            onPublish={onPublish}
                            publishStatus={publishStatus}
                            isPublishDisabled={isPublishDisabled}
                        />

                        <div className="responsive-preview-wrapper mt-2 relative">
                            <div className={`preview-frame preview-frame-${previewMode}`}>
                                <div ref={previewRef} className={`prose dark:prose-invert max-w-none preview-container h-full w-full overflow-auto p-4 ${showHiddenElements ? 'show-hidden' : ''}`} dangerouslySetInnerHTML={{ __html: previewHtml }} />
                            </div>
                        </div>
                        {(article.videoStatus && article.videoStatus !== 'idle') && (
                            <div className={`mt-4 p-4 rounded-lg space-y-3 ${isYoutubeVideo ? 'youtube-glow-frame' : 'bg-gray-100 dark:bg-gray-900/50 border border-cyan-500/30'}`}>
                                <h4 className="font-bold text-center text-cyan-500 text-lg">🎬 الفيديو المرفق</h4>
                                {article.videoStatus === 'pending' && (
                                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                                        <LoadingIndicator />
                                        <p className="text-cyan-500 dark:text-cyan-400 font-semibold">جاري إعداد الفيديو...</p>
                                    </div>
                                )}
                                {article.videoStatus === 'error' && (
                                    <div className="py-8 bg-red-900/30 rounded-lg text-center text-red-300">
                                        <p>⚠️ فشل في إعداد الفيديو لهذه المقالة.</p>
                                    </div>
                                )}
                                {article.videoUrl && article.videoStatus === 'ready' && (
                                    <div className="space-y-3">
                                        <div className="video-container">
                                        <iframe src={article.videoUrl} title="Embedded Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                        <button onClick={() => setIsInsertingVideo(true)} className="w-full px-4 py-2 text-sm rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                                            <i className="fas fa-plus-circle"></i> إدراج الفيديو في المقال
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                         {isDataUrl && (
                            <div className="p-3 mt-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center justify-between gap-4">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ <strong>تنبيه:</strong> لم يتم رفع الصورة. يتم استخدام رابط بيانات مؤقت.
                                </p>
                                <button
                                    onClick={handleManualUpload}
                                    disabled={!imgbbApiKey || isManuallyUploading}
                                    title={!imgbbApiKey ? "يرجى إضافة مفتاح ImgBB API أولاً" : "رفع الصورة إلى خدمة الاستضافة"}
                                    className="px-3 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
                                >
                                    {isManuallyUploading ? <LoadingIndicator /> : '☁️ رفع الصورة الآن'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'seo' && (
                    <SeoAnalyzer article={article} logStatus={logStatus} setError={setError} onArticleUpdate={onArticleUpdate} selectedTextModel={selectedTextModel} />
                )}
                {activeTab === 'editor' && article.imageUrl && (
                    <div className="h-full w-full p-2">
                        <CanvasEditorImpl
                            initialImageUrl={article.imageUrl}
                            customFonts={customFonts}
                            onSave={(dataUrl) => {
                                onImageUpdate(article.id, dataUrl);
                                setActiveTab('preview');
                                logStatus('✅ تم تطبيق التعديلات من المحرر.');
                            }}
                            onCancel={() => setActiveTab('preview')}
                            logStatus={logStatus}
                            setError={setError}
                            imgbbApiKey={imgbbApiKey}
                            slug={article.slug}
                        />
                    </div>
                )}
            </div>
            
            {/* --- METADATA SECTION --- */}
            <div className="p-3 bg-gray-50/60 dark:bg-gray-800/60 space-y-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400">تقييم جودة المقال</h4>
                <StarRating rating={article.rating || 0} setRating={(newRating) => onArticleUpdate(article.id, 'rating', newRating)} />
              </div>
              {article.imageUrl && <CopyableInfoBox label="رابط الصورة (URL)" value={article.imageUrl} />}
              <CopyableInfoBox label="الوصف التعريفي (SEO)" value={article.metaDescription} />
              <CopyableInfoBox label="الرابط المخصص (Slug)" value={article.slug} />
              <CopyableInfoBox label="كود المقال الكامل (HTML)" value={article.html} isCodeBlock />
            </div>

            {isInsertingVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsInsertingVideo(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg text-center text-gray-800 dark:text-gray-200">أين تريد إدراج الفيديو؟</h4>
                        <button onClick={() => handleInsertVideo('after-image')} className="w-full text-right p-3 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-800">بعد الصورة الرئيسية مباشرة</button>
                        <button onClick={() => handleInsertVideo('before-sources')} className="w-full text-right p-3 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-800">قبل قسم المصادر</button>
                        <button onClick={() => setIsInsertingVideo(false)} className="w-full mt-4 px-4 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600">إلغاء</button>
                    </div>
                </div>
            )}
        </div>
    );
};


interface OutputSectionProps {
  articles: GeneratedArticle[];
  isLoading: boolean;
  onImageUpdate: (articleId: number, newImageUrl: string) => void;
  onArticleUpdate: (articleId: number, field: keyof GeneratedArticle, value: any) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  imgbbApiKey: string;
  generationLog: string[];
  logStatus: (message: string) => void;
  totalGenerationTime: number;
  onPublish: (article: GeneratedArticle) => void;
  publishingStatus: { [key: number]: 'idle' | 'publishing' | 'published' | 'error' };
  isPublishDisabled: boolean;
  isEditorMode?: boolean;
  selectedTextModel: string;
  onFinalizeArticle: (articleId: number) => void;
  onCorrectSchema: (articleId: number) => void;
  onSaveLog: () => void;
  onLoadLog: () => void;
  onClearLog: () => void;
  customFonts: CustomFont[];
  contentType: ContentType;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ articles, isLoading, onImageUpdate, onArticleUpdate, setError, setWarning, imgbbApiKey, generationLog, logStatus, totalGenerationTime, onPublish, publishingStatus, isPublishDisabled, isEditorMode = false, selectedTextModel, onFinalizeArticle, onCorrectSchema, onSaveLog, onLoadLog, onClearLog, customFonts, contentType }) => {
  const [remainingTime, setRemainingTime] = useState(totalGenerationTime);
  const logContainerRef = useRef<HTMLPreElement>(null);
  const [hasSavedLog, setHasSavedLog] = useState(false);
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<number>>(new Set());

    const handleArticleSelection = (articleId: number, isSelected: boolean) => {
        setSelectedArticleIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(articleId);
            } else {
                newSet.delete(articleId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(articles.map(a => a.id));
            setSelectedArticleIds(allIds);
        } else {
            setSelectedArticleIds(new Set());
        }
    };

    const isAllSelected = articles.length > 0 && selectedArticleIds.size === articles.length;

    const getArticleFileContent = (article: GeneratedArticle, type: 'txt' | 'html') => {
        if (type === 'html') {
             return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title}</title>
    <meta name="description" content="${article.metaDescription}">
    <meta name="keywords" content="${article.metaKeywords}">
</head>
<body>
    ${article.html}
</body>
</html>`;
        }
        
        // Default to TXT
        return `<!--الرابط الثابت المخصص (Slug)-->
${article.slug}

<!--الوصف التعريفي (يستخدم أحيانا كبرومبت للصورة)-->
${article.metaDescription}

<!--رابط الصورة النهائي-->
${article.imageUrl}

<!--كود المقال الكامل (HTML)-->
${article.html}`;
    };

    const handleDownloadSelected = async (type: 'txt' | 'html' | 'zip' | 'xml') => {
        if (selectedArticleIds.size === 0) return;

        logStatus(`📦 بدء تجهيز ${selectedArticleIds.size} مقال/مقالات للتحميل...`);
        const selectedArticles = articles.filter(a => selectedArticleIds.has(a.id));

        if (type === 'xml') {
            exportToBloggerXml(selectedArticles);
            logStatus(`✅ تم بدء تحميل ملف XML يحتوي على ${selectedArticles.length} مقالات.`);
            return;
        }

        if (selectedArticles.length === 1 && type !== 'zip') {
            const article = selectedArticles[0];
            const fileContent = getArticleFileContent(article, type);
            const blob = new Blob([fileContent], { type: type === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${article.slug}.${type}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            logStatus(`✅ تم تحميل ملف "${article.slug}.${type}".`);
        } else { // Handle ZIP for multiple files or single file ZIP request
            try {
                const zip = new JSZip();
                selectedArticles.forEach(article => {
                    const fileContent = getArticleFileContent(article, type === 'zip' ? 'html' : type); // Default to HTML content for ZIP
                    zip.file(`${article.slug}.${type === 'zip' ? 'html' : type}`, fileContent);
                });
                const zipBlob = await zip.generateAsync({ type: "blob" });
                
                const url = URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `horus-articles-export-${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                logStatus(`✅ تم تحميل ملف ZIP يحتوي على ${selectedArticles.length} مقالات.`);
            } catch (err) {
                console.error("Zip export failed:", err);
                setError("حدث خطأ أثناء إنشاء ملف ZIP.");
            }
        }
    };


  useEffect(() => {
    // Check if a saved log exists in localStorage to enable/disable the load button
    setHasSavedLog(localStorage.getItem('horusV13SessionLog') !== null);
  }, [generationLog]); // Re-check when log changes (e.g., after save/clear)

  useEffect(() => {
    if (isLoading) {
      setRemainingTime(totalGenerationTime); 
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          // If time is about to run out, just keep it at 1 second
          // It will be cleared when isLoading becomes false.
          if (prev <= 1) {
            return 1; 
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer); 
    }
  }, [isLoading, totalGenerationTime]);
  
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [generationLog]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const { statusText, progress } = getProgressInfo(generationLog);


  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-2 gap-2">
            <div className="flex items-center gap-3">
                 {articles.length > 0 && (
                     <input 
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-5 w-5 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        title="تحديد الكل"
                     />
                 )}
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    النتائج
                    {articles.length > 0 && ` (${selectedArticleIds.size} / ${articles.length} محدد)`}
                </h2>
            </div>
            
            <div className="flex gap-2">
                 {selectedArticleIds.size > 0 && !isEditorMode && (
                    <>
                    <button onClick={() => handleDownloadSelected('txt')} className="px-3 py-1 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-2"><i className="fas fa-file-alt"></i> TXT</button>
                    <button onClick={() => handleDownloadSelected('html')} className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"><i className="fas fa-code"></i> HTML</button>
                    <button onClick={() => handleDownloadSelected('zip')} className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"><i className="fas fa-file-archive"></i> ZIP</button>
                    <button onClick={() => handleDownloadSelected('xml')} className="px-3 py-1 text-xs font-semibold rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-2"><i className="fab fa-blogger-b"></i> XML</button>
                    </>
                 )}
            </div>
        </div>
       <div className="flex-grow bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg p-4 space-y-4 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <LoadingIndicator statusText={statusText} progress={progress} />
            <div className="text-center my-2">
                <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">الوقت المتبقي المقدر</p>
                <p 
                    className="text-5xl font-bold font-mono text-cyan-500 dark:text-cyan-400" 
                    style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.6)' }}
                >
                    {formatTime(remainingTime)}
                </p>
            </div>
          </div>
        )}
        {!isLoading && articles.length === 0 && <p className="text-center text-gray-500">سيتم عرض المقالات التي تم إنشاؤها هنا</p>}
        {articles.map(article => 
            <OutputArticle 
                key={article.id} 
                article={article} 
                onImageUpdate={onImageUpdate} 
                onArticleUpdate={onArticleUpdate}
                setError={setError} 
                setWarning={setWarning} 
                imgbbApiKey={imgbbApiKey} 
                logStatus={logStatus}
                onPublish={onPublish}
                publishStatus={publishingStatus[article.id] || 'idle'}
                isPublishDisabled={isPublishDisabled}
                isEditorMode={isEditorMode}
                selectedTextModel={selectedTextModel}
                onFinalizeArticle={onFinalizeArticle}
                onCorrectSchema={onCorrectSchema}
                customFonts={customFonts}
                isSelected={selectedArticleIds.has(article.id)}
                onSelect={handleArticleSelection}
                contentType={contentType}
            />
        )}
       </div>
        {/* --- Session Log Manager UI --- */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">سجل التتبع المباشر</h4>
                <div className="flex gap-2">
                    <button onClick={onSaveLog} className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><i className="fas fa-save"></i>حفظ</button>
                    <button onClick={onLoadLog} disabled={!hasSavedLog} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5 disabled:bg-gray-500"><i className="fas fa-upload"></i>تحميل</button>
                    <button onClick={onClearLog} className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-1.5"><i className="fas fa-trash"></i>مسح</button>
                </div>
            </div>
            <pre ref={logContainerRef} className="text-right text-xs text-gray-600 dark:text-gray-400 h-48 overflow-y-auto p-2 bg-white dark:bg-black/20 rounded font-mono whitespace-pre-wrap direction-rtl">
                {generationLog.join('\n')}
            </pre>
        </div>
    </div>
  );
};