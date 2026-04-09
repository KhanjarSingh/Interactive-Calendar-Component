'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface MoodData {
  dateKey: string; // YYYY-MM-DD
  score: number;   // 1-5
}

const STORAGE_PREFIX = 'wallcal_mood_';

export function useMoodData(year: number, month: number) {
  const [moods, setMoods] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all moods for the current month
  useEffect(() => {
    const loadMoods = () => {
      const monthStart = startOfMonth(new Date(year, month));
      const monthEnd = endOfMonth(new Date(year, month));
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const newMoods: Record<string, number> = {};
      days.forEach(day => {
        const key = `${STORAGE_PREFIX}${format(day, 'yyyy-MM-dd')}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          newMoods[format(day, 'yyyy-MM-dd')] = parseInt(stored, 10);
        }
      });
      
      setMoods(newMoods);
      setIsLoaded(true);
    };

    loadMoods();
    
    // Listen for storage changes (for sync across multiple instances)
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(STORAGE_PREFIX)) {
        loadMoods();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [year, month]);

  const setMood = (date: Date, score: number) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const storageKey = `${STORAGE_PREFIX}${dateKey}`;
    
    if (score === moods[dateKey]) {
      // Toggle off if same score
      localStorage.removeItem(storageKey);
      setMoods(prev => {
        const { [dateKey]: _, ...rest } = prev;
        return rest;
      });
    } else {
      localStorage.setItem(storageKey, score.toString());
      setMoods(prev => ({ ...prev, [dateKey]: score }));
    }
  };

  const averageMood = useMemo(() => {
    const scores = Object.values(moods);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }, [moods]);

  return {
    moods,
    setMood,
    averageMood,
    isLoaded
  };
}
