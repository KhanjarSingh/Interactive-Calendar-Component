import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useTheme, THEMES } from './useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme, compactMode, setCompactMode } = useTheme();
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
            <div className="h-px bg-gray-100 my-1 w-full" />
            <button
              onClick={() => setCompactMode(!compactMode)}
              className="flex items-center justify-between w-full p-2 rounded-lg transition-colors hover:bg-gray-50 mt-1"
            >
              <span className="text-sm font-medium text-gray-700">Compact Mobile Mode</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${compactMode ? 'bg-[var(--cal-accent)]' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${compactMode ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
