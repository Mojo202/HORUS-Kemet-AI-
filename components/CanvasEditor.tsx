import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CustomFont } from '../types';
import { editImage, uploadImageToHost } from '../services/geminiService';
import { convertToWebp } from '../utils/image';
import LoadingIndicator from './LoadingIndicator';

declare const fabric: any;

const BackgroundImageUploader: React.FC<{
    onImageSelect: (file: File) => void;
    onApply: () => void;
    selectedFile: File | null;
}> = ({ onImageSelect, onApply, selectedFile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };
    
    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            setIsDragging(false); 
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onImageSelect(e.dataTransfer.files[0]);
            }
        },
    };
    
    return (
        <div className="space-y-2">
            <h4 className="font-bold text-sm">استبدال الخلفية</h4>
            <div 
                {...dragEvents}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-600 hover:border-cyan-500'}`}
            >
                {selectedFile ? (
                    <p className="text-sm text-green-400 truncate">{selectedFile.name}</p>
                ) : (
                    <p className="text-xs text-gray-400">اسحب وأفلت صورة جديدة أو انقر للاختيار</p>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {selectedFile && (
                <button onClick={onApply} className="w-full p-2 text-sm bg-green-600 text-white rounded">
                    تطبيق الصورة الجديدة
                </button>
            )}
        </div>
    );
};


// A new self-contained canvas editor component
export const CanvasEditorImpl: React.FC<{
    initialImageUrl: string;
    customFonts: CustomFont[];
    onSave: (hostedUrl: string) => void;
    onCancel: () => void;
    logStatus: (msg: string) => void;
    setError: (err: string | null) => void;
    imgbbApiKey?: string;
    slug: string;
}> = ({ initialImageUrl, customFonts, onSave, onCancel, logStatus, setError, imgbbApiKey, slug }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<any>(null);
    const [activeObject, setActiveObject] = useState<any>(null);
    const [textValue, setTextValue] = useState('New Text');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiEditing, setIsAiEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [replacementImage, setReplacementImage] = useState<File | null>(null);
    const [useCreativeBypass, setUseCreativeBypass] = useState(true);


    const zoomIn = useCallback(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        const newZoom = canvas.getZoom() * 1.1;
        if (newZoom > 20) return;
        canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoom);
    }, []);

    const zoomOut = useCallback(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        const newZoom = canvas.getZoom() / 1.1;
        if (newZoom < 0.1) return;
        canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoom);
    }, []);

    // Properties for selected object
    const [fillColor, setFillColor] = useState('#000000');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(0);
    const [opacity, setOpacity] = useState(1);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [shadow, setShadow] = useState({ color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });

    const applyReplacementImage = useCallback(() => {
        if (!replacementImage) return;
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        
        const reader = new FileReader();
        reader.onload = (f) => {
            const dataUrl = f.target?.result as string;
            fabric.Image.fromURL(dataUrl, (img: any) => {
                const originalBg = canvas.getBackgroundImage();
                if (originalBg) {
                     img.scaleToWidth(originalBg.getScaledWidth());
                     img.scaleToHeight(originalBg.getScaledHeight());
                }
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {});
            }, { crossOrigin: 'anonymous' });
        };
        reader.readAsDataURL(replacementImage);
        setReplacementImage(null); // Clear after applying
    }, [replacementImage]);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: '#f0f0f0',
            selection: true,
        });
        fabricCanvasRef.current = canvas;

        // --- Panning and Zooming ---
        canvas.on('mouse:wheel', function(opt: any) {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.99 ** delta; // Zoom speed
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        canvas.on('mouse:down', function(opt: any) {
            const evt = opt.e;
            if (evt.altKey === true || this.isTwoFingerPan) {
                this.isDragging = true;
                this.selection = false;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
                this.setCursor('grabbing');
            }
        });

        canvas.on('mouse:move', function(opt: any) {
            if (this.isDragging) {
                const e = opt.e;
                const vpt = this.viewportTransform;
                if (vpt) {
                    vpt[4] += e.clientX - this.lastPosX;
                    vpt[5] += e.clientY - this.lastPosY;
                    this.requestRenderAll();
                }
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
            }
        });

        canvas.on('mouse:up', function(opt: any) {
            if (this.isDragging) {
                this.setViewportTransform(this.viewportTransform);
                this.isDragging = false;
                this.selection = true;
                this.setCursor('grab'); 
            }
        });

        // Touch events for mobile pan and zoom
        canvas.on('touch:gesture', function(e: any) {
            if (e.e.touches && e.e.touches.length == 2) {
                const touch1 = e.e.touches[0];
                const touch2 = e.e.touches[1];
                if (e.state == 'start') {
                    this.zoomStartScale = this.getZoom();
                }
                const scale = e.self.scale;
                this.zoomToPoint(new fabric.Point(e.self.x, e.self.y), this.zoomStartScale * scale);
            }
        });

        canvas.on('touch:drag', function(e: any) {
             if (e.e.touches && e.e.touches.length == 2) {
                 // Implement two finger pan
                 this.isTwoFingerPan = true;
                 // Pan logic is handled in mouse:move and mouse:down
             }
        });


        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt' && fabricCanvasRef.current && !fabricCanvasRef.current.isDragging) {
                fabricCanvasRef.current.setCursor('grab');
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                const activeObj = fabricCanvasRef.current?.getActiveObject();
                if (activeObj) {
                    if (activeObj.type === 'activeSelection') {
                        activeObj.getObjects().forEach((obj: any) => fabricCanvasRef.current.remove(obj));
                    }
                    fabricCanvasRef.current.remove(activeObj);
                    fabricCanvasRef.current.discardActiveObject();
                    fabricCanvasRef.current.requestRenderAll();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt' && fabricCanvasRef.current) {
                fabricCanvasRef.current.setCursor('default');
                if(fabricCanvasRef.current.isDragging){
                    fabricCanvasRef.current.isDragging = false;
                    fabricCanvasRef.current.selection = true;
                    fabricCanvasRef.current.renderAll();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        // --- End Panning and Zooming ---

        fabric.Image.fromURL(initialImageUrl, (img: any) => {
            const container = canvasRef.current?.parentElement;
            if (!container) return;

            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const imgAspectRatio = (img.width || 1) / (img.height || 1);
            
            let canvasWidth = containerWidth;
            let canvasHeight = containerWidth / imgAspectRatio;

            if (canvasHeight > containerHeight) {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * imgAspectRatio;
            }

            canvas.setWidth(canvasWidth);
            canvas.setHeight(canvasHeight);
            
            img.scaleToWidth(canvasWidth);

            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                top: (canvasHeight - img.getScaledHeight()) / 2,
                left: (canvasWidth - img.getScaledWidth()) / 2,
            });
            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        const updateActiveObject = () => setActiveObject(canvas.getActiveObject());
        canvas.on('selection:created', updateActiveObject);
        canvas.on('selection:updated', updateActiveObject);
        canvas.on('selection:cleared', () => setActiveObject(null));

        const deleteObject = (eventData: MouseEvent, transform: any) => {
            const target = transform.target;
            const canvas = target.canvas;
            if (target.type === 'activeSelection') {
                target.getObjects().forEach((obj: any) => canvas.remove(obj));
                canvas.discardActiveObject();
            } else {
                canvas.remove(target);
            }
            canvas.requestRenderAll();
            return true;
        }

        const deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e11d48'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E";
        const delImg = document.createElement('img');
        delImg.src = deleteIcon;

        function renderIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
            const size = this.cornerSize;
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
            ctx.drawImage(delImg, -size / 2, -size / 2, size, size);
            ctx.restore();
        }
        
        fabric.Object.prototype.controls.deleteControl = new fabric.Control({
            x: 0.5, y: -0.5, offsetY: -16, offsetX: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: deleteObject,
            render: renderIcon,
            cornerSize: 24
        });
        
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#22d3ee';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#22d3ee';
        fabric.Object.prototype.borderScaleFactor = 2;


        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            canvas.dispose();
        };
    }, [initialImageUrl]);

    useEffect(() => {
        const obj = activeObject;
        if (obj) {
            setFillColor(obj.get('fill') || '#000000');
            setStrokeColor(obj.get('stroke') || '#000000');
            setStrokeWidth(obj.get('strokeWidth') || 0);
            setOpacity(obj.get('opacity') || 1);
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                setFontFamily(obj.get('fontFamily') || 'Arial');
                const s = obj.get('shadow');
                setShadow(s ? { color: s.color, blur: s.blur, offsetX: s.offsetX, offsetY: s.offsetY } : { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });
            }
        }
    }, [activeObject]);

    const updateProperty = (prop: string, value: any) => {
        const canvas = fabricCanvasRef.current;
        const obj = canvas.getActiveObject();
        if (obj) {
            if(obj.type === 'activeSelection') {
                obj.getObjects().forEach((o: any) => o.set(prop, value));
            } else {
                obj.set(prop, value);
            }
            canvas.renderAll();
        }
    };
    
    const updateShadowProperty = (prop: string, value: any) => {
        const newShadowState = { ...shadow, [prop]: value };
        setShadow(newShadowState);
        updateProperty('shadow', new fabric.Shadow(newShadowState));
    };
    
    const apply3DEffect = () => {
        const newShadowState = { color: '#555555', blur: 0, offsetX: 3, offsetY: 3 };
        setShadow(newShadowState);
        updateProperty('shadow', new fabric.Shadow(newShadowState));
    };

    const addText = () => {
        const canvas = fabricCanvasRef.current;
        const text = new fabric.IText(textValue, {
            left: 50, top: 50, fontFamily: fontFamily, fill: fillColor,
            fontSize: 40, stroke: strokeColor, strokeWidth: strokeWidth,
            shadow: new fabric.Shadow(shadow)
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };
    
    const addShape = (type: 'rect' | 'circle') => {
        const canvas = fabricCanvasRef.current;
        let shape;
        if (type === 'rect') shape = new fabric.Rect({ left: 100, top: 100, width: 100, height: 100, fill: fillColor, stroke: strokeColor, strokeWidth: 2 });
        else shape = new fabric.Circle({ left: 150, top: 150, radius: 50, fill: fillColor, stroke: strokeColor, strokeWidth: 2 });
        canvas.add(shape);
        canvas.setActiveObject(shape);
    };

    const handleLayering = (direction: 'front' | 'back') => {
        const canvas = fabricCanvasRef.current;
        const obj = canvas.getActiveObject();
        if(obj) {
            if(direction === 'front') obj.bringToFront();
            else obj.sendToBack();
            canvas.renderAll();
        }
    };

    const handleAiEdit = async () => {
        if (!aiPrompt.trim()) { setError("يرجى كتابة أمر تعديل للذكاء الاصطناعي."); return; }
        setIsAiEditing(true); setError(null);
        try {
            logStatus("📸 جاري تحضير الصورة الحالية لإرسالها للذكاء الاصطناعي...");
            const dataUrl = fabricCanvasRef.current.toDataURL({ format: 'png' });
            const base64Data = dataUrl.split(',')[1];
            const { imageUrl } = await editImage([{ data: base64Data, mimeType: 'image/png' }], aiPrompt, slug || 'ai-edit', imgbbApiKey, logStatus, useCreativeBypass);
            logStatus("🎨 تم استلام الصورة المعدلة، جاري تحديث المحرر...");
            fabric.Image.fromURL(imageUrl, (img: any) => {
                fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current), {});
            }, { crossOrigin: 'anonymous' });
        } catch(e: any) { setError(e.message); } finally { setIsAiEditing(false); }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            logStatus("💾 بدء عملية الحفظ النهائية...");
            const dataUrl = fabricCanvasRef.current.toDataURL({ format: 'png' });
            
            if (imgbbApiKey) {
                logStatus("🖼️ تحويل الصورة إلى WebP...");
                const webpDataUrl = await convertToWebp(dataUrl, 0.9);
                const webpBase64 = webpDataUrl.split(',')[1];

                logStatus(`☁️ رفع الصورة إلى الاستضافة باسم: ${slug}.webp...`);
                const hostedUrl = await uploadImageToHost(webpBase64, imgbbApiKey, slug);
                logStatus("✅ تم رفع الصورة بنجاح.");
                onSave(hostedUrl);
            } else {
                logStatus("⚠️ لم يتم توفير مفتاح ImgBB. سيتم استخدام رابط بيانات مؤقت.");
                onSave(dataUrl); // Fallback to data URL
            }

        } catch (e: any) {
            const message = e.message || "حدث خطأ غير معروف أثناء الحفظ.";
            setError(message);
            logStatus(`❌ فشل الحفظ: ${message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="flex-grow flex flex-col md:flex-row gap-2 p-2 overflow-auto h-full" style={{ resize: 'both' }}>
            <div className="w-full md:w-80 flex-shrink-0 bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 flex flex-col overflow-y-auto">
                <div className="flex-grow space-y-4"> {/* Main controls container */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-sm">إضافة عنصر</h4>
                        <input type="text" value={textValue} onChange={e => setTextValue(e.target.value)} className="w-full p-2 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" placeholder="اكتب النص هنا..."/>
                        <button onClick={addText} className="w-full p-2 text-sm bg-blue-600 text-white rounded">إضافة نص</button>
                        <div className="flex gap-2">
                            <button onClick={() => addShape('rect')} className="w-full p-2 text-sm bg-blue-600 text-white rounded">إضافة مربع</button>
                            <button onClick={() => addShape('circle')} className="w-full p-2 text-sm bg-blue-600 text-white rounded">إضافة دائرة</button>
                        </div>
                    </div>

                    {activeObject && (
                        <div className="space-y-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <h4 className="font-bold text-sm">خصائص العنصر المحدد</h4>
                            <div>
                                <label className="text-xs">اللون الداخلي</label>
                                <input type="color" value={fillColor} onChange={e => { setFillColor(e.target.value); updateProperty('fill', e.target.value); }} className="w-full h-8 p-1"/>
                            </div>
                            <div>
                                <label className="text-xs">الشفافية: {Math.round(opacity * 100)}%</label>
                                <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => { setOpacity(Number(e.target.value)); updateProperty('opacity', Number(e.target.value)); }} className="w-full"/>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleLayering('front')} className="w-full p-1 text-xs bg-gray-600 text-white rounded">إحضار للأمام</button>
                                <button onClick={() => handleLayering('back')} className="w-full p-1 text-xs bg-gray-600 text-white rounded">إرسال للخلف</button>
                            </div>
                            {(activeObject.type === 'i-text' || activeObject.type === 'textbox') && (
                                <div className="space-y-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                    <h4 className="font-bold text-sm">تأثيرات النص</h4>
                                    <div>
                                        <label className="text-xs">الخط</label>
                                        <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); updateProperty('fontFamily', e.target.value); }} className="w-full p-2 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                            <option value="Arial">Arial</option> <option value="Times New Roman">Times New Roman</option>
                                            {customFonts.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs">لون الحد (Stroke)</label>
                                        <input type="color" value={strokeColor} onChange={e => { setStrokeColor(e.target.value); updateProperty('stroke', e.target.value); }} className="w-full h-8 p-1"/>
                                        <label className="text-xs">عرض الحد: {strokeWidth}px</label>
                                        <input type="range" min="0" max="30" value={strokeWidth} onChange={e => { setStrokeWidth(Number(e.target.value)); updateProperty('strokeWidth', Number(e.target.value)); }} className="w-full"/>
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-bold">الظل (Shadow)</h5>
                                        <label className="text-xs">لون الظل</label>
                                        <input type="color" value={shadow.color} onChange={e => updateShadowProperty('color', e.target.value)} className="w-full h-8 p-1"/>
                                        <label className="text-xs">تمويه: {shadow.blur}px</label>
                                        <input type="range" min="0" max="50" value={shadow.blur} onChange={e => updateShadowProperty('blur', Number(e.target.value))} className="w-full"/>
                                        <label className="text-xs">إزاحة X: {shadow.offsetX}px</label>
                                        <input type="range" min="-50" max="50" value={shadow.offsetX} onChange={e => updateShadowProperty('offsetX', Number(e.target.value))} className="w-full"/>
                                        <label className="text-xs">إزاحة Y: {shadow.offsetY}px</label>
                                        <input type="range" min="-50" max="50" value={shadow.offsetY} onChange={e => updateShadowProperty('offsetY', Number(e.target.value))} className="w-full"/>
                                        <button onClick={apply3DEffect} className="w-full mt-2 p-1 text-xs bg-gray-600 text-white rounded">تطبيق تأثير 3D</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                
                    <div className="space-y-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        <h4 className="font-bold text-sm">🤖 تعديل بالذكاء الاصطناعي</h4>
                        <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} placeholder="اكتب أمراً للتعديل (مثال: add a sunset effect)" className="w-full p-2 text-sm rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></textarea>
                        <label className="flex items-center gap-2 cursor-pointer text-xs my-1">
                            <input 
                                type="checkbox" 
                                checked={useCreativeBypass} 
                                onChange={e => setUseCreativeBypass(e.target.checked)} 
                                className="h-3 w-3 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                                فلتر فني
                            </span>
                        </label>
                        <button onClick={handleAiEdit} disabled={isAiEditing} className="w-full p-2 text-sm bg-purple-600 text-white rounded flex items-center justify-center">
                            {isAiEditing ? <LoadingIndicator /> : 'نفذ التعديل بالـ AI'}
                        </button>
                    </div>
                </div>

                <div className="flex-shrink-0 pt-3 border-t border-gray-300 dark:border-gray-600 mt-3">
                    <BackgroundImageUploader 
                        onImageSelect={setReplacementImage}
                        onApply={applyReplacementImage}
                        selectedFile={replacementImage}
                    />
                </div>

                 <div className="flex gap-2 pt-4 border-t border-gray-300 dark:border-gray-600 flex-shrink-0">
                    <button onClick={onCancel} className="w-full p-2 bg-gray-500 text-white rounded">إلغاء</button>
                    <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 text-white rounded flex items-center justify-center">
                         {isSaving ? <LoadingIndicator /> : 'حفظ الصورة'}
                    </button>
                </div>
            </div>
            {/* Canvas Area */}
            <div className="relative flex-grow bg-gray-200 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center p-2 min-w-0">
                <canvas ref={canvasRef} />
                <div className="absolute top-2 left-2 bg-gray-800/50 text-white text-xs p-2 rounded-lg backdrop-blur-sm">
                    <p><b>تحريك:</b> Alt + سحب (أو إصبعين)</p>
                    <p><b>تكبير:</b> عجلة الماوس (أو قرص إصبعين)</p>
                </div>
                <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
                    <button onClick={zoomIn} className="w-10 h-10 bg-gray-800/70 text-white rounded-full flex items-center justify-center text-lg hover:bg-gray-700/90 transition-colors shadow-lg" title="تكبير">
                        <i className="fas fa-plus"></i>
                    </button>
                    <button onClick={zoomOut} className="w-10 h-10 bg-gray-800/70 text-white rounded-full flex items-center justify-center text-lg hover:bg-gray-700/90 transition-colors shadow-lg" title="تصغير">
                        <i className="fas fa-minus"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

const CanvasEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (dataUrl: string) => void;
    initialImageUrl: string;
    customFonts: CustomFont[];
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    imgbbApiKey?: string;
    slug: string;
}> = ({ isOpen, onClose, onSave, initialImageUrl, customFonts, logStatus, setError, imgbbApiKey, slug }) => {
    
    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-gray-900 z-50 p-0" onClick={onClose}>
            <div className="bg-gray-800 w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-3 border-b border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-cyan-400">محرر الصور المتقدم</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <CanvasEditorImpl 
                    initialImageUrl={initialImageUrl}
                    customFonts={customFonts}
                    onSave={onSave}
                    onCancel={onClose}
                    logStatus={logStatus}
                    setError={setError}
                    imgbbApiKey={imgbbApiKey}
                    slug={slug}
                />
            </div>
        </div>
    );
}
export default CanvasEditorModal;