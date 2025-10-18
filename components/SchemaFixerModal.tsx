import React, { useState, useEffect } from 'react';
import LoadingIndicator from './LoadingIndicator';
import { suggestQaPairs, convertToDynamicSchema } from '../services/geminiService';

interface SchemaFixerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (correctedSchema: string) => void;
    incorrectSchema: string;
    correctedSchema: string;
    isApplying: boolean;
    articleText: string;
    selectedTextModel: string;
    logStatus: (msg: string) => void;
    setError: (err: string | null) => void;
}

const SchemaFixerModal: React.FC<SchemaFixerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    incorrectSchema,
    correctedSchema,
    isApplying,
    articleText,
    selectedTextModel,
    logStatus,
    setError
}) => {
    const [editableSchema, setEditableSchema] = useState(correctedSchema);
    const [questionCount, setQuestionCount] = useState(5);
    const [suggestions, setSuggestions] = useState<{ question: string; answer: string }[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        setEditableSchema(correctedSchema);
    }, [correctedSchema]);

    const handleSuggest = async () => {
        setIsSuggesting(true);
        setSuggestions([]);
        setSelectedIndices(new Set());
        setError(null);
        try {
            const pairs = await suggestQaPairs(articleText, questionCount, selectedTextModel, logStatus);
            setSuggestions(pairs);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSelectionChange = (index: number) => {
        const newSelection = new Set(selectedIndices);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedIndices(newSelection);
    };

    const handleApplySuggestions = () => {
        const selectedPairs = suggestions.filter((_, index) => selectedIndices.has(index));
        if (selectedPairs.length === 0) return;

        const mainEntity = {
            "@type": "Question", "name": selectedPairs[0].question, "text": selectedPairs[0].question,
            "datePublished": "__POST_DATE__", "dateModified": "__POST_MODIFIED_DATE__",
            "author": { "@type": "Person", "name": "__AUTHOR_NAME__", "url": "__AUTHOR_URL__" },
            "answerCount": 1,
            "acceptedAnswer": {
                "@type": "Answer", "text": selectedPairs[0].answer,
                "datePublished": "__POST_DATE__", "dateModified": "__POST_MODIFIED_DATE__", "url": "__POST_URL__",
                "author": { "@type": "Person", "name": "__AUTHOR_NAME__", "url": "__AUTHOR_URL__" }
            }
        };
        
        const hasPart = selectedPairs.slice(1).map(pair => ({
            "@type": "Question", "text": pair.question,
            "datePublished": "__POST_DATE__", "dateModified": "__POST_MODIFIED_DATE__", "answerCount": 1,
            "author": { "@type": "Person", "name": "__AUTHOR_NAME__", "url": "__AUTHOR_URL__" },
            "acceptedAnswer": {
                "@type": "Answer", "text": pair.answer,
                "datePublished": "__POST_DATE__", "dateModified": "__POST_MODIFIED_DATE__",
                "author": { "@type": "Person", "name": "__AUTHOR_NAME__", "url": "__AUTHOR_URL__" }
            }
        }));
        
        const fullSchemaObject = {
            "@context": "https://schema.org", "@type": "QAPage",
            "mainEntity": mainEntity,
            ...(hasPart.length > 0 && { "hasPart": hasPart })
        };
        
        const newSchemaText = `<script id="qaData" type="application/ld+json">\n${JSON.stringify(fullSchemaObject, null, 2)}\n</script>`;
        setEditableSchema(newSchemaText);
        logStatus("✅ تم بناء السكيما من الأسئلة المختارة.");
    };
    
    const handleConvertToDynamic = async () => {
        setIsConverting(true);
        setError(null);
        try {
            const dynamicSchema = await convertToDynamicSchema(editableSchema, selectedTextModel, logStatus);
            setEditableSchema(dynamicSchema);
            logStatus("✅ تم تحويل السكيما إلى متغيرات ديناميكية.");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsConverting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-300 dark:border-cyan-500/30" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400"><i className="fas fa-wrench mr-2"></i>إصلاح وتدقيق السكيما (Schema)</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-2xl">&times;</button>
                </div>
                
                <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <div>
                        <h4 className="font-bold text-red-500 mb-2">❌ قبل (من الذكاء الاصطناعي)</h4>
                        <pre className="h-full w-full bg-red-100/10 dark:bg-red-900/20 border border-red-500/50 rounded-md p-3 text-xs font-mono overflow-auto text-left" dir="ltr">
                            <code>{incorrectSchema || "لم يتم العثور على سكيما."}</code>
                        </pre>
                    </div>
                    <div>
                        <h4 className="font-bold text-green-500 mb-2">✅ بعد (قابل للتعديل)</h4>
                        <textarea className="h-full w-full bg-green-100/10 dark:bg-green-900/20 border border-green-500/50 rounded-md p-3 text-xs font-mono overflow-auto text-left" dir="ltr" value={editableSchema || "لا يمكن إنشاء سكيما صحيحة."} onChange={(e) => setEditableSchema(e.target.value)} />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                    <h4 className="font-bold text-center text-purple-400">أدوات الذكاء الاصطناعي</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700 space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="q-count" className="text-sm">عدد الأسئلة:</label>
                                <input id="q-count" type="number" min="1" max="10" value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))} className="w-20 p-1 text-center bg-white dark:bg-gray-700 rounded"/>
                                <button onClick={handleSuggest} disabled={isSuggesting} className="flex-grow p-2 text-sm bg-cyan-600 text-white rounded flex items-center justify-center">
                                    {isSuggesting ? <LoadingIndicator /> : "🤖 اقتراح أسئلة وأجوبة"}
                                </button>
                            </div>
                            <div className="h-48 overflow-y-auto space-y-2 p-2 bg-white dark:bg-gray-800 rounded">
                                {suggestions.length > 0 ? suggestions.map((s, i) => (
                                    <label key={i} className="flex items-start gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                                        <input type="checkbox" checked={selectedIndices.has(i)} onChange={() => handleSelectionChange(i)} className="mt-1"/>
                                        <div className="text-xs">
                                            <p className="font-bold">{s.question}</p>
                                            <p className="text-gray-500 dark:text-gray-400">{s.answer}</p>
                                        </div>
                                    </label>
                                )) : <p className="text-center text-gray-400 pt-16">ستظهر الاقتراحات هنا...</p>}
                            </div>
                            <button onClick={handleApplySuggestions} disabled={selectedIndices.size === 0} className="w-full p-2 text-sm bg-green-600 text-white rounded disabled:bg-gray-500">📝 تطبيق الأسئلة المختارة</button>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700 flex flex-col justify-center items-center space-y-4">
                            <h5 className="font-semibold text-center">تحويل إلى الديناميكية</h5>
                            <p className="text-xs text-center text-gray-400">
                                استبدال القيم الثابتة (التواريخ، أسماء المؤلفين، الروابط) بالمتغيرات الديناميكية الخاصة ببلوجر.
                            </p>
                            <button onClick={handleConvertToDynamic} disabled={isConverting} className="w-full p-2 text-sm bg-purple-600 text-white rounded flex items-center justify-center">
                                {isConverting ? <LoadingIndicator /> : "✨ تحويل إلى قيم ديناميكية"}
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">سيتم استبدال السكيما القديمة بالكود الموجود في صندوق "بعد".</p>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600">إلغاء</button>
                        <button onClick={() => onConfirm(editableSchema)} disabled={isApplying} className="px-6 py-2 text-sm font-semibold rounded-md bg-cyan-600 text-white hover:bg-cyan-700 flex items-center justify-center disabled:bg-cyan-500/50">
                            {isApplying ? <LoadingIndicator /> : 'تأكيد وتطبيق الإصلاح'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchemaFixerModal;