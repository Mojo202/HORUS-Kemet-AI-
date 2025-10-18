import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateImageAndUrl, editImage, generatePromptSuggestions, ImageGenerationOptions, analyzeImageForPrompt, uploadImageToHost } from '../services/geminiService';
import { imageUrlToImageObject } from '../utils/file';
import LoadingIndicator from './LoadingIndicator';
import { ASPECT_RATIO_OPTIONS, GEMINI_IMAGE_MODELS, IMAGE_STUDIO_EXAMPLE_PROMPTS, IMAGE_GENERATION_STYLES } from '../constants';
import type { AspectRatioOption, CustomFont, ContentType } from '../types';
import { resizeAndCropImage } from '../utils/image';
import ApiKeyManager from './ApiKeyManager';
import { apiKeyManager } from '../apiKeyManager';
import CanvasEditorModal from './CanvasEditor';

declare const fabric: any;

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

// FIX: Defined the missing PROMPT_ENHANCERS constant.
const PROMPT_ENHANCERS = [
    { name: 'واقعي', value: ', photorealistic, high detail' },
    { name: 'جودة 8K', value: ', 8k resolution, ultra high quality' },
    { name: 'سينمائي', value: ', cinematic lighting, epic' },
    { name: 'استوديو', value: ', studio photography, clean background' },
    { name: 'مفصل', value: ', hyper-detailed, intricate' },
    { name: 'ألوان زاهية', value: ', vibrant colors, rich color palette' },
];

const ImageAnalyzer: React.FC<{
    setMainPrompt: (prompt: string) => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    selectedTextModel: string;
}> = ({ setMainPrompt, logStatus, setError, selectedTextModel }) => {
    const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; dataUrl: string; } | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{ description: string; suggestedPrompt: string; } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const purpleButtonClasses = "w-full px-4 py-2 text-sm rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors duration-300";


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAnalysisResult(null); // Clear previous results
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result as string;
                    const base64Data = dataUrl.split(',')[1];
                    setUploadedImage({ data: base64Data, mimeType: file.type, dataUrl });
                };
                reader.onerror = () => setError("فشل في قراءة ملف الصورة.");
                reader.readAsDataURL(file);
            } catch (error) {
                setError("فشل في معالجة الصورة المرفوعة.");
            }
        }
    };

    const handleAnalyze = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        if (!uploadedImage) {
            setError("يرجى رفع صورة أولاً.");
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeImageForPrompt(uploadedImage.data, uploadedImage.mimeType, selectedTextModel, logStatus);
            setAnalysisResult(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        logStatus(`تم نسخ ${label} إلى الحافظة.`);
    };

    const handleUsePrompt = () => {
        if (analysisResult?.suggestedPrompt) {
            setMainPrompt(analysisResult.suggestedPrompt);
            logStatus("تم استخدام البرومبت المقترح.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/30 space-y-4">
            <h3 className="text-sm font-semibold text-center text-purple-400">🔬 محلل الصور (صورة ← برومبت)</h3>
            
            <div className="p-2 border-2 border-dashed border-gray-600 rounded-lg text-center">
                {uploadedImage ? (
                    <img src={uploadedImage.dataUrl} alt="Uploaded preview" className="max-h-48 mx-auto rounded" />
                ) : (
                    <p className="text-gray-500 text-sm py-8">ارفع صورة لتحليلها</p>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={purpleButtonClasses}
                >
                    اختر صورة...
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button
                    onClick={handleAnalyze}
                    disabled={!uploadedImage || isAnalyzing}
                    className="w-full px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400"
                >
                    {isAnalyzing ? <LoadingIndicator /> : 'تحليل الصورة'}
                </button>
            </div>

            {analysisResult && (
                <div className="pt-4 border-t border-purple-500/20 space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-400">وصف الصورة (بالعربية)</label>
                            <button onClick={() => handleCopy(analysisResult.description, 'الوصف')} className="px-2 py-1 text-xs rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40">نسخ</button>
                        </div>
                        <textarea
                            readOnly
                            value={analysisResult.description}
                            rows={5}
                            className="w-full bg-gray-800/60 border-gray-600 rounded-md p-2 text-sm text-gray-200 resize-y"
                        />
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-400">البرومبت المقترح (بالإنجليزية)</label>
                            <button onClick={() => handleCopy(analysisResult.suggestedPrompt, 'البرومبت')} className="px-2 py-1 text-xs rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40">نسخ</button>
                        </div>
                        <textarea
                            readOnly
                            value={analysisResult.suggestedPrompt}
                            rows={5}
                            className="w-full bg-gray-800/60 border-gray-600 rounded-md p-2 font-mono text-sm text-gray-200 resize-y"
                            dir="ltr"
                        />
                    </div>
                     <button
                        onClick={handleUsePrompt}
                        className="w-full px-4 py-2 text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                        استخدام هذا البرومبت
                    </button>
                </div>
            )}
        </div>
    );
};

// New Batch Image Analyzer Component
const BatchImageAnalyzer: React.FC<{
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    selectedTextModel: string;
}> = ({ logStatus, setError, selectedTextModel }) => {
    
    type AnalysisStatus = 'pending' | 'analyzing' | 'done' | 'error';
    interface AnalysisResult {
        id: number;
        fileName: string;
        imageData: { data: string; mimeType: string; dataUrl: string; };
        status: AnalysisStatus;
        description?: string;
        suggestedPrompt?: string;
        error?: string;
    }

    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const purpleButtonClasses = "w-full px-4 py-2 text-sm rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors duration-300";

    const fileToDataObject = (file: File): Promise<{ data: string; mimeType: string; dataUrl: string; }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64Data = dataUrl.split(',')[1];
                resolve({ data: base64Data, mimeType: file.type, dataUrl });
            };
            // FIX: Reject with a proper Error object for better error handling downstream.
            reader.onerror = () => reject(new Error(reader.error?.message || 'File reading failed.'));
            reader.readAsDataURL(file);
        });
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;
            logStatus(`تم اختيار ${files.length} صور للتحليل الدفعي.`);
            setResults([]);
            setSelectedIds(new Set());
            
            const newResults: AnalysisResult[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // FIX: Add type guard to ensure `file` is treated as a File object, which resolves the 'unknown' type errors.
                if (file instanceof File) {
                    try {
                        const imageData = await fileToDataObject(file);
                        newResults.push({
                            id: Date.now() + i,
                            fileName: file.name,
                            imageData,
                            status: 'pending',
                        });
                    } catch (e: unknown) {
                        // FIX: Handle `e` as unknown and provide a more informative error message.
                        const errorMessage = e instanceof Error ? e.message : String(e);
                        setError(`فشل في قراءة الملف: ${file.name}. الخطأ: ${errorMessage}`);
                    }
                }
            }
            setResults(newResults);
             if (event.target) event.target.value = ''; // Allow re-uploading same files
        }
    };
    
    const handleStartAnalysis = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        if (results.length === 0) {
            setError("يرجى رفع الصور أولاً.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        logStatus(`--- بدء تحليل ${results.length} صور ---`);

        const analysisPromises = results.map(async (result) => {
            setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'analyzing' } : r));
            try {
                const analysisData = await analyzeImageForPrompt(
                    result.imageData.data,
                    result.imageData.mimeType,
                    selectedTextModel,
                    () => {} // Suppress individual logs for cleaner main log
                );
                logStatus(`✅ تم تحليل الصورة: ${result.fileName}`);
                setResults(prev => prev.map(r => r.id === result.id ? { ...r, ...analysisData, status: 'done' } : r));
            } catch (e: any) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                logStatus(`❌ فشل تحليل الصورة: ${result.fileName}. الخطأ: ${errorMessage}`);
                setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'error', error: errorMessage } : r));
            }
        });

        await Promise.all(analysisPromises);
        
        setIsAnalyzing(false);
        logStatus("--- اكتمل التحليل الدفعي ---");
    };

    const handleSelectionChange = (id: number) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
        } else {
            newSelectedIds.add(id);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(results.filter(r => r.status === 'done').map(r => r.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleDownload = () => {
        if (selectedIds.size === 0) {
            setError("يرجى تحديد نتيجة واحدة على الأقل لتنزيلها.");
            return;
        }

        let content = '';
        results.forEach(result => {
            if (selectedIds.has(result.id)) {
                content += `========================================\n`;
                content += `Image: ${result.fileName}\n`;
                content += `========================================\n\n`;
                content += `--- الوصف (بالعربية) ---\n`;
                content += `${result.description || 'لم يتم إنشاء وصف.'}\n\n`;
                content += `--- البرومبت المقترح (بالإنجليزية) ---\n`;
                content += `${result.suggestedPrompt || 'لم يتم إنشاء برومبت.'}\n\n\n`;
            }
        });
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `horus-image-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        logStatus(`تم تنزيل تحليل ${selectedIds.size} صور.`);
    };

    const doneCount = results.filter(r => r.status === 'done').length;
    const allProcessed = results.every(r => r.status === 'done' || r.status === 'error');

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className={purpleButtonClasses}>
                    اختر صور متعددة...
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                <button onClick={handleStartAnalysis} disabled={results.length === 0 || isAnalyzing} className="w-full px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400">
                    {isAnalyzing ? <LoadingIndicator /> : `حلل (${results.length}) صور`}
                </button>
            </div>

            {results.length > 0 && (
                <div className="pt-4 border-t border-purple-500/20 space-y-4">
                    {allProcessed && doneCount > 0 && (
                         <div className="p-3 bg-gray-800 rounded-lg flex items-center justify-between gap-4">
                             <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                                 <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === doneCount && doneCount > 0} className="h-4 w-4 rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-900" />
                                 تحديد الكل ({selectedIds.size} / {doneCount})
                             </label>
                             <button onClick={handleDownload} disabled={selectedIds.size === 0} className="px-4 py-2 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-green-500/50 disabled:cursor-not-allowed">
                                 <i className="fas fa-download mr-2"></i>تنزيل المحدد كملف TXT
                             </button>
                         </div>
                    )}
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {results.map((result) => (
                            <div key={result.id} className="p-3 bg-gray-800/70 rounded-lg border border-gray-700 flex gap-4 items-start">
                                 {result.status === 'done' && (
                                    <div className="flex-shrink-0 pt-1">
                                        <input type="checkbox" checked={selectedIds.has(result.id)} onChange={() => handleSelectionChange(result.id)} className="h-5 w-5 rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-900 cursor-pointer"/>
                                    </div>
                                )}
                                <div className="flex-shrink-0">
                                    <img src={result.imageData.dataUrl} alt={result.fileName} className="w-24 h-24 object-cover rounded" />
                                    <p className="text-xs text-gray-500 mt-1 truncate w-24">{result.fileName}</p>
                                </div>
                                <div className="flex-grow space-y-2">
                                    {result.status === 'pending' && <p className="text-gray-400">⏳ في انتظار التحليل...</p>}
                                    {result.status === 'analyzing' && <div className="flex items-center gap-2 text-cyan-400"><LoadingIndicator /> <span>جاري التحليل...</span></div>}
                                    {result.status === 'error' && <p className="text-red-400">❌ خطأ: {result.error}</p>}
                                    {result.status === 'done' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">الوصف (بالعربية)</label>
                                                <textarea readOnly value={result.description} rows={3} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 text-sm text-gray-200 resize-y" />
                                            </div>
                                             <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">البرومبت المقترح (بالإنجليزية)</label>
                                                <textarea readOnly value={result.suggestedPrompt} rows={3} className="w-full bg-gray-900/70 border-gray-600 rounded-md p-2 font-mono text-sm text-gray-200 resize-y" dir="ltr" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


interface ImageStudioProps {
  imgbbApiKey: string;
  setImgbbApiKey: (key: string) => void; 
  geminiApiKeys: string[]; 
  setGeminiApiKeys: (keys: string[]) => void; 
  activeKeyIndex: number; 
  setActiveKeyIndex: (index: number) => void; 
  logStatus: (message: string) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  onNavigateHome: () => void;
  selectedImageModel: string;
  setSelectedImageModel: (model: string) => void;
  selectedTextModel: string;
  customFonts: CustomFont[];
}

export const ImageStudio: React.FC<ImageStudioProps> = (props) => {
    const { 
        imgbbApiKey,
        selectedImageModel, setSelectedImageModel,
        logStatus, setError, setWarning, onNavigateHome,
        selectedTextModel, customFonts
    } = props;

    const [mainPrompt, setMainPrompt] = useState('');
    const [selectedAspectRatioLabel, setSelectedAspectRatioLabel] = useState<string>(ASPECT_RATIO_OPTIONS[0].label);
    const [isLogoMode, setIsLogoMode] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editedPreview, setEditedPreview] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'export'>('view');
    
    // Export state
    const [exportQuality, setExportQuality] = useState(0.9);
    const [exportSlug, setExportSlug] = useState('');
    
    const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
    const [showExamples, setShowExamples] = useState(false);
    const [isBatchAnalyzerOpen, setIsBatchAnalyzerOpen] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [useCreativeBypass, setUseCreativeBypass] = useState(true);
    const [imageStyle, setImageStyle] = useState(IMAGE_GENERATION_STYLES[0].prompt);
    const [typographyStyle, setTypographyStyle] = useState('none');
    const [textToRender, setTextToRender] = useState('');

    const smallPurpleGlassButton = "p-2 text-xs rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors duration-300";

    const PROMPT_ENHANCERS_NEW = [
        { name: 'ألوان زاهية', value: ', vibrant colors, bright and lively tones' },
        { name: 'أسلوب فني', value: ', in a symbolic artistic non-realistic style' },
        { name: 'سينمائي', value: ', cinematic lighting, epic composition' },
        { name: 'واقعي', value: ', photorealistic, high detail' },
        { name: 'تجنب الأخطاء', value: ', correct any mistakes, ensure logical consistency' },
    ];


    const selectedAspectRatioOption = useMemo(() => {
        return ASPECT_RATIO_OPTIONS.find(opt => opt.label === selectedAspectRatioLabel) || ASPECT_RATIO_OPTIONS[0];
    }, [selectedAspectRatioLabel]);


    const handleGenerateSuggestions = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        if (!mainPrompt.trim()) {
            setError("يرجى كتابة فكرة أولية في صندوق البرومبت أولاً.");
            return;
        }
        setIsGeneratingSuggestions(true);
        setPromptSuggestions([]);
        try {
            const suggestions = await generatePromptSuggestions(mainPrompt, logStatus);
            setPromptSuggestions(suggestions);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const handleGenerate = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        if (!mainPrompt.trim()) {
            setError("يرجى إدخال وصف (برومبت) للصورة.");
            return;
        }
        if (typographyStyle !== 'none' && !textToRender.trim()) {
            setError("يرجى إدخال النص المراد إضافته للصورة عند استخدام نمط الخط.");
            return;
        }
        if (!exportSlug.trim()) {
            setError("يرجى إدخال اسم مخصص (Slug) للصورة قبل الإنشاء.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setWarning(null);
        logStatus(`--- 🎨 بدء إنشاء صورة في الاستوديو ---`);
        
        try {
            const resizeOptions = (selectedAspectRatioOption.width && selectedAspectRatioOption.height) 
                ? { width: selectedAspectRatioOption.width, height: selectedAspectRatioOption.height } 
                : undefined;
    
            const { imageUrl: finalImageUrl, warning } = await generateImageAndUrl(
                mainPrompt,
                exportSlug,
                imgbbApiKey,
                selectedImageModel,
                logStatus,
                { 
                    aspectRatio: selectedAspectRatioOption.aspectRatioValue,
                    isLogoMode: isLogoMode,
                    quality: exportQuality,
                    resize: resizeOptions,
                    useCreativeBypass: useCreativeBypass,
                    imageStylePrompt: imageStyle,
                    typographyStyle: typographyStyle === 'none' ? undefined : typographyStyle,
                    articleTitle: textToRender,
                }
            );
            
            if (warning) { setWarning(warning); }

            const newImages = [finalImageUrl, ...generatedImages];
            setGeneratedImages(newImages);
            setSelectedImage(finalImageUrl);
            setEditedPreview(null);
            setActiveTab('view');
            logStatus(`✅ تم إنشاء الصورة ومعالجتها ورفعها بنجاح.`);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!selectedImage) return;
        const name = exportSlug || `horus-image-${Date.now()}`;
        logStatus("...جاري تحضير الصورة للتحميل");
        try {
            const response = await fetch(selectedImage);
            if (!response.ok) throw new Error(`فشل جلب الصورة. الحالة: ${response.status}`);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${name}.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
            logStatus("✅ تم بدء تحميل الصورة بنجاح.");
        } catch (err) {
            console.error("Download failed:", err);
            setError("فشل التحميل المباشر. قد يكون السبب مشكلة في الشبكة أو قيود CORS. سيتم فتح الصورة في علامة تبويب جديدة لحفظها يدويًا.");
            window.open(selectedImage, '_blank');
        }
    };
    
    const handleSaveEdits = (dataUrl: string) => {
        const newImages = [dataUrl, ...generatedImages];
        setGeneratedImages(newImages);
        setSelectedImage(dataUrl);
        setEditedPreview(null);
        setActiveTab('view');
        logStatus("✅ تم حفظ التعديلات اليدوية.");
    };

  return (
    <>
      <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors z-20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          العودة للرئيسية
      </button>
       <div className="flex flex-col items-center gap-4 text-center my-6">
            <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                <i className="fas fa-palette relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
            </div>
            <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                استوديو الصور الاحترافي
            </h2>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
          {/* Controls Column */}
          <div className="lg:col-span-1 flex flex-col gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-fit">
              <textarea id="main-prompt" rows={5} value={mainPrompt} onChange={(e) => setMainPrompt(e.target.value)} placeholder="اكتب فكرتك الأولية هنا بالإنجليزية..." className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={useCreativeBypass} onChange={e => setUseCreativeBypass(e.target.checked)} className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🎨 تطبيق الفلتر الفني الإبداعي (لتجنب القيود)</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">يحول الأوصاف تلقائيًا إلى سياق فني خيالي لتجاوز فلاتر الأمان.</p>
                </div>
              
              <div className="grid grid-cols-3 gap-2">
                {PROMPT_ENHANCERS_NEW.map(p => <button key={p.name} onClick={() => setMainPrompt(prev => prev + p.value)} className={smallPurpleGlassButton}>{p.name}</button>)}
              </div>
              
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🎨 نمط الصورة العام</label>
                    <select
                        value={imageStyle}
                        onChange={e => setImageStyle(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                    >
                        {IMAGE_GENERATION_STYLES.map(style => (
                            <option key={style.name} value={style.prompt}>{style.name}</option>
                        ))}
                    </select>
                </div>
                
                 <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <button 
                        onClick={() => setImageStyle(IMAGE_GENERATION_STYLES.find(s => s.name.includes('ديزني-بيكسار'))?.prompt || '')} 
                        className="w-full p-3 rounded-lg font-bold glowing-pixar-btn flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-magic"></i>
                        {IMAGE_GENERATION_STYLES.find(s => s.name.includes('ديزني-بيكسار'))?.name}
                    </button>
                    <button 
                        onClick={() => setMainPrompt(prev => prev + ', 8K resolution, masterpiece, ultra high quality, photorealistic')} 
                        className="w-full p-3 rounded-lg font-bold glowing-8k-btn flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-star"></i>
                        8K جودة فائقة
                    </button>
                </div>


                {/* 3D Typography Section */}
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-3 border border-purple-500/20">
                    <h4 className="text-sm font-bold text-center text-purple-400">✍️ نمط الخط ثلاثي الأبعاد (اختياري)</h4>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">اختر الستايل</label>
                        <select value={typographyStyle} onChange={e => setTypographyStyle(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                            {TYPOGRAPHY_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    {typographyStyle !== 'none' && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">النص المراد إضافته (بالإنجليزية)</label>
                            <input type="text" value={textToRender} onChange={e => setTextToRender(e.target.value)} placeholder="مثال: ISRA IRAN" className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                        </div>
                    )}
                </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-2">
                <div className="flex gap-2">
                    <button onClick={handleGenerateSuggestions} disabled={isGeneratingSuggestions} className="w-full px-3 py-2 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2">
                        {isGeneratingSuggestions ? <LoadingIndicator /> : <>💡 توليد برومبتات احترافية</>}
                    </button>
                    <button onClick={() => setShowExamples(!showExamples)} className="w-full px-3 py-2 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2">
                        {showExamples ? '🙈 إخفاء الأمثلة' : '✨ إظهار أمثلة'}
                    </button>
                </div>
                {promptSuggestions.map((s, i) => <button key={i} onClick={() => setMainPrompt(s)} className="w-full p-2 text-xs text-left bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-800 truncate">{s}</button>)}
                
                {showExamples && (
                    <div className="pt-3 mt-3 border-t border-gray-300 dark:border-gray-600 space-y-2">
                        {IMAGE_STUDIO_EXAMPLE_PROMPTS.map((p, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setMainPrompt(p.prompt); }} 
                                title={p.prompt} 
                                className="w-full p-2 text-xs text-left bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-gray-300 dark:border-gray-700 transition-colors"
                            >
                                <strong className="block text-cyan-600 dark:text-cyan-400 font-semibold">{p.name}</strong>
                                <span className="block opacity-80 whitespace-normal">{p.prompt.substring(0, 100)}...</span>
                            </button>
                        ))}
                    </div>
                )}
              </div>
              
              <div>
                  <label htmlFor="image-model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نموذج الصورة</label>
                  <select id="image-model-select" value={selectedImageModel} onChange={(e) => setSelectedImageModel(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      {GEMINI_IMAGE_MODELS.map(model => (
                          <option key={model.value} value={model.value} disabled={model.disabled} title={model.title}>{model.name}</option>
                      ))}
                  </select>
              </div>

              <select id="aspect-ratio-select" value={selectedAspectRatioLabel} onChange={(e) => setSelectedAspectRatioLabel(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  {Object.entries(ASPECT_RATIO_OPTIONS.reduce((acc, option) => {
                      if (!acc[option.category]) acc[option.category] = [];
                      acc[option.category].push(option);
                      return acc;
                  }, {} as Record<string, AspectRatioOption[]>)).map(([category, options]) => (
                      <optgroup label={category} key={category}>
                          {options.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
                      </optgroup>
                  ))}
              </select>

              <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-center text-gray-500 dark:text-gray-400">إعدادات الملف النهائي</h4>
                  <div>
                      <label htmlFor="export-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم المخصص (Slug)</label>
                      <input id="export-slug" type="text" value={exportSlug} onChange={e => setExportSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="horus-generated-image" className="w-full bg-white dark:bg-gray-900 p-2 rounded-md border border-gray-300 dark:border-gray-600 font-mono text-sm" />
                  </div>
                  <div>
                      <label htmlFor="export-quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جودة الضغط: <span className="font-bold text-cyan-500">{Math.round(exportQuality * 100)}%</span></label>
                      <input id="export-quality" type="range" min="0.1" max="1" step="0.05" value={exportQuality} onChange={e => setExportQuality(parseFloat(e.target.value))} className="w-full" />
                  </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                  <input type="checkbox" checked={isLogoMode} onChange={e => setIsLogoMode(e.target.checked)} className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🛡️ وضع إنشاء الشعارات (يستخدم برومبت مخصص)</span>
              </label>
              
              <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2 h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
                  {isLoading ? <LoadingIndicator /> : '🚀 إنشاء الصورة'}
              </button>
              
              <ImageAnalyzer 
                setMainPrompt={setMainPrompt}
                logStatus={logStatus}
                setError={setError}
                selectedTextModel={selectedTextModel}
              />

              <div className="p-0 bg-gray-900/50 rounded-lg border border-purple-500/30 mt-4">
                  <button
                      onClick={() => setIsBatchAnalyzerOpen(!isBatchAnalyzerOpen)}
                      className="w-full flex justify-between items-center p-3 text-left"
                      aria-expanded={isBatchAnalyzerOpen}
                  >
                      <h3 className="text-sm font-semibold text-purple-400">📦 محلل الصور الدفعي (صور متعددة ← نص)</h3>
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${isBatchAnalyzerOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                  </button>
                  {isBatchAnalyzerOpen && (
                      <div className="p-4 border-t border-purple-500/20">
                          <BatchImageAnalyzer 
                              logStatus={logStatus}
                              setError={setError}
                              selectedTextModel={selectedTextModel}
                          />
                      </div>
                  )}
              </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col flex-grow">
                  <div className="border-b border-gray-300 dark:border-gray-600 flex mb-4">
                        <button onClick={() => setActiveTab('view')} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'view' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-cyan-600'}`}>المعاينة</button>
                        <button onClick={() => selectedImage && setIsEditorOpen(true)} disabled={!selectedImage} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'edit' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-cyan-600'} disabled:text-gray-500 disabled:cursor-not-allowed`}>محرر Canva</button>
                        <button onClick={() => setActiveTab('export')} disabled={!selectedImage} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'export' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-cyan-600'} disabled:text-gray-500 disabled:cursor-not-allowed`}>الرابط النهائي</button>
                  </div>
                  
                  {activeTab === 'view' && (
                    <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900/50 rounded-lg min-h-[300px] p-2">
                        {!selectedImage ? <p className="text-gray-500">ستظهر الصورة هنا</p> : <img src={editedPreview || selectedImage} alt="Art" className="max-w-full max-h-full object-contain rounded-md" />}
                    </div>
                  )}

                  {activeTab === 'export' && selectedImage && (
                      <div className="space-y-4">
                          <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">الرابط النهائي للصورة</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedImage.startsWith('data:') 
                                  ? 'تم إنشاء الصورة كرابط بيانات مؤقت لأنه لم يتم توفير مفتاح ImgBB API عند الإنشاء. يمكنك نسخ رابط البيانات أو إضافة مفتاح API وإعادة الإنشاء للحصول على رابط مستضاف.'
                                  : 'تم رفع الصورة بنجاح. يمكنك نسخ الرابط المستضاف أدناه.'
                              }
                          </p>
                          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                              <input
                                  type="text"
                                  readOnly
                                  value={selectedImage}
                                  className="flex-grow bg-transparent text-xs font-mono text-cyan-700 dark:text-cyan-300 p-1"
                              />
                              <button onClick={() => { navigator.clipboard.writeText(selectedImage); logStatus("تم نسخ الرابط."); }} className="px-3 py-1 text-xs rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40">
                                  نسخ
                              </button>
                              <button onClick={handleDownloadImage} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700">
                                  تحميل
                              </button>
                          </div>
                      </div>
                  )}
              </div>
              
              <div className="h-28 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto">
                  <div className="flex h-full gap-3">
                      {generatedImages.map((imgUrl, i) => <img key={i} src={imgUrl} onClick={() => { setSelectedImage(imgUrl); setEditedPreview(null); setActiveTab('view'); }} className={`h-full w-auto rounded-md cursor-pointer border-2 ${selectedImage === imgUrl ? 'border-cyan-500' : 'border-transparent hover:border-cyan-400'}`} />)}
                  </div>
              </div>
          </div>
      </div>
      {isEditorOpen && selectedImage && (
        <CanvasEditorModal
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveEdits}
            initialImageUrl={selectedImage}
            customFonts={customFonts}
            logStatus={logStatus}
            setError={setError}
            imgbbApiKey={imgbbApiKey}
            slug={exportSlug}
        />
      )}
    </>
  );
};