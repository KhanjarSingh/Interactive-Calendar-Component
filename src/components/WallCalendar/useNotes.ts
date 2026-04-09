import { useState, useCallback, useEffect } from 'react';
import { Note } from './types';

const getStoredNotes = (key: string): Note[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(`wallcal_notes_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse notes from localStorage', e);
    return [];
  }
};

const setStoredNotes = (key: string, notes: Note[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`wallcal_notes_${key}`, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
};

export function useNotes(storageKey: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setNotes(getStoredNotes(storageKey));
    setIsLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    // If no notes, prefill 5 empty lines to look like ruled paper
    if (isLoaded && notes.length === 0) {
       const initialNotes = Array.from({length: 5}).map(() => ({
         id: crypto.randomUUID(),
         text: '',
         createdAt: new Date().toISOString(),
         isCompleted: false
       }));
       setNotes(initialNotes);
    }
  }, [isLoaded, notes.length]);

  const addNote = useCallback(() => {
    setNotes((prev) => {
      const newNotes = [
        ...prev,
        { id: crypto.randomUUID(), text: '', createdAt: new Date().toISOString(), isCompleted: false },
      ];
      // Only save if there are actual contents being added
      setStoredNotes(storageKey, newNotes);
      return newNotes;
    });
  }, [storageKey]);

  const updateNote = useCallback((id: string, text: string) => {
    setNotes((prev) => {
      const newNotes = prev.map((n) => (n.id === id ? { ...n, text } : n));
      setStoredNotes(storageKey, newNotes);
      return newNotes;
    });
  }, [storageKey]);

  const toggleNote = useCallback((id: string) => {
    setNotes((prev) => {
      const newNotes = prev.map((n) => (n.id === id ? { ...n, isCompleted: !n.isCompleted } : n));
      setStoredNotes(storageKey, newNotes);
      return newNotes;
    });
  }, [storageKey]);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => {
      const newNotes = prev.filter((n) => n.id !== id);
      setStoredNotes(storageKey, newNotes);
      return newNotes;
    });
  }, [storageKey]);

  return { notes, isLoaded, addNote, updateNote, toggleNote, removeNote };
}
