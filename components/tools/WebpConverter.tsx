import React, { useState, useCallback, useRef } from 'react';

declare const JSZip: any;

interface WebpConverterProps {
    onNavigateHome: () => void;
}

interface ImageFile {
  id: string;
  originalFile: File;
  originalSize: number;
  originalDataUrl: string;
  convertedDataUrl: string | null;
  convertedSize: number | null;
  status: 'pending' | 'converting' | 'done' | 'error';
  slug: string;
  error?: string;
}

const WebpConverter: React.FC<WebpConverterProps> = ({ onNavigateHome }) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [quality, setQuality] = useState(0.8);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isZipping, setIsZipping] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newImages: ImageFile[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            const dataUrl = await new Promise<string>(resolve => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            
            const initialSlug = file.name
                .split('.').slice(0, -1).join('.') // remove extension
                .toLowerCase()
                .replace(/\s+/g, '-') // replace spaces with hyphens
                .replace(/[^a-z0-9-]/g, '') // remove special characters
                .replace(/-+/g, '-'); // remove multiple hyphens


            newImages.push({
                id: `${file.name}-${Date.now()}`,
                originalFile: file,
                originalSize: file.size,
                originalDataUrl: dataUrl,
                convertedDataUrl: null,
                convertedSize: null,
                status: 'pending',
                slug: initialSlug
            });
        }
        setImages(prev => [...prev, ...newImages]);
    }, []);

    const convertImageToWebp = (imageFile: ImageFile, quality: number): Promise<Partial<ImageFile>> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve({ status: 'error', error: 'Failed to get canvas context.' });
                    return;
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    if (!blob) {
                         resolve({ status: 'error', error: 'Failed to create blob.' });
                        return;
                    }
                    const dataUrl = URL.createObjectURL(blob);
                    resolve({
                        convertedDataUrl: dataUrl,
                        convertedSize: blob.size,
                        status: 'done'
                    });
                }, 'image/webp', quality);
            };
            img.onerror = () => {
                resolve({ status: 'error', error: 'Failed to load image.' });
            };
            img.src = imageFile.originalDataUrl;
        });
    };

    const handleConvertAll = async () => {
        setImages(prev => prev.map(img => ({ ...img, status: img.status === 'pending' ? 'converting' : img.status })));
        
        const conversionPromises = images.filter(img => img.status !== 'done').map(async (img) => {
            const result = await convertImageToWebp(img, quality);
            setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...result } : i));
        });

        await Promise.all(conversionPromises);
    };
    
    const handleSlugChange = (id: string, newSlug: string) => {
        const sanitizedSlug = newSlug
            .toLowerCase()
            .replace(/\s+/g, '-') // replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, '') // remove special characters
            .replace(/-+/g, '-'); // remove multiple hyphens
            
        setImages(prev => prev.map(img => 
            img.id === id ? { ...img, slug: sanitizedSlug } : img
        ));
    };


    const handleDownloadAll = async () => {
        const convertedImages = images.filter(img => img.status === 'done' && img.convertedDataUrl);
        if (convertedImages.length === 0) return;

        setIsZipping(true);
        const zip = new JSZip();
        
        for (const image of convertedImages) {
            const response = await fetch(image.convertedDataUrl!);
            const blob = await response.blob();
            zip.file(`${image.slug || `image-${image.id}`}.webp`, blob);
        }

        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `horus-webp-images-${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setIsZipping(false);
        });
    };
    
    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); },
    };

    const GuideSection = () => (
         <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-6">
            <h3 className="text-xl font-bold text-center text-cyan-400">الدليل الشامل لمحول الصور إلى WebP</h3>
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400">ما هو WebP ولماذا هو مهم؟</h4>
                <p className="text-sm text-gray-400">
                    WebP هو تنسيق صور حديث تم تطويره بواسطة Google. يوفر ضغطًا فائقًا للصور مع الحفاظ على جودة عالية، مما ينتج عنه ملفات أصغر بكثير مقارنة بـ JPEG و PNG. استخدام صور WebP هو أحد أهم العوامل لتسريع تحميل صفحات الويب، وهو ما يؤثر بشكل مباشر وإيجابي على تجربة المستخدم وترتيب موقعك في محركات البحث (SEO).
                </p>
            </div>
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400">كيفية استخدام الأداة بفعالية</h4>
                <ol className="list-decimal list-inside space-y-2 pr-4 text-gray-300">
                    <li><strong className="text-cyan-300">رفع الصور:</strong> يمكنك سحب وإفلات الصور مباشرة في المنطقة المخصصة، أو النقر عليها لاختيار ملف أو أكثر من جهازك.</li>
                    <li><strong className="text-cyan-300">ضبط الجودة:</strong> استخدم شريط التمرير لتحديد مستوى الجودة. جودة أعلى تعني حجم ملف أكبر، والعكس صحيح. (الجودة الموصى بها هي 75-85%).</li>
                    <li><strong className="text-cyan-300">بدء التحويل:</strong> اضغط على زر "تحويل الكل إلى WebP" لبدء العملية.</li>
                    <li><strong className="text-cyan-300">تخصيص الاسم (Slug):</strong> بعد التحويل، سيظهر حقل اسم لكل صورة. يمكنك تعديله ليكون صديقًا لمحركات البحث.</li>
                    <li><strong className="text-cyan-300">المعاينة والتحميل:</strong> بعد التحويل، ستظهر كل صورة مع مقارنة "قبل وبعد"، وستتمكن من رؤية نسبة التوفير في الحجم. يمكنك تحميل كل صورة على حدة باسمها المخصص، أو تحميل جميع الصور المحولة دفعة واحدة في ملف ZIP.</li>
                </ol>
            </div>
        </div>
    );

    return (
        <>
             <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                 <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-file-image relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    محول الصور إلى WebP
                </h2>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                     <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
                    <div 
                        {...dragEvents}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full p-10 border-4 border-dashed rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center ${isDragging ? 'border-cyan-400 bg-cyan-900/40' : 'border-gray-400 dark:border-gray-600 hover:border-cyan-500 hover:bg-cyan-900/20'}`}
                    >
                        <i className={`fas fa-cloud-upload-alt text-6xl mb-4 transition-colors ${isDragging ? 'text-cyan-300' : 'text-gray-500'}`}></i>
                        <p className={`font-semibold transition-colors ${isDragging ? 'text-cyan-200' : 'text-gray-700 dark:text-gray-300'}`}>اسحب وأفلت الصور هنا، أو انقر للاختيار</p>
                        <p className={`text-sm transition-colors ${isDragging ? 'text-cyan-300' : 'text-gray-500'}`}>يمكنك رفع ملفات متعددة (JPG, PNG)</p>
                        <input type="file" ref={fileInputRef} onChange={e => handleFiles(e.target.files)} multiple accept="image/jpeg,image/png" className="hidden" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full md:w-1/2">
                            <label htmlFor="quality-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">جودة الصورة: <span className="font-bold text-cyan-400">{Math.round(quality * 100)}%</span></label>
                            <input id="quality-slider" type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full mt-1" />
                        </div>
                        <button onClick={handleConvertAll} disabled={images.length === 0} className="w-full md:w-auto h-12 px-8 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
                            تحويل الكل إلى WebP
                        </button>
                        <button onClick={handleDownloadAll} disabled={images.filter(i => i.status === 'done').length === 0 || isZipping} className="w-full md:w-auto h-12 px-8 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
                            {isZipping ? 'جاري الضغط...' : 'تحميل الكل (ZIP)'}
                        </button>
                         <button onClick={() => setImages([])} disabled={images.length === 0} className="w-full md:w-auto h-12 px-8 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-lg disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed">
                            مسح الكل
                        </button>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="space-y-4">
                        {images.map(img => (
                             <div key={img.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 items-center">
                                {/* Before */}
                                <div className="text-center">
                                    <h4 className="font-semibold mb-2 text-gray-300">قبل ({(img.originalSize / 1024).toFixed(1)} KB)</h4>
                                    <img src={img.originalDataUrl} alt="Original" className="max-h-48 mx-auto rounded-md" />
                                </div>
                                {/* After */}
                                <div className="text-center">
                                    {img.status === 'converting' && <p className="text-cyan-400">جاري التحويل...</p>}
                                    {img.status === 'error' && <p className="text-red-400">خطأ: {img.error}</p>}
                                    {img.status === 'done' && img.convertedDataUrl && (
                                        <>
                                            <h4 className="font-semibold mb-2 text-green-400">
                                                بعد ({(img.convertedSize! / 1024).toFixed(1)} KB) - 
                                                <span className="text-yellow-400"> توفير {((1 - img.convertedSize! / img.originalSize) * 100).toFixed(0)}%</span>
                                            </h4>
                                            <img src={img.convertedDataUrl} alt="Converted" className="max-h-48 mx-auto rounded-md" />
                                            
                                            <div className="mt-4 w-full max-w-sm mx-auto">
                                                <label htmlFor={`slug-${img.id}`} className="block text-xs font-medium text-gray-400 mb-1 text-right">
                                                    اسم الصورة (Slug)
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`slug-${img.id}`}
                                                    value={img.slug}
                                                    onChange={(e) => handleSlugChange(img.id, e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 font-mono text-sm text-gray-200 text-left"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <a href={img.convertedDataUrl} download={`${img.slug || 'converted-image'}.webp`} className="inline-block mt-2 px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700">
                                                تحميل
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default WebpConverter;