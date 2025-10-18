import React, { useState, useRef, useCallback } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';
import { fileToText } from '../../utils/file'; // Assuming you have a utility for this

interface ImageFile {
    id: string;
    file: File;
    previewUrl: string;
}

const AdvancedImageEnhancer: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [watermark, setWatermark] = useState('');
    const [maxWidth, setMaxWidth] = useState('1280');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((files: FileList | null) => {
        if (!files) return;
        const newImages: ImageFile[] = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                id: `${file.name}-${Date.now()}`,
                file,
                previewUrl: URL.createObjectURL(file),
            }));
        setImages(prev => [...prev, ...newImages]);
    }, []);

    const handleProcess = () => {
        if (images.length === 0) {
            setError('يرجى رفع صورة واحدة على الأقل.');
            return;
        }
        setIsProcessing(true);
        logStatus(`بدء معالجة ${images.length} صور...`);
        // Placeholder for actual image processing logic (e.g., using canvas)
        setTimeout(() => {
            logStatus('✅ تمت معالجة الصور بنجاح (محاكاة).');
            setIsProcessing(false);
        }, 2000);
    };

    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileChange(e.dataTransfer.files); },
    };
    
    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="محسّن الصور المتقدم" iconClass="fas fa-photo-video" />

            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                <div 
                    {...dragEvents}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full p-10 border-4 border-dashed rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center ${isDragging ? 'border-cyan-400 bg-cyan-900/40' : 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-900/20'}`}
                >
                    <i className={`fas fa-cloud-upload-alt text-6xl mb-4 transition-colors ${isDragging ? 'text-cyan-300' : 'text-gray-500'}`}></i>
                    <p className={`font-semibold transition-colors ${isDragging ? 'text-cyan-200' : 'text-gray-700 dark:text-gray-300'}`}>اسحب وأفلت الصور هنا، أو انقر للاختيار</p>
                    <p className={`text-sm transition-colors ${isDragging ? 'text-cyan-300' : 'text-gray-500'}`}>يمكنك رفع ملفات متعددة (JPG, PNG)</p>
                    <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e.target.files)} multiple accept="image/*" className="hidden" />
                </div>
                
                {images.length > 0 && (
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h4 className="font-semibold text-purple-300 mb-3">الصور المرفوعة ({images.length})</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((img, i) => (
                                <div key={img.id} className="relative aspect-square bg-gray-900 rounded-md overflow-hidden" style={{ animation: `fadeIn 0.5s ${i * 0.05}s ease-out forwards`, opacity: 0 }}>
                                    <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">نص العلامة المائية (Watermark)</label>
                        <input type="text" value={watermark} onChange={e => setWatermark(e.target.value)} placeholder="مثال: © yoursite.com" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                    </div>
                     <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">أقصى عرض للصور (بالبكسل)</label>
                        <input type="number" value={maxWidth} onChange={e => setMaxWidth(e.target.value)} placeholder="1280" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                    </div>
                    <button onClick={handleProcess} disabled={isProcessing || images.length === 0} className="w-full h-11 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isProcessing ? 'جاري المعالجة...' : '🚀 ابدأ المعالجة الآن'}
                    </button>
                </div>

                <GuideSection 
                    toolType={ToolType.AdvancedImageEnhancer} 
                />
            </div>
            <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
        </>
    );
};

export default AdvancedImageEnhancer;
