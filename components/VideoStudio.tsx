import React, { useState, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import { fileToImageObject } from '../utils/file';

interface VideoStudioProps {
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    onNavigateHome: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ logStatus, setError, onNavigateHome }) => {
    const [prompt, setPrompt] = useState('');
    const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; dataUrl: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            try {
                // We only need data and mimeType for the API
                const { data, mimeType } = await fileToImageObject(file);
                // We need dataUrl for the preview <img> tag
                const reader = new FileReader();
                reader.onload = () => {
                    setUploadedImage({ data, mimeType, dataUrl: reader.result as string });
                };
                reader.readAsDataURL(file);
            } catch (error) {
                setError("Failed to process uploaded image.");
            }
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("يرجى إدخال وصف (برومبت) للفيديو.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const imageForApi = uploadedImage ? { data: uploadedImage.data, mimeType: uploadedImage.mimeType } : null;
            const resultUrl = await generateVideo(prompt, imageForApi, logStatus);
            setVideoUrl(resultUrl);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const purpleGlassButton = "w-full px-4 py-2 text-sm rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors duration-300";

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors z-20 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-video relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    استوديو الفيديو
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                <div className="lg:col-span-1 flex flex-col gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-fit">
                    <h3 className="text-center font-semibold text-cyan-600 dark:text-cyan-400">لوحة التحكم</h3>
                    
                    <div>
                        <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف الفيديو (Prompt)</label>
                        <textarea id="video-prompt" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="مثال: A neon hologram of a cat driving at top speed..." className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">اكتب وصفًا دقيقًا باللغة الإنجليزية للحصول على أفضل النتائج.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">صورة مرجعية (اختياري)</label>
                        <div className="p-2 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg text-center">
                            {uploadedImage ? <img src={uploadedImage.dataUrl} alt="Uploaded preview" className="max-h-32 mx-auto rounded" /> : <p className="text-gray-500 text-sm py-4">ارفع صورة لتوجيه الفيديو</p>}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => fileInputRef.current?.click()} className={purpleGlassButton}>اختر صورة...</button>
                            {uploadedImage && <button onClick={() => setUploadedImage(null)} className="w-full px-4 py-2 text-sm rounded-md bg-red-600/50 text-white hover:bg-red-600">إزالة الصورة</button>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2 h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? <LoadingIndicator /> : '🚀 إنشاء الفيديو'}
                    </button>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4 items-center justify-center bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]">
                    {isLoading && <LoadingIndicator statusText="🎬 جاري إنشاء الفيديو..." progress={0.5} />}
                    {!isLoading && !videoUrl && <p className="text-gray-500">سيظهر الفيديو الذي تم إنشاؤه هنا</p>}
                    {videoUrl && (
                        <div className="w-full max-w-2xl space-y-4">
                            <video controls autoPlay loop src={videoUrl} className="w-full rounded-lg bg-black border border-gray-600">
                                متصفحك لا يدعم وسم الفيديو.
                            </video>
                            <a href={videoUrl} download={`horus-video-${Date.now()}.mp4`} className="block w-full text-center px-6 py-3 text-base font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg">
                                💾 تحميل الفيديو
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
