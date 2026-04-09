import { useState, useEffect, useCallback } from 'react';
import { RecurringEvent } from './types';

const LS_KEY = 'wallcal_starred_dates';
const RECURRING_KEY = 'wallcal_recurring';

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

function loadRecurring(): Record<string, RecurringEvent> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(RECURRING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecurring(data: Record<string, RecurringEvent>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function useStarredDates() {
  const [starred, setStarred] = useState<Record<string, string>>({});
  const [recurring, setRecurring] = useState<Record<string, RecurringEvent>>({});

  useEffect(() => {
    setStarred(load());
    setRecurring(loadRecurring());
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

  const setStamp = useCallback((dateKey: string, color: string | null) => {
    setStarred(prev => {
      const next = { ...prev };
      if (color) {
        next[dateKey] = color;
      } else {
        delete next[dateKey];
      }
      save(next);
      return next;
    });
  }, []);

  const addRecurring = useCallback((rule: RecurringEvent) => {
    setRecurring(prev => {
      const next = { ...prev, [rule.baseDate]: rule };
      saveRecurring(next);
      return next;
    });
  }, []);

  const removeRecurring = useCallback((baseDate: string) => {
    setRecurring(prev => {
      const next = { ...prev };
      delete next[baseDate];
      saveRecurring(next);
      return next;
    });
  }, []);

  const getStamp = useCallback((dateKey: string): string | undefined => starred[dateKey], [starred]);

  return { starred, toggleStamp, setStamp, getStamp, recurring, addRecurring, removeRecurring };
}
