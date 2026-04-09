import { useState, useEffect } from 'react';
import { ThemeConfig } from './types';

export const THEMES: ThemeConfig[] = [
  { name: 'Sky Blue', accent: '#1A9EE2', accentLight: '#DAEEF9', accentDark: '#0E6FA3' },
  { name: 'Coral', accent: '#E86D4A', accentLight: '#FCECE8', accentDark: '#C15233' },
  { name: 'Forest Green', accent: '#2D9E5F', accentLight: '#E3F2EB', accentDark: '#207847' },
  { name: 'Deep Purple', accent: '#7C5CBF', accentLight: '#EBE6F5', accentDark: '#5E429B' },
];

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(THEMES[0]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallcal_theme');
        if (stored) {
          const found = THEMES.find((t) => t.name === stored);
          if (found) setActiveTheme(found);
        }
      } catch (e) {}
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.style.setProperty('--cal-accent', activeTheme.accent);
    document.documentElement.style.setProperty('--cal-accent-light', activeTheme.accentLight);
    document.documentElement.style.setProperty('--cal-accent-dark', activeTheme.accentDark);
    document.documentElement.style.setProperty('--cal-wire', '#9CA3AF');
    try {
      localStorage.setItem('wallcal_theme', activeTheme.name);
    } catch (e) {}
  }, [activeTheme, isHydrated]);

  return {
    theme: activeTheme,
    setTheme: setActiveTheme,
    isHydrated,
  };
}
