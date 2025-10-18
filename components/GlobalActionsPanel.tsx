import React, { useRef } from 'react';

interface ActionButtonProps {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, description, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 bg-purple-600/10 dark:bg-purple-500/10 border-purple-500/30 dark:border-purple-400/30 hover:bg-purple-600/20 dark:hover:bg-purple-500/20 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
        <i className={`${icon} text-4xl text-purple-500 dark:text-purple-400`}></i>
        <div className="text-center">
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </button>
);


interface GlobalActionsPanelProps {
    onShowFontManager: () => void;
    onImportSettings: (file: File) => void;
    onExportSettings: () => void;
    onStartOver: () => void;
}

const GlobalActionsPanel: React.FC<GlobalActionsPanelProps> = ({
    onShowFontManager,
    onImportSettings,
    onExportSettings,
    onStartOver
}) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImportSettings(event.target.files[0]);
        }
        if (event.target) {
            event.target.value = "";
        }
    };

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-purple-500/30 space-y-4 shadow-xl shadow-purple-500/10">
            <h3 className="font-extrabold text-3xl lg:text-4xl text-purple-400 tracking-wider text-center" style={{ textShadow: '0 0 15px rgba(192, 132, 252, 0.7)' }}>
                لوحة التحكم العامة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionButton
                    icon="fas fa-font"
                    title="مدير الخطوط"
                    description="ارفع وعدّل الخطوط المخصصة"
                    onClick={onShowFontManager}
                />
                <ActionButton
                    icon="fas fa-file-upload"
                    title="استيراد الإعدادات"
                    description="حمّل إعداداتك من ملف"
                    onClick={() => importInputRef.current?.click()}
                />
                <ActionButton
                    icon="fas fa-file-download"
                    title="تصدير الإعدادات"
                    description="احفظ إعداداتك في ملف"
                    onClick={onExportSettings}
                />
                <ActionButton
                    icon="fas fa-sync-alt"
                    title="البدء من جديد"
                    description="إعادة تحميل وتحديث الصفحة"
                    onClick={onStartOver}
                />
            </div>
            <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".json"/>
        </div>
    );
};

export default GlobalActionsPanel;