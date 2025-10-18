import React, { useState, useRef, useCallback } from 'react';
import { GeneratedArticle, CustomFont } from '../types';
import { OutputSection } from './OutputSection';
import { exportToBloggerXml } from '../utils/bloggerExport';
import { parseBloggerXml, parseHtmlForEditor, parseTxtForEditor } from '../utils/xmlParser';
import { generateImageAndUrl } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import { fileToText } from '../utils/file';
import { apiKeyManager } from '../apiKeyManager';

// New Component for the standalone image generator
const StandaloneImageGenerator: React.FC<{
    imgbbApiKey: string;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}> = ({ imgbbApiKey, logStatus, setError }) => {
    const [prompt, setPrompt] = useState('');
    const [slug, setSlug] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ imageUrl: string; } | null>(null);

    const handleGenerate = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        if (!prompt.trim() || !slug.trim()) {
            setError("يرجى إدخال برومبت الصورة والاسم المخصص (Slug).");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        logStatus(`--- بدء إنشاء صورة مستقلة: "${prompt.substring(0, 40)}..." ---`);
        try {
            // FIX: The function call was missing the imageModel argument, and the log function was in the wrong position. The default model is provided here.
            const { imageUrl, warning } = await generateImageAndUrl(prompt, slug, imgbbApiKey, 'imagen-4.0-generate-001', logStatus);
            if (warning) {
                // Using setError for warnings in this context for higher visibility
                setError(`تنبيه بخصوص الرفع: ${warning}`);
            }
            setResult({ imageUrl });
            logStatus(`✅ تم إنشاء الصورة بنجاح: ${imageUrl}`);
        } catch (e: any) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            setError(`فشل إنشاء الصورة: ${friendlyMessage}`);
            logStatus(`❌ فشل إنشاء الصورة: ${friendlyMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (result?.imageUrl) {
            navigator.clipboard.writeText(result.imageUrl);
            logStatus("تم نسخ رابط الصورة إلى الحافظة.");
        }
    };

    return (
        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-center font-semibold text-cyan-600 dark:text-cyan-400">🖼️ مولّد الصور المستقل</h3>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                أنشئ صورة من وصف نصي، ارفعها تلقائيًا، واحصل على رابط WebP مباشر.
            </p>
            <div>
                <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    1. برومبت الصورة (الوصف)
                </label>
                <textarea
                    id="image-prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="مثال: قطة ترتدي نظارة شمسية وتقود دراجة نارية..."
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">اكتب وصفًا دقيقًا باللغة الإنجليزية للحصول على أفضل النتائج.</p>
            </div>
             <div>
                <label htmlFor="image-slug" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    2. الاسم المخصص (Slug)
                </label>
                <input
                    id="image-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="مثال: cool-cat-biker"
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">اسم إنجليزي فريد لحفظ الصورة به (بدون مسافات أو رموز).</p>
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full h-10 px-6 py-2 text-base font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400"
            >
                {isLoading ? <LoadingIndicator /> : '✨ إنشاء الصورة الآن'}
            </button>
            {result && (
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 space-y-3">
                    <h4 className="text-sm font-semibold text-center">النتائج:</h4>
                    <img src={result.imageUrl} alt="Generated" className="rounded-lg max-w-full h-auto mx-auto border-2 border-cyan-500" />
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                        <input
                            type="text"
                            readOnly
                            value={result.imageUrl}
                            className="flex-grow bg-transparent text-xs font-mono text-cyan-700 dark:text-cyan-300 p-1"
                        />
                        <button onClick={handleCopy} className="px-3 py-1 text-xs rounded-md bg-gray-500 text-white hover:bg-gray-600">
                            نسخ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


interface XmlEditorProps {
  articles: GeneratedArticle[];
  setArticles: (articles: GeneratedArticle[]) => void;
  logStatus: (message: string) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  imgbbApiKey: string;
  onPublish: (article: GeneratedArticle) => void;
  publishingStatus: { [key: number]: 'idle' | 'publishing' | 'published' | 'error' };
  isPublishDisabled: boolean;
  onArticleUpdate: (articleId: number, field: keyof GeneratedArticle, value: any) => void;
  onImageUpdate: (articleId: number, newImageUrl: string) => void;
  onNavigateHome: () => void;
  customFonts: CustomFont[];
}

export const XmlEditor: React.FC<XmlEditorProps> = (props) => {
    const { articles, setArticles, onNavigateHome } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pastedHtmlFileInputRef = useRef<HTMLInputElement>(null);
    const [pastedHtml, setPastedHtml] = useState('');


    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        props.logStatus(`--- بدء استيراد ملف: ${file.name} ---`);
        props.setError(null);
        props.setWarning(null);

        try {
            const fileText = await file.text();
            let importedArticles: GeneratedArticle[] = [];

            if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
                importedArticles = parseBloggerXml(fileText);
            } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
                importedArticles = [parseHtmlForEditor(fileText)];
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                importedArticles = [parseTxtForEditor(fileText)];
            } else {
                throw new Error(`نوع الملف غير مدعوم: ${file.type}. يرجى رفع ملف نصي (.txt), HTML (.html), أو XML (.xml).`);
            }

            if (importedArticles.length === 0) {
                throw new Error("لم يتم العثور على محتوى قابل للتحليل في الملف.");
            }
            
            setArticles(importedArticles);
            props.logStatus(`✅ تم استيراد وتحليل ${importedArticles.length} مقال بنجاح.`);

        } catch (e: any) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            props.setError(`فشل في استيراد الملف: ${friendlyMessage}`);
            props.logStatus(`❌ فشل استيراد الملف: ${friendlyMessage}`);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Allow re-uploading the same file
            }
        }
    }, [props.logStatus, props.setError, props.setWarning, setArticles]);

    const handleAnalyzePastedHtml = () => {
        if (!pastedHtml.trim()) {
            props.setError("صندوق لصق HTML فارغ. يرجى لصق محتوى لتحليله.");
            return;
        }
        props.logStatus("--- بدء تحليل محتوى HTML الملصق ---");
        props.setError(null);
        try {
            const parsedArticle = parseHtmlForEditor(pastedHtml);
            setArticles([parsedArticle]);
            props.logStatus("✅ تم تحليل محتوى HTML الملصق بنجاح.");
        } catch(e: any) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            props.setError(`فشل تحليل HTML: ${friendlyMessage}`);
            props.logStatus(`❌ فشل تحليل HTML: ${friendlyMessage}`);
        }
    };
    
    const handlePastedHtmlFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            try {
                const text = await fileToText(event.target.files[0]);
                setPastedHtml(text);
            } catch (error) {
                props.setError("فشل في قراءة الملف.");
            }
        }
        if (event.target) event.target.value = "";
    };


  return (
    <>
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex items-center justify-center">
                  <svg
                      className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle"
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                  >
                      <path d="M50 5 L95 85 L5 85 Z" />
                  </svg>
                  <i className="fas fa-magic relative text-4xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
              </div>
              <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 5px rgba(34, 211, 238, 0.6)' }}>
                  وضع الإنشاء المتقدم
              </h2>
          </div>
          <button onClick={onNavigateHome} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              العودة للرئيسية
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
          {/* Left Column: Editor Output */}
          <div className="flex flex-col gap-6">
              <OutputSection
                  articles={articles}
                  isLoading={false}
                  onImageUpdate={props.onImageUpdate}
                  onArticleUpdate={props.onArticleUpdate}
                  setError={props.setError}
                  setWarning={props.setWarning}
                  imgbbApiKey={props.imgbbApiKey}
                  generationLog={[]}
                  logStatus={props.logStatus}
                  totalGenerationTime={0}
                  onPublish={props.onPublish}
                  publishingStatus={props.publishingStatus}
                  isPublishDisabled={props.isPublishDisabled}
                  isEditorMode={true}
                  selectedTextModel={"gemini-2.5-flash"}
                  onFinalizeArticle={() => {}}
                  onCorrectSchema={() => {}}
                  onSaveLog={() => {}}
                  onLoadLog={() => {}}
                  onClearLog={() => {}}
                  customFonts={props.customFonts}
              />
          </div>

          {/* Right Column: Controls */}
          <div className="flex flex-col gap-6">
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                   <h3 className="text-center font-semibold text-cyan-600 dark:text-cyan-400">1. استورد مقالك</h3>
                   <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      استورد مقالاتك من مصادر مختلفة لتحريرها وتحسينها.
                  </p>

                  <div className="flex items-center gap-2">
                      <hr className="flex-grow border-t border-gray-300 dark:border-gray-600"/>
                      <span className="text-xs text-gray-400">الخيار الأول</span>
                      <hr className="flex-grow border-t border-gray-300 dark:border-gray-600"/>
                  </div>

                  <button
                      onClick={() => fileInputRef.current?.click()}
                      title="استورد مقالات من ملف Blogger Export (XML) أو ملف HTML واحد أو ملف نصي (TXT)."
                      className="w-full px-6 py-3 text-base font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      رفع ملف (XML, HTML, TXT)
                  </button>
                   <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".txt,.html,.xml"
                  />

                  <div className="flex items-center gap-2">
                      <hr className="flex-grow border-t border-gray-300 dark:border-gray-600"/>
                      <span className="text-xs text-gray-400">الخيار الثاني</span>
                      <hr className="flex-grow border-t border-gray-300 dark:border-gray-600"/>
                  </div>
                   <div>
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor="pasted-html" className="text-sm">...أو الصق كود HTML الكامل هنا</label>
                          <button onClick={() => pastedHtmlFileInputRef.current?.click()} className="px-3 py-1 text-xs font-semibold rounded-md bg-purple-600/50 text-white hover:bg-purple-600/70">
                            رفع ملف
                          </button>
                          <input type="file" ref={pastedHtmlFileInputRef} onChange={handlePastedHtmlFileChange} className="hidden" accept=".txt,.html" />
                        </div>
                      <textarea
                          id="pasted-html"
                          rows={8}
                          value={pastedHtml}
                          onChange={(e) => setPastedHtml(e.target.value)}
                          placeholder="...الصق كود HTML الكامل هنا"
                          className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                      <button onClick={handleAnalyzePastedHtml} className="w-full mt-2 px-4 py-2 text-sm rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">
                          تحليل HTML الملصق
                      </button>
                   </div>
              </div>

              <StandaloneImageGenerator
                  imgbbApiKey={props.imgbbApiKey}
                  logStatus={props.logStatus}
                  setError={props.setError}
              />

              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-center font-semibold text-cyan-600 dark:text-cyan-400">2. تصدير النتائج</h3>
                   <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      بعد إجراء التعديلات، قم بتصدير جميع المقالات كملف XML واحد متوافق مع Blogger.
                  </p>
                  <button
                      onClick={() => exportToBloggerXml(articles)}
                      disabled={articles.length === 0}
                      className="w-full px-6 py-3 text-base font-semibold rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      تصدير كل التعديلات كـ XML
                  </button>
              </div>
          </div>
      </div>
    </>
  );
};