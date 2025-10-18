import React, { useState, useRef } from 'react';
import { apiKeyManager } from '../apiKeyManager';
import { ApiKey, ApiKeyStatus } from '../types';
import { validateApiKey, validateImgbbApiKey, validateYoutubeApiKey } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import { fileToText } from '../utils/file';

interface ApiKeyManagerProps {
    geminiApiKeys: ApiKey[];
    setGeminiApiKeys: (keys: ApiKey[]) => void;
    imgbbApiKey: ApiKey;
    setImgbbApiKey: (key: ApiKey) => void;
    youtubeApiKey: ApiKey;
    setYoutubeApiKey: (key: ApiKey) => void;
    activeKeyIndex: number;
    setActiveKeyIndex: (index: number) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = (props) => {
    
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isEditing, setIsEditing] = useState(props.geminiApiKeys.length === 0 && !props.imgbbApiKey.key && !props.youtubeApiKey.key);
    
    const [localGeminiKeys, setLocalGeminiKeys] = useState<string[]>([]);
    const [localImgbbKey, setLocalImgbbKey] = useState(props.imgbbApiKey.key);
    const [localYoutubeKey, setLocalYoutubeKey] = useState(props.youtubeApiKey.key);
    const [isChecking, setIsChecking] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const purpleButtonClasses = "w-full px-4 py-2 text-sm rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors duration-300";

    const getOverallStatus = (): 'success' | 'warning' | 'error' | 'unknown' => {
        const allKeys = [...props.geminiApiKeys, props.imgbbApiKey, props.youtubeApiKey].filter(k => k.key);
        if (allKeys.length === 0) return 'unknown';

        if (allKeys.some(k => k.status === 'invalid')) return 'error';
        if (allKeys.some(k => k.status === 'quota_exceeded')) return 'warning';
        if (allKeys.every(k => k.status === 'valid')) return 'success';
        
        return 'unknown';
    };
    
    const parseAndApplyKeys = (text: string) => {
        const lines = text.split('\n');
        
        const newGeminiKeys: ApiKey[] = [];
        let newImgbbKey: ApiKey | null = null;
        let newYoutubeKey: ApiKey | null = null;

        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length < 2) return;

            const keyType = parts[0].trim().toUpperCase();
            const keyValue = parts.slice(1).join('=').trim();
            if (!keyValue) return;

            switch (keyType) {
                case 'GEMINI':
                    newGeminiKeys.push({ key: keyValue, status: 'unknown' });
                    break;
                case 'IMGBB':
                    newImgbbKey = { key: keyValue, status: 'unknown' };
                    break;
                case 'YOUTUBE':
                    newYoutubeKey = { key: keyValue, status: 'unknown' };
                    break;
                default:
                    break;
            }
        });
        
        const finalGeminiKeys = newGeminiKeys.length > 0 ? newGeminiKeys : props.geminiApiKeys;
        const finalImgbbKey = newImgbbKey || props.imgbbApiKey;
        const finalYoutubeKey = newYoutubeKey || props.youtubeApiKey;

        apiKeyManager.saveSettings({
            geminiApiKeys: finalGeminiKeys,
            imgbbApiKey: finalImgbbKey,
            youtubeApiKey: finalYoutubeKey,
        });
        
        props.setGeminiApiKeys(finalGeminiKeys);
        props.setImgbbApiKey(finalImgbbKey);
        props.setYoutubeApiKey(finalYoutubeKey);
        props.setActiveKeyIndex(0);

        alert('تم استيراد المفاتيح بنجاح!');
        setIsEditing(false);
    };

    const handleFileImport = async (file: File) => {
        try {
            const text = await fileToText(file);
            parseAndApplyKeys(text);
        } catch (error) {
            alert(`فشل في قراءة أو تحليل الملف: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileImport(e.dataTransfer.files[0]);
        }
    };

    const handleFileImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            await handleFileImport(event.target.files[0]);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleSave = () => {
        const keysToSave: ApiKey[] = localGeminiKeys.map(keyStr => {
            const trimmedKey = keyStr.trim();
            const existing = props.geminiApiKeys.find(k => k.key === trimmedKey);
            return existing ? existing : { key: trimmedKey, status: 'unknown' };
        }).filter(k => k.key);
        
        const newImgbbApiKey: ApiKey = { key: localImgbbKey.trim(), status: props.imgbbApiKey.key === localImgbbKey.trim() ? props.imgbbApiKey.status : 'unknown' };
        const newYoutubeApiKey: ApiKey = { key: localYoutubeKey.trim(), status: props.youtubeApiKey.key === localYoutubeKey.trim() ? props.youtubeApiKey.status : 'unknown' };

        apiKeyManager.saveSettings({ geminiApiKeys: keysToSave, imgbbApiKey: newImgbbApiKey, youtubeApiKey: newYoutubeApiKey });

        props.setGeminiApiKeys(keysToSave);
        props.setImgbbApiKey(newImgbbApiKey);
        props.setYoutubeApiKey(newYoutubeApiKey);
        props.setActiveKeyIndex(0);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setLocalGeminiKeys(props.geminiApiKeys.map(k => k.key));
        setLocalImgbbKey(props.imgbbApiKey.key);
        setLocalYoutubeKey(props.youtubeApiKey.key);
        setIsEditing(true);
        setIsCollapsed(false);
    };
    
    const handleCancel = () => { if (props.geminiApiKeys.length > 0 || props.imgbbApiKey.key || props.youtubeApiKey.key) setIsEditing(false); };
    const handleKeyChange = (index: number, value: string) => { setLocalGeminiKeys(prev => { const newKeys = [...prev]; newKeys[index] = value; return newKeys; }); };
    const handleRemoveKey = (index: number) => setLocalGeminiKeys(prev => prev.filter((_, i) => i !== index));
    const handleAddKey = () => setLocalGeminiKeys(prev => [...prev, '']);

    const handleValidateKeys = async () => {
        setIsChecking(true);
        const geminiPromises = props.geminiApiKeys.map(async (apiKey) => ({ ...apiKey, status: await validateApiKey(apiKey.key) }));
        const [updatedGeminiKeys, updatedImgbbKey, updatedYoutubeKey] = await Promise.all([
            Promise.all(geminiPromises),
            validateImgbbApiKey(props.imgbbApiKey.key).then(status => ({ ...props.imgbbApiKey, status })),
            validateYoutubeApiKey(props.youtubeApiKey.key).then(status => ({ ...props.youtubeApiKey, status })),
        ]);
        props.setGeminiApiKeys(updatedGeminiKeys);
        props.setImgbbApiKey(updatedImgbbKey);
        props.setYoutubeApiKey(updatedYoutubeKey);
        apiKeyManager.saveSettings({ geminiApiKeys: updatedGeminiKeys, imgbbApiKey: updatedImgbbKey, youtubeApiKey: updatedYoutubeKey });
        setIsChecking(false);
    };
    
    const maskKey = (key: string) => (key && key.length >= 12) ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : key;
    const getStatusIndicator = (status: ApiKeyStatus) => {
        switch (status) {
            case 'valid': return { icon: 'fas fa-check-circle', color: 'text-green-400' };
            case 'invalid': return { icon: 'fas fa-times-circle', color: 'text-red-400' };
            case 'quota_exceeded': return { icon: 'fas fa-exclamation-triangle', color: 'text-yellow-400' };
            default: return { icon: 'fas fa-question-circle', color: 'text-gray-400' };
        }
    };
    
    const renderContent = () => {
        const editingContent = isEditing ? (
            <div className="space-y-4">
                <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900/40">
                    <h4 className="text-sm font-bold text-center text-gray-600 dark:text-gray-300">خدمة Google Gemini (للصور والنصوص)</h4>
                     <div className="space-y-2">
                        {localGeminiKeys.map((key, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={key} onChange={(e) => handleKeyChange(index, e.target.value)} placeholder={`مفتاح Gemini #${index + 1}`} className="flex-grow w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm" />
                                <button onClick={() => handleRemoveKey(index)} className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white" aria-label={`Remove key ${index + 1}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddKey} className={purpleButtonClasses}>+ إضافة مفتاح Gemini جديد</button>
                </div>
                 <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900/40">
                    <h4 className="text-sm font-bold text-center text-gray-600 dark:text-gray-300">خدمات إضافية</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">مفتاح ImgBB API (لرفع الصور)</label>
                        <input type="text" value={localImgbbKey} onChange={(e) => setLocalImgbbKey(e.target.value)} placeholder="مفتاح لرفع الصور تلقائيًا" className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">مفتاح YouTube Data API (للبحث عن فيديوهات)</label>
                        <input type="text" value={localYoutubeKey} onChange={(e) => setLocalYoutubeKey(e.target.value)} placeholder="مفتاح للبحث في يوتيوب" className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm" />
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={handleCancel} className={purpleButtonClasses}>إلغاء</button>
                    <button onClick={handleSave} className="w-full px-4 py-2 text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 text-white">حفظ الكل</button>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    {props.geminiApiKeys.map((apiKey, index) => {
                        const { icon, color } = getStatusIndicator(apiKey.status);
                        return <div key={index} className={`p-2 rounded-md bg-gray-900/50 text-sm font-mono flex justify-between items-center border ${index === props.activeKeyIndex ? 'border-cyan-500' : 'border-transparent'}`}>
                            <div className="flex items-center gap-2"><i className={`${icon} ${color} text-lg`}></i><span className="font-semibold text-gray-300">Gemini #{index + 1}</span></div>
                            <span className="text-gray-400">{maskKey(apiKey.key)}</span>
                        </div>;
                    })}
                    {props.imgbbApiKey.key && (({ icon, color }) => <div className="p-2 rounded-md bg-gray-900/50 text-sm font-mono flex justify-between items-center"><div className="flex items-center gap-2"><i className={`${icon} ${color} text-lg`}></i><span className="font-semibold text-gray-300">ImgBB</span></div><span className="text-gray-400">{maskKey(props.imgbbApiKey.key)}</span></div>)(getStatusIndicator(props.imgbbApiKey.status))}
                    {props.youtubeApiKey.key && (({ icon, color }) => <div className="p-2 rounded-md bg-gray-900/50 text-sm font-mono flex justify-between items-center"><div className="flex items-center gap-2"><i className={`${icon} ${color} text-lg`}></i><span className="font-semibold text-gray-300">YouTube</span></div><span className="text-gray-400">{maskKey(props.youtubeApiKey.key)}</span></div>)(getStatusIndicator(props.youtubeApiKey.status))}
                </div>
                 <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={handleEdit} className={purpleButtonClasses}>تعديل المفاتيح</button>
                    <button onClick={handleValidateKeys} disabled={isChecking} className="w-full px-4 py-2 text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center disabled:bg-gray-600">
                       {isChecking ? <LoadingIndicator /> : 'فحص حالة المفاتيح'}
                    </button>
                </div>
            </div>
        );

        return (
            <>
                {editingContent}
                <div className="space-y-4 pt-4 mt-4 border-t border-gray-700/50">
                    <div 
                        onClick={handleFileImportClick}
                        onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-cyan-900/30 border-solid' : 'border-purple-500/50 bg-gray-900/40 border-dashed'}`}
                    >
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                            <i className="fas fa-file-import text-2xl"></i>
                            <p className="text-sm font-semibold">اسحب وأفلت ملف المفاتيح (.txt) هنا أو انقر للاختيار</p>
                            <p className="text-xs">التنسيق: GEMINI=... أو IMGBB=...</p>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileInputChange} className="hidden" accept=".txt" />
                </div>
            </>
        );
    }
    
    const status = getOverallStatus();
    const statusClasses: { [key in typeof status]: string } = {
        success: 'glowing-key-green',
        warning: 'glowing-key-yellow',
        error: 'glowing-key-red',
        unknown: 'glowing-key-blue',
    };

    return (
        <div>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="api-key-banner w-full flex justify-between items-center"
            >
                <div className="flex items-center gap-4">
                     <i className={`fas fa-key text-3xl glowing-key ${statusClasses[status]}`}></i>
                     <div>
                        <h3 className="font-bold text-lg text-white">إدارة مفاتيح التشغيل (API Keys)</h3>
                        <p className="text-sm text-gray-400">انقر هنا لفتح وإدارة مفاتيح Gemini, ImgBB, وغيرها</p>
                     </div>
                </div>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-300 transform transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {!isCollapsed && (
                 <div className="p-4 bg-gray-800/50 border border-t-0 border-gray-700 rounded-b-lg space-y-4">
                    {renderContent()}
                </div>
            )}
         </div>
    );
};

export default ApiKeyManager;
