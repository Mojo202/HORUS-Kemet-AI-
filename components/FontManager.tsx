import React, { useState } from 'react';
import { CustomFont } from '../types';
import { addFont, deleteFont } from '../utils/fontDb';
import LoadingIndicator from './LoadingIndicator';


interface FontManagerProps {
    isOpen: boolean;
    onClose: () => void;
    customFonts: CustomFont[];
    onFontChange: () => void; // Callback to trigger re-fetch in App.tsx
}

const FontManager: React.FC<FontManagerProps> = ({ isOpen, onClose, customFonts, onFontChange }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const files = Array.from(event.target.files);
        setIsUploading(true);
        setError(null);

        for (const file of files) {
            // FIX: Add type guard to ensure `file` is treated as a File object.
            if (file instanceof File) {
                try {
                    const fontName = file.name.split('.').slice(0, -1).join('.') || file.name;
                    if (customFonts.some(f => f.name === fontName)) {
                        throw new Error(`الخط "${fontName}" موجود بالفعل.`);
                    }
                    const reader = new FileReader();
                    const data = await new Promise<string>((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        // FIX: Reject with a proper Error object for consistent error handling and to avoid issues with unknown types in the catch block.
                        reader.onerror = () => reject(new Error(reader.error?.message || 'An unknown error occurred while reading the file.'));
                        reader.readAsDataURL(file);
                    });
                    await addFont({ name: fontName, data });
                } catch (err: unknown) {
                    // FIX: The caught error `err` is of type `unknown`. Added a type guard to safely access error properties and prevent runtime errors.
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError(`فشل في رفع الخط: ${String(err)}`);
                    }
                }
            }
        }
        setIsUploading(false);
        onFontChange(); // Notify parent to update fonts
    };
    
    const handleDeleteFont = async (fontName: string) => {
        if (window.confirm(`هل أنت متأكد من حذف الخط "${fontName}"؟`)) {
            await deleteFont(fontName);
            onFontChange();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">🖌️ مدير الخطوط المخصص</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                        <label htmlFor="font-upload" className="cursor-pointer text-cyan-500 hover:text-cyan-600 font-medium">
                            {isUploading ? "جاري الرفع..." : "انقر هنا لرفع ملفات الخطوط (.ttf, .otf, .woff)"}
                        </label>
                        <input id="font-upload" type="file" multiple accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">سيتم حفظ الخطوط في متصفحك لاستخدامها في محرر الصور.</p>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <h4 className="font-semibold mb-2">الخطوط المثبتة:</h4>
                        {customFonts.length > 0 ? (
                            <ul className="space-y-2">
                                {customFonts.map(font => (
                                    <li key={font.name} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                                        <div className="flex-grow">
                                            {/* FIX: Preview text now includes both Arabic and English to showcase font support for both scripts. Font size is increased for better visibility. */}
                                            <p style={{ fontFamily: `"${font.name}"`, fontSize: '1.5rem', lineHeight: '1.5' }}>
                                                <span lang="ar" dir="rtl">أبجد هوز</span>
                                                <span lang="en" dir="ltr" className="ml-4">Aa Bb Cc</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{font.name}</p>
                                        </div>
                                        <button onClick={() => handleDeleteFont(font.name)} className="p-1 rounded-full text-red-500 hover:bg-red-500/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500">لم يتم تثبيت أي خطوط مخصصة.</p>
                        )}
                    </div>
                </div>
                 <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 text-sm rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FontManager;