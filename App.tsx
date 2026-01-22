
import React, { useState, useCallback } from 'react';
import { TargetLanguage } from './types';
import { translateHtml } from './services/geminiService';

const App: React.FC = () => {
  const [inputHtml, setInputHtml] = useState<string>('');
  const [outputHtml, setOutputHtml] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.RUSSIAN);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!inputHtml.trim()) return;

    setIsLoading(true);
    setError(null);
    setCopySuccess(false);

    try {
      const translated = await translateHtml(inputHtml, targetLanguage);
      setOutputHtml(translated);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!outputHtml) return;
    
    navigator.clipboard.writeText(outputHtml).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [outputHtml]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 flex items-center justify-center gap-3">
          <i className="fa-solid fa-code text-blue-600"></i>
          HTML Translator Pro
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Translate web content while keeping your HTML structure, classes, and formatting perfectly intact.
        </p>
      </header>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="language-select" className="text-sm font-semibold text-slate-600 whitespace-nowrap">
              Translate to:
            </label>
            <select
              id="language-select"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all"
            >
              {Object.values(TargetLanguage).map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputHtml.trim()}
            className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white transition-all transform active:scale-95 w-full sm:w-auto ${
              isLoading || !inputHtml.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
            }`}
          >
            {isLoading ? (
              <i className="fa-solid fa-spinner animate-spin"></i>
            ) : (
              <i className="fa-solid fa-language"></i>
            )}
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[500px]">
          {/* Input Area */}
          <div className="flex flex-col">
            <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Source HTML (English)
            </div>
            <textarea
              className="flex-1 p-6 font-mono text-sm text-slate-700 bg-white resize-none outline-none focus:bg-blue-50/10 transition-colors"
              placeholder="Paste your HTML code here..."
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
            ></textarea>
          </div>

          {/* Output Area */}
          <div className="flex flex-col relative">
            <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Translated Result ({targetLanguage})
              </span>
              {outputHtml && (
                <button
                  onClick={handleCopy}
                  className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                    copySuccess ? 'text-green-600 bg-green-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                  {copySuccess ? 'Copied!' : 'Copy Code'}
                </button>
              )}
            </div>
            <textarea
              readOnly
              className="flex-1 p-6 font-mono text-sm text-slate-700 bg-slate-50/30 resize-none outline-none"
              placeholder="Resulting HTML will appear here..."
              value={outputHtml}
            ></textarea>
            
            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2">
                <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-sm">
        Built with Gemini AI &middot; Source: English
      </footer>
    </div>
  );
};

export default App;
