import React, { useState, useRef, useEffect } from 'react';
import { fileToText } from '../utils/file';
import { HORUS_TEMPLATES } from '../services/horusTemplates';
import { HorusTemplate } from '../types';

interface CollapsiblePersonaEditorProps {
    title: string;
    description: string;
    persona: { instructions: string; htmlTemplate: string; };
    setPersona: (persona: { instructions: string; htmlTemplate: string; }) => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}

const CollapsiblePersonaEditor: React.FC<CollapsiblePersonaEditorProps> = ({ title, description, persona, setPersona, logStatus, setError }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [localPersona, setLocalPersona] = useState(persona);
    const templateUploadRef = useRef<HTMLInputElement>(null);
    const instructionsUploadRef = useRef<HTMLInputElement>(null);
    const [activeTemplateName, setActiveTemplateName] = useState<string | null>(null);

    const isPersonaActive = persona.instructions.trim() !== '' || persona.htmlTemplate.trim() !== '';

    useEffect(() => {
        setLocalPersona(persona);
    }, [persona]);

    const handleSave = () => {
        setPersona(localPersona);
        setIsCollapsed(true);
        logStatus(`تم حفظ إعدادات "${title}".`);
    };

    const handleCancel = () => {
        setLocalPersona(persona); // Revert changes
        setIsCollapsed(true);
    };
    
    const handleEdit = () => {
        setIsCollapsed(false);
    };
    
    const handleTemplateClick = async (template: HorusTemplate) => {
        setError(null); // Clear previous errors
        const filePath = template.instructions.replace(/^public\//, '');
         if (!filePath) {
            setError("مسار ملف القالب غير صالح.");
            return;
        }
        logStatus(`📄 جاري تحميل قالب HTML: "${template.name}"...`);
        try {
            const response = await fetch(`/${filePath}`);
            if (!response.ok) throw new Error(`Network response was not ok for ${filePath}`);
            const templateHtml = await response.text();
            setLocalPersona(p => ({ ...p, htmlTemplate: templateHtml }));
            setActiveTemplateName(template.name);
            logStatus(`✅ تم تحميل قالب "${template.name}" في محرر HTML.`);
        } catch (e: any) {
            setError(`فشل تحميل قالب HTML: ${e.message}`);
            logStatus(`❌ فشل تحميل قالب HTML: ${e.message}`);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'instructions' | 'htmlTemplate') => {
        if (e.target.files && e.target.files[0]) {
            try {
                const text = await fileToText(e.target.files[0]);
                setLocalPersona(p => ({ ...p, [field]: text }));
            } catch (error) {
                setError(`فشل في قراءة ملف ${field}.`);
            }
        }
    };
    
    const handlePaste = async (field: 'instructions' | 'htmlTemplate') => {
        try {
            const text = await navigator.clipboard.readText();
            setLocalPersona(p => ({ ...p, [field]: text }));
            logStatus(`تم لصق المحتوى في ${field === 'instructions' ? 'تعليمات المخ' : 'قالب HTML'}.`);
        } catch (err) {
            setError("فشل لصق المحتوى من الحافظة. يرجى منح الإذن اللازم.");
        }
    };
    
    const handleCopy = (field: 'instructions' | 'htmlTemplate') => {
        navigator.clipboard.writeText(localPersona[field]);
        logStatus(`تم نسخ محتوى ${field === 'instructions' ? 'تعليمات المخ' : 'قالب HTML'} إلى الحافظة.`);
    };
    
    const handleClear = (field: 'instructions' | 'htmlTemplate') => {
        setLocalPersona(p => ({ ...p, [field]: '' }));
        if (field === 'htmlTemplate') {
            setActiveTemplateName(null);
        }
        logStatus(`تم مسح محتوى ${field === 'instructions' ? 'تعليمات المخ' : 'قالب HTML'}.`);
    };


    if (isCollapsed) {
        return (
            <div className={`p-3 rounded-lg flex justify-between items-center transition-all duration-300 ${isPersonaActive ? 'bg-purple-600/30 dark:bg-purple-500/20 border border-purple-500/50 dark:border-purple-400/40' : 'bg-gray-200 dark:bg-gray-700/50'}`}>
                <div className="flex items-center gap-3">
                    {isPersonaActive ? (
                        <i className="fas fa-brain text-xl text-purple-400 eye-animation"></i>
                    ) : (
                        <i className="fas fa-brain text-xl text-gray-500"></i>
                    )}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{isPersonaActive ? "نشط وجاهز للعمل" : "غير نشط (سيتم استخدام الافتراضي)"}</p>
                    </div>
                </div>
                <button onClick={handleEdit} className="px-4 py-2 text-sm font-semibold rounded-md bg-cyan-600/80 text-white hover:bg-cyan-600">
                    تعديل
                </button>
            </div>
        );
    }
    
    const placeholderInstructions = `اكتب هنا التعليمات التي سيتّبعها الذكاء الاصطناعي (System Prompt).
مثال: أنت كاتب محترف متخصص في... يجب أن يكون أسلوبك...`;
    const placeholderTemplate = `اكتب هنا قالب HTML الذي سيستخدمه الذكاء الاصطناعي.
يمكنك استخدام متغيرات مثل __POST_DATE__ أو __POST_URL__.
تأكد من تضمين السكيما (Schema) إذا لزم الأمر.`;

    const glassButtonClasses = "flex-1 text-xs font-semibold p-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border-2";
    const activeClasses = "bg-cyan-600/30 border-cyan-500 text-white shadow-lg";
    const inactiveClasses = "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-cyan-500/50";

    return (
         <div className="p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <h4 className="font-semibold text-center">{title}</h4>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">{description}</p>
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">شخصية الذكاء الاصطناعي (System Prompt)</label>
                    <div className="flex gap-2">
                        <button onClick={() => handleCopy('instructions')} title="نسخ" className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"><i className="fas fa-copy"></i></button>
                        <button onClick={() => handlePaste('instructions')} title="لصق" className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"><i className="fas fa-paste"></i></button>
                        <button onClick={() => instructionsUploadRef.current?.click()} className="px-3 py-1 text-xs font-semibold rounded-md bg-purple-600/50 text-white hover:bg-purple-600/70 flex items-center gap-2">
                           <i className="fas fa-upload"></i>
                        </button>
                        <button onClick={() => handleClear('instructions')} title="مسح" className="px-3 py-1 text-xs rounded bg-red-600/80 text-white hover:bg-red-600"><i className="fas fa-trash"></i></button>

                    </div>
                </div>
                <input type="file" ref={instructionsUploadRef} onChange={(e) => handleFileUpload(e, 'instructions')} accept=".txt" className="hidden" />
                <textarea placeholder={placeholderInstructions} value={localPersona.instructions} onChange={(e) => setLocalPersona({ ...localPersona, instructions: e.target.value })} rows={10} className="w-full text-xs font-mono bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2"></textarea>
            </div>
             <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">قالب HTML والاسكيما</label>
                    <div className="flex gap-2">
                         <input type="file" ref={templateUploadRef} onChange={(e) => handleFileUpload(e, 'htmlTemplate')} accept=".html,.txt" className="hidden" />
                         <button onClick={() => handleCopy('htmlTemplate')} title="نسخ" className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"><i className="fas fa-copy"></i></button>
                         <button onClick={() => handlePaste('htmlTemplate')} title="لصق" className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"><i className="fas fa-paste"></i></button>
                         <button onClick={() => templateUploadRef.current?.click()} className="px-3 py-1 text-xs font-semibold rounded-md bg-purple-600/50 text-white hover:bg-purple-600/70 flex items-center gap-2">
                            <i className="fas fa-upload"></i>
                         </button>
                        <button onClick={() => handleClear('htmlTemplate')} title="مسح" className="px-3 py-1 text-xs rounded bg-red-600/80 text-white hover:bg-red-600"><i className="fas fa-trash"></i></button>
                    </div>
                </div>
                <div className="space-y-3 mb-2">
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">أو اختر قالب HTML جاهز:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {HORUS_TEMPLATES.filter(template => template.type === 'template').map(template => (
                             <button 
                                key={template.name} 
                                onClick={() => handleTemplateClick(template)}
                                 className={`${glassButtonClasses} ${activeTemplateName === template.name ? activeClasses : inactiveClasses}`}
                             >
                                 <i className={template.icon}></i>
                                 <span>{template.name}</span>
                             </button>
                        ))}
                    </div>
                </div>
                <textarea placeholder={placeholderTemplate} value={localPersona.htmlTemplate} onChange={(e) => setLocalPersona({ ...localPersona, htmlTemplate: e.target.value })} rows={10} className="w-full text-xs font-mono bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2"></textarea>
            </div>
            <div className="flex gap-3 pt-2">
                <button onClick={handleCancel} className="w-full px-4 py-2 text-sm rounded-md bg-gray-500 hover:bg-gray-600 text-white">إلغاء</button>
                <button onClick={handleSave} className="w-full px-4 py-2 text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 text-white">حفظ وإغلاق</button>
            </div>
        </div>
    );
};

export default CollapsiblePersonaEditor;