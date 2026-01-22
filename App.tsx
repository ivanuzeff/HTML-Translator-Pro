
import React, { useState, useCallback, useMemo } from 'react';
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const updateUnit = (id: number, updates: Partial<TranslationUnit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const handleTranslate = async (id: number) => {
    const unit = units.find(u => u.id === id);
    if (!unit || !unit.inputHtml.trim()) return;

    updateUnit(id, { isLoading: true, error: null, isSuccess: false });

    try {
      const translated = await translateHtml(unit.inputHtml, targetLanguage);
      updateUnit(id, { outputHtml: translated, isSuccess: true });
    } catch (err: any) {
      updateUnit(id, { error: err.message || 'Error', isSuccess: false });
    } finally {
      updateUnit(id, { isLoading: false });
    }
  };

  const handleCopy = (id: number) => {
    const unit = units.find(u => u.id === id);
    if (!unit?.outputHtml) return;
    navigator.clipboard.writeText(unit.outputHtml);
    // Visual feedback handled by state isn't strictly necessary per pair if we just want it fast, 
    // but we can use isSuccess or a temporary state. Let's keep it simple.
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
      <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-blue-600"></i>
            HTML Bulk Translator
          </h1>
          <p className="text-slate-500 text-sm">Translate up to 20 blocks in parallel</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Target:</label>
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

      <div className="space-y-4">
        {units.map((unit) => (
          <div 
            key={unit.id}
            className={`group bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
              expandedId === unit.id 
                ? 'shadow-xl border-blue-200 ring-2 ring-blue-50' 
                : 'shadow-sm border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Header / Info bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  #{unit.id + 1}
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
                    {unit.isLoading ? 'Translating...' : unit.isSuccess ? 'Completed' : unit.error ? 'Error' : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleTranslate(unit.id); }}
                  disabled={unit.isLoading || !unit.inputHtml.trim()}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors disabled:opacity-30"
                >
                  <i className="fa-solid fa-play mr-1.5"></i> Translate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(unit.id); }}
                  disabled={!unit.outputHtml}
                  className="text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded transition-colors disabled:opacity-30"
                >
                  <i className="fa-solid fa-copy mr-1.5"></i> Copy
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === unit.id ? null : unit.id)}
                  className="text-slate-400 hover:text-slate-600 p-1.5"
                >
                  <i className={`fa-solid ${expandedId === unit.id ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
                </button>
              </div>
            </div>

            {/* Editors Area */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 transition-all duration-500 ease-in-out"
              style={{ height: expandedId === unit.id ? '500px' : '120px' }}
            >
              <div className="relative h-full">
                <textarea
                  value={unit.inputHtml}
                  onChange={(e) => updateUnit(unit.id, { inputHtml: e.target.value, isSuccess: false })}
                  onFocus={() => setExpandedId(unit.id)}
                  className="w-full h-full p-4 font-mono text-xs text-slate-600 resize-none outline-none focus:bg-blue-50/10"
                  placeholder="Enter HTML..."
                />
              </div>
              <div className="relative h-full bg-slate-50/30">
                <textarea
                  readOnly
                  value={unit.outputHtml}
                  onFocus={() => setExpandedId(unit.id)}
                  className="w-full h-full p-4 font-mono text-xs text-slate-700 resize-none outline-none bg-transparent"
                  placeholder="Result..."
                />
                {unit.error && (
                  <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center p-4">
                    <p className="text-red-600 text-xs font-bold text-center">{unit.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-12 text-center text-slate-400 text-xs pb-10">
        Bulk Translation Interface &middot; Parallel Requests &middot; Powered by Gemini 3 Flash
      </footer>
    </div>
  );
};

export default App;
