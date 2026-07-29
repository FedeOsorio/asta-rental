'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-xl border border-gray-800 w-max">
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
          language === 'es' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
          language === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        }`}
      >
        EN
      </button>
    </div>
  );
}
