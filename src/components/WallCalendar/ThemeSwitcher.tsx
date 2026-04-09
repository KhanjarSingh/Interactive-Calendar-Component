import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useTheme, THEMES } from './useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
        aria-label="Change theme"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Select Theme
            </p>
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setTheme(t);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition-colors hover:bg-gray-50 ${
                  theme.name === t.name ? 'bg-gray-50' : ''
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shadow-inner"
                  style={{ backgroundColor: t.accent }}
                />
                <span className="text-sm font-medium text-gray-700">{t.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
