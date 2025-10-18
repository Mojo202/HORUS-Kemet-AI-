import React from 'react';

interface FooterProps {
    onShowPage: (page: 'about' | 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPage }) => {
    return (
        <footer className="w-full mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <div className="container mx-auto px-4 flex flex-col items-center gap-4">
                 <div className="flex items-center gap-4 text-sm">
                    <button onClick={() => onShowPage('about')} className="hover:text-cyan-500 transition-colors">من نحن</button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button onClick={() => onShowPage('privacy')} className="hover:text-cyan-500 transition-colors">سياسة الخصوصية</button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button onClick={() => onShowPage('terms')} className="hover:text-cyan-500 transition-colors">شروط الاستخدام</button>
                </div>
                <p className="text-sm">
                    تطوير وانتاج شركة حورس إچيبت للتطوير البرمجي. جميع الحقوق محفوظة. - &copy; {new Date().getFullYear()}
                </p>
                
                <p className="text-xs font-semibold">
                    <span>مدير الشركة: د. محمد الجندي</span>
                    <span className="mx-3 text-gray-400 dark:text-gray-600">|</span>
                    <span>رئيس التحرير: أ. قدر يحيى</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;