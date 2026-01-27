
import React, { useState } from 'react';
import { TargetLanguage, TranslationUnit } from './types';
import { translateHtml } from './services/geminiService';

const UNIT_COUNT = 20;

const App: React.FC = () => {
  const [units, setUnits] = useState<TranslationUnit[]>(
    Array.from({ length: UNIT_COUNT }, (_, i) => ({
      id: i,
      inputHtml: '',
      outputHtml: '',
      isLoading: false,
      isSuccess: false,
      error: null,
    }))
  );
  
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.RUSSIAN);

  const updateUnit = (id: number, updates: Partial<TranslationUnit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const handleTranslate = async (id: number) => {
    const unit = units.find(u => u.id === id);
    if (!unit || !unit.inputHtml.trim()) return;

    updateUnit(id, { isLoading: true, error: null, isSuccess: false });

    try {
      const translated = await translateHtml(unit.inputHtml, targetLanguage);
      updateUnit(id, { 
        outputHtml: translated, 
        isSuccess: true 
      });
    } catch (err: any) {
      updateUnit(id, { error: err.message || 'Error', isSuccess: false });
    } finally {
      updateUnit(id, { isLoading: false });
    }
  };

  const handleCopy = (id: number) => {
    const unit = units.find(u => u.id === id);
    if (!unit || !unit.outputHtml) return;
    navigator.clipboard.writeText(unit.outputHtml);
  };

  const handleTranslateAll = async () => {
    units.forEach(unit => {
      if (unit.inputHtml.trim() && !unit.isLoading) {
        handleTranslate(unit.id);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-50">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-code text-blue-600"></i>
            Bulk HTML Translator
          </h1>
          <p className="text-slate-500 text-sm">20 blocks with formatting preservation</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Translate to:</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
              className="bg-transparent text-slate-700 text-sm font-semibold p-1.5 outline-none cursor-pointer"
            >
              {Object.values(TargetLanguage).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleTranslateAll}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all shadow-md shadow-blue-100 flex items-center gap-2"
          >
            <i className="fa-solid fa-bolt"></i>
            Translate All
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {units.map((unit) => (
          <div 
            key={unit.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Control Bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  UNIT #{unit.id + 1}
                </span>
                <div className="flex items-center gap-2">
                  {unit.isLoading ? (
                    <i className="fa-solid fa-circle-notch animate-spin text-blue-500 text-sm"></i>
                  ) : unit.isSuccess ? (
                    <i className="fa-solid fa-circle-check text-green-500 text-sm"></i>
                  ) : unit.error ? (
                    <i className="fa-solid fa-circle-exclamation text-red-500 text-sm"></i>
                  ) : (
                    <i className="fa-solid fa-circle text-slate-200 text-xs"></i>
                  )}
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {unit.isLoading ? 'Translating...' : unit.isSuccess ? 'Done' : unit.error ? 'Error' : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTranslate(unit.id)}
                  disabled={unit.isLoading || !unit.inputHtml.trim()}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors disabled:opacity-30"
                >
                  <i className="fa-solid fa-play mr-1.5"></i> Translate
                </button>
                <button
                  onClick={() => handleCopy(unit.id)}
                  disabled={!unit.outputHtml}
                  className="text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded transition-colors disabled:opacity-30"
                >
                  <i className="fa-solid fa-copy mr-1.5"></i> Copy Result
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100 h-48">
              <div className="h-full relative">
                <textarea
                  value={unit.inputHtml}
                  onChange={(e) => updateUnit(unit.id, { inputHtml: e.target.value, isSuccess: false })}
                  className="w-full h-full p-4 font-mono text-xs text-slate-700 bg-transparent resize-none outline-none focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="Paste HTML to translate..."
                />
              </div>
              <div className="h-full relative">
                <textarea
                  readOnly
                  value={unit.outputHtml}
                  className="w-full h-full p-4 font-mono text-xs text-slate-700 bg-transparent resize-none outline-none"
                  placeholder="Translated HTML appears here..."
                />
                {unit.error && (
                  <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center p-4">
                    <p className="text-red-600 text-xs font-bold text-center">{unit.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-12 text-center text-slate-400 text-xs pb-10">
        Strict Formatting Preservation &middot; Gemini 3 Flash &middot; Parallel Requests
      </footer>
    </div>
  );
};

export default App;
