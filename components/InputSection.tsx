import React, { useRef } from 'react';
import { fileToText } from '../utils/file';

interface InputSectionProps {
  rawInput: string;
  setRawInput: (input: string) => void;
  setError: (error: string | null) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ rawInput, setRawInput, setError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholderText = `يمكنك لصق محتوى المقال (HTML) هنا، أو استخدام "بروتوكول Perplexity" لإدخال مقالات متعددة.

--- شرح بروتوكول Perplexity ---

1.  **بداية المقال:**
    ابدأ كل مقال بالصيغة التالية:
    ARTICLE 1 TITLE: [اكتب هنا عنوان المقال الأول]

2.  **نص المقال:**
    بعد العنوان، الصق نص المقال الكامل.

3.  **الفصل بين المقالات:**
    استخدم ثلاثة نجوم (***) للفصل بين كل مقال والآخر.
    مثال:
    ... نهاية المقال الأول ...
    ***
    ARTICLE 2 TITLE: [اكتب هنا عنوان المقال الثاني]
    ... نص المقال الثاني ...

4.  **قسم المصادر المجمعة (اختياري ولكن موصى به):**
    في نهاية كل المدخلات، يمكنك إضافة قسم للمصادر لجميع المقالات.
    ابدأ القسم بالكلمة التالية:
    الاقتباسات:
    [1] عنوان المصدر الأول https://example.com/source1
    [2] عنوان المصدر الثاني https://example.com/source2
`;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          try {
              const text = await fileToText(event.target.files[0]);
              setRawInput(text);
          } catch (error) {
              console.error("Failed to read file:", error);
              setError("فشل في قراءة الملف.");
          }
      }
      // Reset input to allow uploading the same file again
      if (event.target) {
        event.target.value = "";
      }
  };

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        setRawInput(text);
    } catch (err) {
        setError("فشل في قراءة الحافظة. يرجى التأكد من منح الإذن اللازم للمتصفح.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawInput);
  };


  return (
    <div className="flex flex-col h-full flex-grow">
       <div className="flex justify-between items-center mb-2">
        <label htmlFor="rawInput" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          أدخل بيانات المقال المصدر هنا
        </label>
        <div className="flex items-center gap-2">
            <button onClick={handleCopy} title="نسخ المحتوى" className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"><i className="fas fa-copy"></i></button>
            <button onClick={handlePaste} title="لصق من الحافظة" className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"><i className="fas fa-paste"></i></button>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-purple-600/50 text-white hover:bg-purple-600/70 flex items-center gap-2"
            >
                <i className="fas fa-upload"></i>
                رفع
            </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.html,.xml" />
      </div>
      <textarea
        id="rawInput"
        rows={10}
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder={placeholderText}
        className="flex-grow w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 dark:text-gray-200 resize-y font-mono text-sm"
      />
    </div>
  );
};

export default InputSection;
