import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { apiKeyManager } from '../apiKeyManager';
import LoadingIndicator from './LoadingIndicator';
import { ZODIAC_SIGN_MAP } from '../constants';
import GuideSection from './GuideSection';
import { ContentType, CustomFont } from '../types';


interface HoroscopeVideoStudioProps {
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    onNavigateHome: () => void;
    customFonts: CustomFont[];
}

const TTS_VOICES = [
    { name: 'كوريه (أنثى - هادئ)', value: 'Kore' },
    { name: 'بَك (ذكر - شبابي)', value: 'Puck' },
    { name: 'كارون (ذكر - عميق)', value: 'Charon' },
    { name: 'فنرير (ذكر - قوي)', value: 'Fenrir' },
    { name: 'زفير (أنثى - لطيف)', value: 'Zephyr' },
];

const ASPECT_RATIOS = [
    { label: 'طولي (9:16) - تيك توك/ريلز', value: '9:16' },
    { label: 'مربع (1:1) - انستغرام/فيسبوك', value: '1:1' },
    { label: 'عريض (16:9) - يوتيوب', value: '16:9' },
];

const TEXT_ANIMATIONS = [
    { name: 'ظهور وخفوت', value: 'fadeInOut' },
    { name: 'دخول من اليمين', value: 'slideInRight' },
    { name: 'آلة كاتبة', value: 'typewriter' },
];

const TEXT_POSITIONS = [
    { name: 'أعلى', value: 'top' },
    { name: 'وسط', value: 'middle' },
    { name: 'أسفل', value: 'bottom' },
];

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / 1; // numChannels = 1
  const buffer = ctx.createBuffer(1, frameCount, 24000); // sampleRate = 24000

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


const HoroscopeVideoStudio: React.FC<HoroscopeVideoStudioProps> = ({ logStatus, setError, onNavigateHome, customFonts }) => {
    const [selectedSign, setSelectedSign] = useState<string>('الحمل');
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const ffmpegRef = useRef<any>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [testingVoice, setTestingVoice] = useState<string | null>(null);


    // Inputs state
    const [imageSource, setImageSource] = useState<'ai' | 'upload'>('ai');
    const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; dataUrl: string; } | null>(null);
    const [customText, setCustomText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(TTS_VOICES[0].value);
    const [customImagePrompt, setCustomImagePrompt] = useState('');
    const [customVideoPrompt, setCustomVideoPrompt] = useState('');
    
    // New Video & Text settings state
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontColor, setFontColor] = useState('#FFFFFF');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [shadowColor, setShadowColor] = useState('#000000');
    const [shadowOffset, setShadowOffset] = useState(2);
    const [textAnimation, setTextAnimation] = useState(TEXT_ANIMATIONS[0].value);
    const [textPosition, setTextPosition] = useState(TEXT_POSITIONS[2].value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateProgress = (msg: string) => {
        setProgressMessage(msg);
        logStatus(msg);
    };
    
    const handleFileChange = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            setError('يرجى رفع ملف صورة صالح.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            setUploadedImage({ data: base64Data, mimeType: file.type, dataUrl });
        };
        reader.readAsDataURL(file);
    };

    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileChange(e.dataTransfer.files); },
    };

    const loadFFmpeg = async () => {
        if (ffmpegRef.current) return ffmpegRef.current;
        updateProgress("⏳ تحميل محرك الفيديو (FFmpeg)...");
        const ffmpeg = new (window as any).FFmpeg.FFmpeg();
        ffmpeg.on('log', ({ message }: { message: string }) => { console.log(message); });
        await ffmpeg.load({ coreURL: "./lib/ffmpeg/ffmpeg-core.js" });
        ffmpegRef.current = ffmpeg;
        return ffmpeg;
    };
    
    const fetchFile = async (url: string): Promise<Uint8Array> => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        return new Uint8Array(await response.arrayBuffer());
    };
    
    const handleTestVoice = async () => {
        if (testingVoice || isLoading) return;
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (!apiKey) {
          setError("يرجى إضافة مفتاح Gemini API أولاً.");
          return;
        }
        setTestingVoice(selectedVoice);
        setLocalError(null);
        logStatus(`🔊 جاري اختبار صوت: ${selectedVoice}...`);
        try {
          const ai = new GoogleGenAI({ apiKey });
          const sampleText = "هذا مثال تجريبي للصوت المختار.";
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: sampleText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
              },
            },
          });
          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!base64Audio) {
            throw new Error("لم يتم إرجاع أي بيانات صوتية من النموذج.");
          }
          const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext);
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContext.destination);
          source.start();
          source.onended = () => {
            setTestingVoice(null);
            logStatus(`✅ اكتمل اختبار الصوت.`);
          };
        } catch (e: any) {
          setError(e.message);
          setTestingVoice(null);
        }
    };


    const handleGenerate = async () => {
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (!apiKey) { setError("يرجى إضافة مفتاح Gemini API في الصفحة الرئيسية."); return; }
        if (imageSource === 'upload' && !uploadedImage) { setError("يرجى رفع صورة أولاً أو اختيار الإنشاء بالذكاء الاصطناعي."); return; }
        
        setIsLoading(true);
        setError(null);
        setLocalError(null);
        setFinalVideoUrl(null);
        const ai = new GoogleGenAI({ apiKey });

        try {
            const ffmpeg = await loadFFmpeg();
            let horoscopeText = customText.trim();

            if (!horoscopeText) {
                updateProgress("✍️ إنشاء نص توقعات مخصص...");
                const textResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `اكتب توقعات يومية مختصرة ومناسبة لفيديو تيك توك (حوالي 20-25 كلمة) لبرج ${selectedSign}. يجب أن تكون إيجابية وجذابة.` });
                horoscopeText = textResponse.text.trim();
                if (!horoscopeText) throw new Error("فشل في إنشاء نص التوقعات.");
            } else { updateProgress("✍️ استخدام النص المخصص..."); }

            let imageB64: string;
            if (imageSource === 'upload' && uploadedImage) {
                updateProgress("🖼️ استخدام الصورة المرفوعة...");
                imageB64 = uploadedImage.data;
            } else {
                updateProgress("🎨 إنشاء صورة فنية للبرج...");
                const englishSign = ZODIAC_SIGN_MAP[selectedSign];
                const imagePrompt = customImagePrompt.trim() || `Epic, mythical, cinematic digital art of the ${englishSign} zodiac sign symbol. Glowing golden lines, cosmic background, nebula, stars. Masterpiece, 8k.`;
                const imageResponse = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: imagePrompt, config: { numberOfImages: 1, aspectRatio: aspectRatio as any } });
                imageB64 = imageResponse.generatedImages?.[0]?.image.imageBytes;
                if (!imageB64) throw new Error("فشل في إنشاء الصورة.");
            }

            updateProgress("🎬 إنشاء مقطع فيديو صامت...");
            const videoPrompt = customVideoPrompt.trim() || 'Animate this image with slowly moving stars and subtle glowing particles. 7 seconds long.';
            let videoOperation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt: videoPrompt, image: { imageBytes: imageB64, mimeType: 'image/png' }, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any } });
            while (!videoOperation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                updateProgress("⏳ الفيديو قيد المعالجة...");
                videoOperation = await ai.operations.getVideosOperation({ operation: videoOperation });
            }
            const videoUri = videoOperation.response?.generatedVideos?.[0]?.video?.uri;
            if (!videoUri) throw new Error("فشل في إنشاء الفيديو الصامت.");

            updateProgress("🔊 إنشاء التعليق الصوتي...");
            const audioResponse = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text: horoscopeText }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } } } });
            const audioB64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioB64) throw new Error("فشل في إنشاء الصوت.");
            
            updateProgress("🔄 دمج الفيديو، الصوت، والنص المتحرك...");
            const videoData = await fetchFile(`${videoUri}&key=${apiKey}`);
            const audioData = Uint8Array.from(atob(audioB64), c => c.charCodeAt(0));
            await ffmpeg.writeFile('input.mp4', videoData);
            await ffmpeg.writeFile('input_audio.raw', audioData);
            await ffmpeg.exec(['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', 'input_audio.raw', 'audio.aac']);

            // Font handling
            let fontPath = '';
            const selectedFont = customFonts.find(f => f.name === fontFamily);
            if(selectedFont) {
                const fontData = await fetchFile(selectedFont.data);
                fontPath = 'customfont.ttf';
                await ffmpeg.writeFile(fontPath, fontData);
            }

            // FFmpeg filter generation
            const positionMap: { [key: string]: string } = { top: 'h*0.1', middle: '(h-text_h)/2', bottom: 'h*0.8' };
            const animationMap: { [key: string]: string } = {
                fadeInOut: `:alpha='if(lt(t,1.5),0,if(lt(t,2.5),(t-1.5),if(lt(t,5.5),1,if(lt(t,6.5),1-(t-5.5),0))))'`,
                slideInRight: `:x='if(lt(t,1),w+100,if(lt(t,2),w-(w/2+text_w/2)*(t-1), (w-text_w)/2))':y=${positionMap[textPosition]}`,
                typewriter: `:text='${horoscopeText.replace(/'/g, "'\\''").replace(/:/g, '\\:')}':x=(w-text_w)/2:y=${positionMap[textPosition]}` // Simplified for example
            };

            const drawtextFilter = [
                `drawtext=fontfile=${fontPath}`,
                `fontcolor=${fontColor}`,
                `fontsize=48`,
                `borderw=${strokeWidth}`,
                `bordercolor=${strokeColor}`,
                `shadowcolor=${shadowColor}`,
                `shadowx=${shadowOffset}`,
                `shadowy=${shadowOffset}`,
                `box=1:boxcolor=black@0.5:boxborderw=10`,
                `enable='between(t,1,6)'`,
                animationMap[textAnimation] || animationMap['fadeInOut'] 
            ].join(':');

            await ffmpeg.exec(['-i', 'input.mp4', '-i', 'audio.aac', '-filter_complex', `[0:v]${drawtextFilter}[v]`, '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-c:a', 'aac', '-shortest', 'output.mp4']);

            const outputData = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([outputData], { type: 'video/mp4' });
            setFinalVideoUrl(URL.createObjectURL(blob));
            updateProgress("✅ اكتمل إنشاء الفيديو النهائي!");

        } catch (e: any) {
            const errorMessage = `حدث خطأ فادح: ${e.message}`;
            setError(errorMessage); setLocalError(errorMessage);
            updateProgress(`❌ فشل: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>

            <div className="mt-40">
              <div className="horoscope-banner my-6 flex flex-col items-center gap-3">
                  <div className="horoscope-title tracking-wider flex items-center justify-center gap-6 font-extrabold">
                      <i className="fas fa-hat-wizard text-4xl text-purple-400"></i>
                      <span className="text-4xl">بلورة حظك اليوم وتوقعات الأبراج</span>
                      <i className="fas fa-hat-wizard text-4xl text-purple-400"></i>
                  </div>
              </div>
            </div>
            
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Controls Panel */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/30 space-y-4">
                         {/* Image Source */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-center text-yellow-300">1. مصدر الصورة</h3>
                            <div className="flex w-full bg-gray-900 rounded-lg p-1 border border-gray-600">
                                <button onClick={() => setImageSource('ai')} className={`flex-1 text-sm p-1 rounded-md ${imageSource === 'ai' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>إنشاء بالذكاء الاصطناعي</button>
                                <button onClick={() => setImageSource('upload')} className={`flex-1 text-sm p-1 rounded-md ${imageSource === 'upload' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>رفع من الجهاز</button>
                            </div>
                            {imageSource === 'ai' ? (
                                 <textarea value={customImagePrompt} onChange={e => setCustomImagePrompt(e.target.value)} placeholder="وصف الصورة (مثال: A golden Aries ram...)" rows={3} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                            ) : (
                                <div {...dragEvents} onClick={() => fileInputRef.current?.click()} className={`horoscope-drop-zone ${isDragging ? 'dragging' : ''}`}>
                                    {uploadedImage ? <img src={uploadedImage.dataUrl} alt="preview" className="max-h-24 mx-auto rounded"/> : <p className="text-gray-400 text-sm">اسحب وأفلت أو انقر للاختيار</p>}
                                    <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e.target.files)} className="hidden" accept="image/*" />
                                </div>
                            )}
                        </div>
                        {/* Video & Text Settings */}
                         <div className="space-y-3 pt-3 border-t border-gray-700">
                            <h3 className="text-sm font-bold text-center text-yellow-300">2. إعدادات الفيديو والنص</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400">أبعاد الفيديو</label>
                                    <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full purple-select mt-1">
                                        {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="text-xs text-gray-400">حركة النص</label>
                                    <select value={textAnimation} onChange={e => setTextAnimation(e.target.value)} className="w-full purple-select mt-1">
                                        {TEXT_ANIMATIONS.map(a => <option key={a.value} value={a.value}>{a.name}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="text-xs text-gray-400">موضع النص</label>
                                    <select value={textPosition} onChange={e => setTextPosition(e.target.value)} className="w-full purple-select mt-1">
                                        {TEXT_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">الخط</label>
                                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full purple-select mt-1">
                                        <option>Arial</option>
                                        {customFonts.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2"><label className="text-xs text-gray-400">لون الخط</label><input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-full h-8 p-0 border-0 rounded bg-transparent"/></div>
                                <div className="flex items-center gap-2"><label className="text-xs text-gray-400">لون الحد</label><input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-full h-8 p-0 border-0 rounded bg-transparent"/></div>
                                <div><label className="text-xs text-gray-400">سمك الحد: {strokeWidth}</label><input type="range" min="0" max="10" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-full"/></div>
                                <div><label className="text-xs text-gray-400">إزاحة الظل: {shadowOffset}</label><input type="range" min="0" max="10" value={shadowOffset} onChange={e => setShadowOffset(Number(e.target.value))} className="w-full"/></div>
                            </div>
                        </div>

                        {/* Final Generation */}
                        <div className="space-y-3 pt-3 border-t border-gray-700">
                             <h3 className="text-sm font-bold text-center text-yellow-300">3. المحتوى والإنشاء</h3>
                             <textarea value={customText} onChange={e => setCustomText(e.target.value)} placeholder="النص (اتركه فارغًا ليتم إنشاؤه تلقائيًا)..." rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                             <div className="flex items-center gap-2">
                                <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="w-full purple-select">
                                    {TTS_VOICES.map(voice => <option key={voice.value} value={voice.value}>{voice.name}</option>)}
                                </select>
                                <button onClick={handleTestVoice} disabled={isLoading || !!testingVoice} className="voice-test-btn glassy-purple-btn flex-shrink-0">
                                    {testingVoice ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div> : <i className="fas fa-play"></i>}
                                    <span>{testingVoice ? 'تشغيل...' : 'اختبار'}</span>
                                </button>
                             </div>
                             <select value={selectedSign} onChange={e => setSelectedSign(e.target.value)} className="w-full purple-select">
                                {Object.keys(ZODIAC_SIGN_MAP).map(sign => <option key={sign} value={sign}>{sign}</option>)}
                            </select>
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full h-12 text-lg font-bold glassy-purple-btn flex items-center justify-center">
                                {isLoading ? <LoadingIndicator /> : "✨ إنشاء الفيديو"}
                            </button>
                        </div>

                    </div>
                    {/* Preview Panel */}
                     <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-500/30 min-h-[60vh] flex items-center justify-center">
                        {isLoading && <div className="flex flex-col items-center gap-4"><LoadingIndicator /><p className="text-purple-300 font-semibold">{progressMessage}</p></div>}
                        {localError && !isLoading && <div className="text-center text-red-400"><i className="fas fa-exclamation-triangle text-4xl mb-4"></i><p className="font-bold">حدث خطأ</p><p className="text-sm max-w-md">{localError}</p></div>}
                        {finalVideoUrl && !isLoading && (
                            <div className="w-full max-w-sm flex flex-col items-center gap-4">
                                <video src={finalVideoUrl} controls autoPlay loop className="w-full rounded-lg border-2 border-purple-500"></video>
                                <a href={finalVideoUrl} download={`${selectedSign}-horoscope.mp4`} className="w-full text-center px-6 py-3 text-lg font-bold glassy-purple-btn">
                                    📥 تحميل الفيديو
                                </a>
                            </div>
                        )}
                        {!isLoading && !finalVideoUrl && !localError && <div className="text-center text-gray-500"><i className="fas fa-magic text-5xl mb-4"></i><p>املأ الإعدادات وابدأ في إنشاء الفيديو السحري!</p></div>}
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="mb-2 p-3 bg-gray-900/50 rounded-lg border border-cyan-500/30 text-center">
                        <h4 className="font-semibold text-cyan-400 flex items-center justify-center gap-2">
                            <i className="fas fa-book-open"></i>
                            دليل الاستخدام والنصائح الاحترافية
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                            انقر على الزر أدناه لعرض أو إخفاء دليل شامل ونصائح SEO متقدمة خاصة بهذا الاستوديو.
                        </p>
                    </div>
                     <GuideSection contentType={ContentType.HoroscopeVideoStudio} />
                </div>
            </div>
        </>
    );
};

export default HoroscopeVideoStudio;