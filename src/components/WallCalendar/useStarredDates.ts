import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'wallcal_starred_dates';

// Cycle of stamp colours for shift-clicking
export const STAMP_COLORS = [
  { bg: '#ef4444', label: 'Red' },
  { bg: '#f97316', label: 'Orange' },
  { bg: '#eab308', label: 'Yellow' },
  { bg: '#22c55e', label: 'Green' },
  { bg: '#3b82f6', label: 'Blue' },
  { bg: '#a855f7', label: 'Purple' },
];

function load(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function useStarredDates() {
  const [starred, setStarred] = useState<Record<string, string>>({});

  useEffect(() => {
    setStarred(load());
  }, []);

  // Shift-click a date to cycle through colours; clicking again on the last colour removes it
  const toggleStamp = useCallback((dateKey: string) => {
    setStarred(prev => {
      const current = prev[dateKey];
      const currentIdx = current ? STAMP_COLORS.findIndex(c => c.bg === current) : -1;
      const nextIdx = currentIdx + 1;

      const next = { ...prev };
      if (nextIdx >= STAMP_COLORS.length) {
        delete next[dateKey]; // Remove after cycling through all colours
      } else {
        next[dateKey] = STAMP_COLORS[nextIdx].bg;
      }
      save(next);
      return next;
    });
  }, []);

  const getStamp = useCallback((dateKey: string): string | undefined => starred[dateKey], [starred]);

  return { starred, toggleStamp, getStamp };
}
