'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, FileText, CheckCircle2, Circle, X } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Note } from './types';
import { cn } from '@/lib/utils';

interface SearchResult {
  text: string;
  isCompleted: boolean;
  year: number;
  month: number;
  label: string;
  sourceKey: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (year: number, month: number) => void;
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Indexing logic
  const index = useMemo(() => {
    if (!isOpen) return [];
    const allNotes: SearchResult[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('wallcal_notes_')) {
        try {
          const raw = localStorage.getItem(key);
          const notes: Note[] = raw ? JSON.parse(raw) : [];
          
          // Parse metadata from key
          // wallcal_notes_general_2026-04
          // wallcal_notes_range_2026-03-29_2026-04-05
          let year: number, month: number, label: string;
          
          if (key.includes('general')) {
            const parts = key.split('_');
            const [y, m] = parts[parts.length - 1].split('-').map(Number);
            year = y;
            month = m;
            label = format(new Date(year, month), 'MMMM yyyy');
          } else {
            const parts = key.split('_');
            const startStr = parts[parts.length - 2];
            const endStr = parts[parts.length - 1];
            const start = parseISO(startStr);
            const end = parseISO(endStr);
            
            if (!isValid(start)) continue;
            
            year = start.getFullYear();
            month = start.getMonth();
            label = `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
          }

          notes.forEach(note => {
            if (note.text.trim()) {
              allNotes.push({
                text: note.text,
                isCompleted: !!note.isCompleted,
                year,
                month,
                label,
                sourceKey: key
              });
            }
          });
        } catch (e) {
          console.error('Failed to parse notes for key:', key, e);
        }
      }
    }
    return allNotes;
  }, [isOpen]);

  // 2. Search / Filtering
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = index.filter(n => 
        n.text.toLowerCase().includes(q) || 
        n.label.toLowerCase().includes(q)
      );
      setResults(filtered);
      setSelectedIndex(0);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, index]);

  // 3. Focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  // 4. Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        const item = results[selectedIndex];
        onNavigate(item.year, item.month);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!groups[r.label]) groups[r.label] = [];
      groups[r.label].push(r);
    });
    return groups;
  }, [results]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Area */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <Search className="text-gray-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notes, months, ranges..."
                className="flex-1 bg-transparent outline-none text-gray-800 text-lg placeholder-gray-400"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              )}
              <div className="text-[10px] font-bold text-gray-300 border border-gray-200 px-1.5 py-0.5 rounded bg-white select-none">
                ESC
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
              {!query ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Calendar size={48} className="opacity-20" />
                  <p className="text-sm font-medium">Type to search across all your notes...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <FileText size={48} className="opacity-20" />
                  <p className="text-sm font-medium">No notes found for "{query}"</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-2">
                  {Object.entries(groupedResults).map(([label, items]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <h4 className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 select-none">
                        {label}
                      </h4>
                      {items.map((item) => {
                        const indexInResults = results.indexOf(item);
                        const isActive = indexInResults === selectedIndex;
                        return (
                          <div
                            key={`${item.sourceKey}-${item.text}`}
                            onClick={() => {
                              onNavigate(item.year, item.month);
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(indexInResults)}
                            className={cn(
                              "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors",
                              isActive ? "bg-[var(--cal-accent)] text-white" : "hover:bg-gray-50"
                            )}
                          >
                            <div className={cn(
                              "flex-shrink-0",
                              isActive ? "text-white/80" : "text-gray-400"
                            )}>
                              {item.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                isActive ? "text-white" : "text-gray-800"
                              )}>
                                {item.text}
                              </p>
                            </div>
                            {isActive && (
                              <div className="text-[10px] font-bold text-white/60 bg-white/20 px-2 py-0.5 rounded">
                                Enter to go
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/30 text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><kbd className="bg-gray-200 rounded px-1 text-[9px]">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-gray-200 rounded px-1 text-[9px]">ENTER</kbd> select</span>
              </div>
              <div>{results.length > 0 ? `${results.length} results found` : index.length + ' notes indexed'}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
