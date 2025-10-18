import React, { useState } from 'react';
import { GeneratedArticle } from '../types';

interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    articles: GeneratedArticle[];
    onRemove: (articleId: number) => void;
}

const FavoriteArticleItem: React.FC<{
    article: GeneratedArticle;
    onRemove: (articleId: number) => void;
}> = ({ article, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(article.html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-3 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{article.title}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <span>التقييم: {'⭐'.repeat(article.rating || 0)}</span>
                        <span>|</span>
                        <span>الرابط: /{article.slug}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(article.id); }}
                        className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                        title="إزالة من المفضلة"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                    <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">كود المقال الكامل (HTML)</h5>
                        <button onClick={handleCopy} className="px-3 py-1 text-xs rounded-md bg-cyan-600 text-white hover:bg-cyan-700">
                            {copied ? '✔ تم النسخ' : '📋 نسخ'}
                        </button>
                    </div>
                    <textarea
                        readOnly
                        dir="ltr"
                        className="w-full h-48 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-xs"
                        value={article.html}
                    />
                </div>
            )}
        </div>
    );
};

const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose, articles, onRemove }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-300 dark:border-cyan-500/30"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">⭐ المقالات المفضلة ({articles.length})</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold" aria-label="Close">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {articles.length > 0 ? (
                        articles.map(article => (
                            <FavoriteArticleItem key={article.id} article={article} onRemove={onRemove} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                            لم تقم بحفظ أي مقالات في المفضلة بعد.
                            <br/>
                            انقر على أيقونة النجمة ⭐ بجانب أي مقال لحفظه هنا.
                        </p>
                    )}
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

export default FavoritesModal;