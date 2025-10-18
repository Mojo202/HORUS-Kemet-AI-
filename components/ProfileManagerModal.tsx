import React, { useState } from 'react';
import { Profile } from '../types';
import { CONTENT_TYPE_OPTIONS } from '../constants';

interface ProfileManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    profiles: Profile[];
    setProfiles: (profiles: Profile[]) => void;
    onLoadProfile: (profile: Profile) => void;
    getCurrentSettings: () => Omit<Profile, 'id' | 'name'>;
    logStatus: (message: string) => void;
}

const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({ isOpen, onClose, profiles, setProfiles, onLoadProfile, getCurrentSettings, logStatus }) => {
    const [profileName, setProfileName] = useState('');

    const handleSave = () => {
        if (!profileName.trim()) {
            alert('يرجى إدخال اسم لملف التعريف.');
            return;
        }
        if (profiles.some(p => p.name === profileName.trim())) {
            if (!window.confirm(`ملف تعريف بالاسم "${profileName.trim()}" موجود بالفعل. هل تريد الكتابة فوقه؟`)) {
                return;
            }
        }

        const currentSettings = getCurrentSettings();
        if (!currentSettings.contentType) {
            logStatus("لا يمكن حفظ ملف التعريف من الصفحة الرئيسية. يرجى الانتقال إلى إحدى صفحات إنشاء المحتوى أولاً.");
            alert("لا يمكن حفظ ملف التعريف من الصفحة الرئيسية. يرجى الانتقال إلى إحدى صفحات إنشاء المحتوى أولاً.");
            return;
        }

        const newProfile: Profile = {
            id: `profile-${Date.now()}`,
            name: profileName.trim(),
            ...currentSettings
        };
        
        // If overwriting, replace, otherwise add
        const existingIndex = profiles.findIndex(p => p.name === newProfile.name);
        const newProfiles = [...profiles];
        if (existingIndex > -1) {
            newProfiles[existingIndex] = { ...newProfile, id: profiles[existingIndex].id };
        } else {
            newProfiles.push(newProfile);
        }

        setProfiles(newProfiles);
        setProfileName('');
        logStatus(`✅ تم حفظ ملف التعريف "${newProfile.name}".`);
    };

    const handleDelete = (profileId: string) => {
        if (window.confirm("هل أنت متأكد من حذف ملف التعريف هذا؟")) {
            const profileToDelete = profiles.find(p => p.id === profileId);
            setProfiles(profiles.filter(p => p.id !== profileId));
            if (profileToDelete) {
                logStatus(`🗑️ تم حذف ملف التعريف "${profileToDelete.name}".`);
            }
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400"><i className="fas fa-save mr-2"></i>إدارة ملفات التعريف</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                        <h4 className="font-semibold text-center">حفظ الإعدادات الحالية</h4>
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                value={profileName} 
                                onChange={(e) => setProfileName(e.target.value)} 
                                placeholder="اسم ملف التعريف (مثال: مقالات أخبار قصيرة)"
                                className="flex-grow w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                            />
                            <button onClick={handleSave} className="px-6 py-2 text-sm font-semibold rounded-md bg-cyan-600 text-white hover:bg-cyan-700">
                                حفظ
                            </button>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">ملفات التعريف المحفوظة ({profiles.length})</h4>
                        {profiles.length > 0 ? (
                            <ul className="space-y-3">
                                {profiles.map(profile => {
                                    const pageConfig = CONTENT_TYPE_OPTIONS.find(o => o.value === profile.contentType);
                                    return (
                                        <li key={profile.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700 gap-3">
                                            <div className="flex-grow">
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{profile.name}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {pageConfig && <span><i className={pageConfig.iconClass}></i> {pageConfig.label}</span>}
                                                    <span><i className="fas fa-file-word"></i> {profile.preferences.wordCount} كلمة</span>
                                                    <span><i className="fas fa-cogs"></i> {profile.selectedTextModel}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end md:self-center">
                                                <button onClick={() => handleDelete(profile.id)} className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-md">حذف</button>
                                                <button onClick={() => { onLoadProfile(profile); onClose(); }} className="px-4 py-1.5 text-xs text-white bg-purple-600 hover:bg-purple-700 rounded-md">تحميل</button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-6">لا توجد ملفات تعريف محفوظة.</p>
                        )}
                    </div>
                </div>
                 <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileManagerModal;