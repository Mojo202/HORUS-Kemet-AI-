import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fileToImageObject } from '../../utils/file';
import { editImage } from '../../services/geminiService';
import LoadingIndicator from '../LoadingIndicator';
import { CustomFont } from '../../types';
import { convertToWebp } from '../../utils/image';

// Import CanvasEditorModal from its new standalone file
import CanvasEditorModal from '../CanvasEditor';

interface NanoBananaStudioProps {
    onNavigateHome: () => void;
    globalProps: any;
}

const QUICK_EFFECTS = [
    { name: 'إزالة الخلفية', prompt: 'Remove the background, make it transparent png', icon: 'fas fa-eraser' },
    { name: 'نمط قديم', prompt: 'Apply a vintage, sepia-toned filter. Add subtle film grain and scratches.', icon: 'fas fa-camera-retro' },
    { name: 'لوحة زيتية', prompt: 'Transform this into a detailed, textured oil painting.', icon: 'fas fa-palette' },
    { name: 'فن البوب', prompt: 'Convert this into a vibrant pop art style, like Andy Warhol.', icon: 'fas fa-paint-brush' },
    { name: 'تحسين تلقائي', prompt: 'Automatically enhance the colors, brightness, and sharpness of the image.', icon: 'fas fa-magic' },
    { name: 'أنمي', prompt: 'Redraw this image in a vibrant, high-quality Japanese anime style.', icon: 'fas fa-dragon' },
    { name: 'نيون', prompt: 'Give this image a futuristic, glowing neon effect with vibrant, electric colors.', icon: 'fas fa-lightbulb' },
    { name: 'رسم فني', prompt: 'Transform this into a detailed pencil sketch drawing on white paper.', icon: 'fas fa-pencil-alt' },
];


const NanoBananaStudio: React.FC<NanoBananaStudioProps> = ({ onNavigateHome, globalProps }) => {
    const { logStatus, setError, setWarning, imgbbApiKey, customFonts } = globalProps;

    const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; dataUrl: string; } | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const [prompt, setPrompt] = useState('');
    const [slug, setSlug] = useState('');
    
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            setError('يرجى رفع ملف صورة صالح.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64Data = dataUrl.split(',')[1];
                setUploadedImage({ data: base64Data, mimeType: file.type, dataUrl });
                setResultImage(dataUrl); 
                 if (!slug) {
                    setSlug(file.name.split('.').slice(0, -1).join('.').toLowerCase().replace(/[^a-z0-9-]/g, ''));
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setError("فشل في معالجة الصورة المرفوعة.");
        }
    };
    
    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileChange(e.dataTransfer.files); },
    };

    const handleAiEdit = async (selectedPrompt?: string) => {
        if (!resultImage) {
            setError("يرجى رفع صورة أولاً.");
            return;
        }

        let basePrompt = selectedPrompt || prompt;
        if (!basePrompt.trim()) {
            setError("يرجى كتابة أمر تعديل، أو اختيار تأثير سريع.");
            return;
        }

        const finalPrompt = basePrompt + ' | IMPORTANT: The final output image must be ultra high quality, 4K resolution, with vibrant colors. Any text generated on the image must be in English.';

        setIsLoading(true);
        setError(null);
        logStatus(`🍌 بدء التعديل بالذكاء الاصطناعي: "${finalPrompt}"...`);

        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                const imageObject = { data: base64data, mimeType: blob.type };

                const { imageUrl, warning } = await editImage([imageObject], finalPrompt, slug || 'nano-banana-edit', imgbbApiKey, logStatus);
                setResultImage(imageUrl);
                if (warning) setWarning(warning);
                logStatus("✅ اكتمل التعديل بنجاح!");
            };
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = async () => {
        if (!resultImage) return;
        try {
            const webpDataUrl = await convertToWebp(resultImage, 0.95);
            const link = document.createElement('a');
            link.href = webpDataUrl;
            link.download = `${slug || 'edited-image'}.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(webpDataUrl);
        } catch (e) {
            setError("فشل تحويل الصورة إلى WebP.");
        }
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="nano-banner mt-36">
                <span className="nano-banana-icon-banner">🍌</span>
                <h1 className="nano-title text-center">استوديو نانو بنانا</h1>
            </div>

            <div className="w-full mx-auto flex flex-col lg:flex-row gap-6">
                {/* Controls Sidebar */}
                <aside className="lg:w-96 flex-shrink-0 bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4 h-fit">
                    <div className="space-y-3">
                         <h3 className="text-sm font-bold text-center text-yellow-300">1. ارفع صورتك</h3>
                         <div {...dragEvents} onClick={() => fileInputRef.current?.click()} className={`relative w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center ${isDragging ? 'border-yellow-400 bg-yellow-900/40' : 'border-gray-600 hover:border-yellow-500 hover:bg-yellow-900/20'}`}>
                            <i className={`fas fa-image text-4xl mb-2 transition-colors ${isDragging ? 'text-yellow-300' : 'text-gray-500'}`}></i>
                            <p className="text-sm font-semibold text-gray-300">اسحب وأفلت أو انقر للاختيار</p>
                            <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e.target.files)} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-700">
                         <h3 className="text-sm font-bold text-center text-yellow-300">2. اختر تأثيرًا أو اكتب أمرًا</h3>
                         <p className="text-xs text-center text-gray-400">تأثيرات سريعة:</p>
                         <div className="grid grid-cols-2 gap-2">
                            {QUICK_EFFECTS.map(effect => (
                                <button key={effect.name} onClick={() => handleAiEdit(effect.prompt)} disabled={isLoading || !uploadedImage} className="p-2 text-xs rounded-lg glassy-yellow-btn flex flex-col items-center gap-2 h-16 justify-center">
                                    <i className={effect.icon}></i>
                                    <span>{effect.name}</span>
                                </button>
                            ))}
                        </div>
                         <p className="text-xs text-center text-gray-400 pt-2">أو اكتب أمرًا مخصصًا:</p>
                         <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder="مثال: اجعل السماء بنفسجية..." className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-200" />
                    </div>

                     <div className="space-y-3 pt-3 border-t border-gray-700">
                        <h3 className="text-sm font-bold text-center text-yellow-300">3. نفّذ واحفظ</h3>
                        <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="اسم الملف للحفظ..." className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-200" />
                        <button onClick={() => handleAiEdit()} disabled={isLoading || !uploadedImage || !prompt.trim()} className="w-full h-10 text-sm font-bold glassy-yellow-btn flex items-center justify-center">
                            {isLoading ? <LoadingIndicator /> : "🚀 نفّذ التعديل المخصص"}
                        </button>
                         <div className="flex gap-2">
                             <button onClick={() => setIsEditorOpen(true)} disabled={!resultImage} className="w-full glassy-yellow-btn p-2 text-sm">
                                <i className="fas fa-edit mr-1"></i>تعديل متقدم
                            </button>
                            <button onClick={handleDownload} disabled={!resultImage} className="w-full glassy-yellow-btn p-2 text-sm">
                                <i className="fas fa-download mr-1"></i>تنزيل
                            </button>
                         </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-grow bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col items-center justify-center min-h-[70vh]">
                     {resultImage ? (
                        <div className="w-full h-full flex items-center justify-center relative">
                            <img src={resultImage} alt="Edited" className="max-w-full max-h-full object-contain rounded-md" />
                            {isLoading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md"><LoadingIndicator /></div>}
                        </div>
                    ) : (
                         <div className="text-center text-gray-500">
                             <p>ارفع صورة من الشريط الجانبي لبدء التعديل</p>
                        </div>
                    )}
                </main>
            </div>

            {isEditorOpen && resultImage && (
                <CanvasEditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={(dataUrl) => {
                        setResultImage(dataUrl);
                        setUploadedImage(prev => prev ? { ...prev, dataUrl: dataUrl, data: dataUrl.split(',')[1] } : null);
                        setIsEditorOpen(false);
                        logStatus('✅ تم تطبيق تعديلات المحرر المتقدم.');
                    }}
                    initialImageUrl={resultImage}
                    customFonts={customFonts as CustomFont[]}
                    logStatus={logStatus}
                    setError={setError}
                    imgbbApiKey={imgbbApiKey}
                    slug={slug}
                />
            )}
        </>
    );
};

export default NanoBananaStudio;