import React from 'react';

interface StaticPageModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

const StaticPageModal: React.FC<StaticPageModalProps> = ({ title, content, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-300 dark:border-cyan-500/30"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-3xl font-light" aria-label="Close">&times;</button>
                </div>
                <div 
                    className="p-8 overflow-y-auto prose dark:prose-invert max-w-none text-right"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                 <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                    <button onClick={onClose} className="px-6 py-2 text-sm rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaticPageModal;