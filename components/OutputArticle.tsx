import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GeneratedArticle, SeoAnalysis, CustomFont, ContentType } from '../types';
import LoadingIndicator from './LoadingIndicator';
import { restructureContent, rewriteArticleAcademically, addCitationsAndSources, addExpertTouch } from '../services/geminiService';
import { exportToBloggerXml } from '../utils/bloggerExport';
import { exportArticlesAsZip } from '../utils/zipExport';
import SeoAnalyzer from './SeoAnalyzer';
import { uploadImageToHost } from '../services/geminiService';
import TextToSpeechPlayer from './TextToSpeechPlayer';
import { apiKeyManager } from '../apiKeyManager';
import { CanvasEditorImpl } from './CanvasEditor';
import ImageInserterModal from './ImageInserterModal'; // Import the new modal

// Add hljs to the window interface to avoid TypeScript errors
declare const hljs: any;
declare const fabric: any;
declare const JSZip: any;


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
    const [showHiddenElements, setShowHiddenElements] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const previewRef = useRef<HTMLDivElement>(null);
    const [restructureState, setRestructureState] = useState<{ [key: string]: boolean }>({});
    const [isInsertingVideo, setIsInsertingVideo] = useState(false);
    const [isImageInserterOpen, setIsImageInserterOpen] = useState(false);

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
            <ImageInserterModal 
                isOpen={isImageInserterOpen}
                onClose={() => setIsImageInserterOpen(false)}
                logStatus={logStatus}
                setError={setError}
                imgbbApiKey={imgbbApiKey || ''}
            />
            {/* ... other content ... */}
             <div className="h-[600px] overflow-y-auto">
                {activeTab === 'preview' && (
                    <div className="p-4" dir={isRtl ? 'rtl' : 'ltr'}>
                        {/* ... other preview content ... */}
                        
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
                            onOpenImageInserter={() => setIsImageInserterOpen(true)}
                        />
                        {/* ... rest of the preview content ... */}
                    </div>
                )}
                {/* ... other tabs ... */}
            </div>
             {/* ... rest of component ... */}
        </div>
    );
};

// This export can be removed if MaintenanceBox is only used here.
export default OutputArticle;
