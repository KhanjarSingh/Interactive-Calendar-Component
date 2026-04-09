import { useState, useEffect, useCallback } from 'react';
import { Note } from './types';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, isBefore, isAfter } from 'date-fns';

export interface StoredRangeNote {
  rangeKey: string; // "range_YYYY-MM-DD_YYYY-MM-DD"
  start: Date;
  end: Date;
  notes: Note[];
}

function readAllRangeNotes(year: number, month: number): StoredRangeNote[] {
  if (typeof window === 'undefined') return [];

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const today = new Date();
  const results: StoredRangeNote[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const lsKey = localStorage.key(i);
    if (!lsKey?.startsWith('wallcal_notes_range_')) continue;

    // Key format: wallcal_notes_range_YYYY-MM-DD_YYYY-MM-DD
    const withoutPrefix = lsKey.replace('wallcal_notes_range_', '');
    const match = withoutPrefix.match(/^(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})$/);
    if (!match) continue;

    try {
      const start = parseISO(match[1]);
      const end = parseISO(match[2]);

      // Keep ranges that overlap with this month
      const overlaps =
        isWithinInterval(start, { start: monthStart, end: monthEnd }) ||
        isWithinInterval(end, { start: monthStart, end: monthEnd }) ||
        (isBefore(start, monthStart) && isAfter(end, monthEnd));

      if (!overlaps) continue;

      const data = localStorage.getItem(lsKey);
      const notes: Note[] = data ? JSON.parse(data) : [];
      // Skip ranges with no actual content
      if (!notes.some((n) => n.text?.trim())) continue;

      results.push({ rangeKey: `range_${match[1]}_${match[2]}`, start, end, notes });
    } catch {
      // malformed entry — skip
    }
  }

  // Sort: ranges containing today first, then by closeness to today
  results.sort((a, b) => {
    const aContains = today >= a.start && today <= a.end;
    const bContains = today >= b.start && today <= b.end;
    if (aContains && !bContains) return -1;
    if (!aContains && bContains) return 1;

    const distA = Math.min(
      Math.abs(today.getTime() - a.start.getTime()),
      Math.abs(today.getTime() - a.end.getTime())
    );
    const distB = Math.min(
      Math.abs(today.getTime() - b.start.getTime()),
      Math.abs(today.getTime() - b.end.getTime())
    );
    return distA - distB;
  });

  return results;
}

export function useStoredRangeNotes(year: number, month: number) {
  const [rangeNotes, setRangeNotes] = useState<StoredRangeNote[]>([]);

  const refresh = useCallback(() => {
    setRangeNotes(readAllRangeNotes(year, month));
  }, [year, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rangeNotes, refresh };
}
