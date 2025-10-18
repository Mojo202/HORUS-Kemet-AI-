import React, { useState, useRef } from 'react';
import ThemeToggle from './ThemeToggle';

// الأيقونة الجديدة مطابقة لبانر "مخطوطة حورس"
const HorusEyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 65" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,30 Q50,0 95,30 Q50,60 5,30 Z" fill="none"/>
      <circle cx="50" cy="30" r="12" fill="white" stroke="none" />
      <path d="M50,42 V55 L40,58" fill="none"/>
      <path d="M95,30 C90,45 80,55 75,58" fill="none"/>
    </svg>
);


interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onShowFavorites: () => void;
    favoritesCount: number;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isGenerating: boolean;
    onShowPage: (page: 'about' | 'privacy' | 'terms') => void;
    onShowProfileManager: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    theme, setTheme, onShowFavorites, favoritesCount,
    onUndo, onRedo, canUndo, canRedo, isGenerating,
    onShowPage, onShowProfileManager
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <HorusEyeIcon className="h-10 w-10 text-cyan-500 dark:text-cyan-400" />
        <h1 className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
            أدوات حورس للسيو
        </h1>
      </div>
       <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-purple-500/20 text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed" title="تراجع (Undo)">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" /></svg>
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-purple-500/20 text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed" title="إعادة (Redo)">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-4-4m4 4l-4 4" /></svg>
            </button>
        </div>
      <div className="flex items-center gap-2">
       
        <button
          onClick={onShowProfileManager}
          className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="Show profiles"
          title="ملفات التعريف المحفوظة"
        >
          <i className="fas fa-save text-xl"></i>
        </button>
        <button
          onClick={onShowFavorites}
          className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="Show favorites"
          title="عرض المقالات المفضلة"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {favoritesCount}
                </span>
            )}
        </button>
        
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="صفحات إضافية"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            {isMenuOpen && (
                <div 
                  className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-20"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button onClick={() => { onShowPage('about'); setIsMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">من نحن</button>
                        <button onClick={() => { onShowPage('privacy'); setIsMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">سياسة الخصوصية</button>
                        <button onClick={() => { onShowPage('terms'); setIsMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">شروط الاستخدام</button>
                    </div>
                </div>
            )}
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
};

export default Header;