import React, { useState, useRef } from 'react';
import { fileToImageObject } from '../utils/file';
import { generateSlugForImage, uploadImageToHost } from '../services/geminiService';
import { convertToWebp } from '../utils/image';
import LoadingIndicator from './LoadingIndicator';

interface ImageInserterModalProps {
    isOpen: boolean;
    onClose: () => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    imgbbApiKey: string;
}

const ImageInserterModal: React.FC<ImageInserterModalProps> = ({ isOpen, onClose, logStatus, setError, imgbbApiKey }) => {
    const [image, setImage] = useState<{ file: File; dataUrl: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ slug: string; description: string; hostedUrl: string; } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setResult(null);
            const reader = new FileReader();
            reader.onload = () => {
                setImage({ file, dataUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setResult(null);
                const reader = new FileReader();
                reader.onload = () => {
                    setImage({ file, dataUrl: reader.result as string });
                };
                reader.readAsDataURL(file);
            }
        },
    };
    
    const handleGenerateAndUpload = async () => {
        if (!image) {
            setError("يرجى رفع صورة أولاً.");
            return;
        }
        if (!imgbbApiKey) {
            setError("يرجى إضافة مفتاح ImgBB API في الإعدادات لرفع الصور.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            logStatus("🧠 تحليل الصورة لإنشاء Slug ووصف...");
            const { data, mimeType } = await fileToImageObject(image.file);
            const { slug, description } = await generateSlugForImage(data, mimeType, logStatus);
            
            logStatus(`🖼️ تحويل الصورة إلى صيغة WebP...`);
            const webpDataUrl = await convertToWebp(image.dataUrl, 0.9);
            const webpBase64 = webpDataUrl.split(',')[1];
            
            logStatus(`☁️ رفع صورة WebP إلى الاستضافة باسم: ${slug}.webp`);
            const hostedUrl = await uploadImageToHost(webpBase64, imgbbApiKey, slug);

            setResult({ slug, description, hostedUrl });
            logStatus("✅ اكتملت العملية بنجاح.");

        } catch (e: any) {
            const message = e.message || "حدث خطأ غير معروف.";
            setError(message);
            logStatus(`❌ فشلت العملية: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        logStatus(`تم نسخ: "${text.substring(0,30)}..."`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-green-500/30" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-green-400 flex items-center gap-3"><i className="fas fa-image"></i> أداة إدراج الصور المتقدمة</h3>
                    <button onClick={onClose} className="text-gray-400 text-2xl hover:text-white">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                    {/* Image Preview Column */}
                    <div 
                        {...handleDragEvents}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full aspect-video border-4 border-dashed rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center ${isDragging ? 'border-green-400 bg-green-900/40' : 'border-gray-600 hover:border-green-500 hover:bg-green-900/20'}`}
                    >
                        {image ? (
                            <img src={image.dataUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                            <div className="text-gray-500">
                                <i className="fas fa-cloud-upload-alt text-6xl mb-4"></i>
                                <p className="font-semibold text-gray-300">اسحب وأفلت الصورة هنا</p>
                                <p className="text-sm">أو انقر للاختيار من جهازك</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    {/* Controls Column */}
                    <div className="relative flex flex-col gap-6">
                        {isLoading && (
                            <div className="absolute inset-0 bg-gray-800/80 rounded-lg flex flex-col items-center justify-center z-10">
                                <LoadingIndicator />
                                <p className="mt-4 text-green-300">جاري المعالجة...</p>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-green-400 flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 bg-green-500 text-black rounded-full font-bold text-sm">1</span> ارفع الصورة</h4>
                            <p className="text-xs text-gray-400 pl-8">اختر صورة من جهازك. سيتم تحليلها لإنشاء اسم ووصف تلقائيًا.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-green-400 flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 bg-green-500 text-black rounded-full font-bold text-sm">2</span> أنشئ وارفع</h4>
                            <p className="text-xs text-gray-400 pl-8">سيتم تحويل الصورة إلى WebP، رفعها، وإنشاء كود HTML جاهز.</p>
                             <button onClick={handleGenerateAndUpload} disabled={isLoading || !image} className="w-full mt-2 h-12 text-lg font-bold glassy-green-btn flex items-center justify-center">
                                {isLoading ? 'جاري...' : '🚀 إنشاء ورفع'}
                            </button>
                        </div>

                        {result && (
                            <div className="space-y-3 pt-4 border-t border-gray-700">
                                <h4 className="text-lg font-bold text-green-400 flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 bg-green-500 text-black rounded-full font-bold text-sm">3</span> انسخ النتائج</h4>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">كود HTML الكامل:</label>
                                    <div className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                                        <input type="text" readOnly value={`<img src="${result.hostedUrl}" alt="${result.description}" title="${result.description}" />`} className="flex-grow bg-transparent text-xs font-mono text-cyan-300 p-1" />
                                        <button onClick={() => handleCopy(`<img src="${result.hostedUrl}" alt="${result.description}" title="${result.description}" />`)} className="px-3 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-500">نسخ</button>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <label className="text-xs text-gray-400">رابط الصورة (URL):</label>
                                    <div className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                                        <input type="text" readOnly value={result.hostedUrl} className="flex-grow bg-transparent text-xs font-mono text-cyan-300 p-1" />
                                        <button onClick={() => handleCopy(result.hostedUrl)} className="px-3 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-500">نسخ</button>
                                    </div>
                                 </div>
                                  <div className="space-y-2">
                                    <label className="text-xs text-gray-400">الوصف (Alt Text):</label>
                                    <div className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                                        <input type="text" readOnly value={result.description} className="flex-grow bg-transparent text-xs text-cyan-300 p-1" />
                                        <button onClick={() => handleCopy(result.description)} className="px-3 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-500">نسخ</button>
                                    </div>
                                 </div>
                            </div>
                        )}
                    </div>
                </div>

                 <div className="flex justify-end p-4 border-t border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-500">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default ImageInserterModal;