'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNotes } from './useNotes';
import { useStoredRangeNotes } from './useStoredRangeNotes';
import {
  Plus, X, Circle, CheckCircle2, ChevronDown, ChevronRight,
  BookOpen, CalendarDays, Download, BarChart2,
} from 'lucide-react';
import { getMonthlyKey, getRangeKey } from './utils/dateHelpers';
import { format, isSameDay, endOfMonth, eachDayOfInterval, startOfMonth, isWeekend, isSameMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Note, StarredDate } from './types';
import { motion } from 'framer-motion';

interface NotesPanelProps {
  currentYear: number;
  currentMonth: number;
  selection: { start: Date | null; end: Date | null };
  averageMood: number;
  starred: Record<string, string>;
}

// ─── Shared editable note list ─────────────────────────────────────────────────
function NoteList({
  notes,
  addNote,
  updateNote,
  toggleNote,
  removeNote,
}: {
  notes: Note[];
  addNote: () => void;
  updateNote: (id: string, text: string) => void;
  toggleNote: (id: string) => void;
  removeNote: (id: string) => void;
}) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const focusNext = useCallback((currentId: string) => {
    const ids = notes.map(n => n.id);
    const idx = ids.indexOf(currentId);
    if (idx < ids.length - 1) {
      inputRefs.current.get(ids[idx + 1])?.focus();
    } else {
      // At last line — add a new one then focus it
      addNote();
    }
  }, [notes, addNote]);

  // When notes grow, focus the last input (triggered after addNote)
  const prevLen = useRef(notes.length);
  useEffect(() => {
    if (notes.length > prevLen.current) {
      const last = notes[notes.length - 1];
      if (last) setTimeout(() => inputRefs.current.get(last.id)?.focus(), 30);
    }
    prevLen.current = notes.length;
  }, [notes.length]);

  return (
    <div className="flex flex-col relative z-10 gap-0">
      {notes.map((note) => (
        <div key={note.id} className="group relative flex items-center border-b border-blue-200/40 hover:bg-black/5 transition-colors">
          {/* Checkbox */}
          <button
            onClick={() => toggleNote(note.id)}
            className="pl-2 pr-3 py-3 text-gray-400 hover:text-[var(--cal-accent)] transition-colors focus:outline-none flex-shrink-0"
          >
            {note.isCompleted
              ? <CheckCircle2 size={18} className="text-[var(--cal-accent)]" />
              : <Circle size={18} />}
          </button>

          {/* Text input */}
          <input
            ref={el => {
              if (el) inputRefs.current.set(note.id, el);
              else inputRefs.current.delete(note.id);
            }}
            type="text"
            value={note.text}
            onChange={e => updateNote(note.id, e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                focusNext(note.id);
              }
              if (e.key === 'Backspace' && note.text === '') {
                e.preventDefault();
                // Remove this line and move focus up
                const ids = notes.map(n => n.id);
                const idx = ids.indexOf(note.id);
                removeNote(note.id);
                if (idx > 0) {
                  setTimeout(() => inputRefs.current.get(ids[idx - 1])?.focus(), 30);
                }
              }
            }}
            placeholder="Click to type…"
            maxLength={200}
            className={cn(
              'flex-1 bg-transparent outline-none h-10 text-[15px] font-medium placeholder-transparent focus:placeholder-gray-400/50 pr-12 transition-all',
              note.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
            )}
          />

          {/* Hover actions */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
            <button onClick={() => removeNote(note.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Remove">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addNote}
        className="mt-3 flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-[var(--cal-accent)] transition-colors group px-3 py-2 rounded-md hover:bg-black/5 self-start w-max sm:ml-10"
      >
        <Plus size={16} className="transition-transform group-hover:rotate-90" />
        Add item
      </button>
    </div>
  );
}

// ─── Monthly Goal Tracker ──────────────────────────────────────────────────────
function GoalTracker({ year, month, starred }: { year: number; month: number; starred: Record<string, string> }) {
  const storageKey = `wallcal_goal_${year}-${month}`;
  const [goal, setGoal] = useState(() => {
    if (typeof window === 'undefined') return { label: '', target: 10 };
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : { label: '', target: 10 };
  });
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(goal));
  }, [goal, storageKey]);

  // Count green (#22c55e) stamps in this month
  const completedCount = useMemo(() => {
    let count = 0;
    for (const dateKey in starred) {
      if (starred[dateKey] === '#22c55e') {
        const d = parseISO(dateKey);
        if (d.getFullYear() === year && d.getMonth() === month) {
          count++;
        }
      }
    }
    return count;
  }, [starred, year, month]);

  const percentage = Math.round(Math.min((completedCount / goal.target) * 100, 100));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/40 border-b border-yellow-200/40">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/50 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Goal</span>
        {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <motion.circle 
                cx="32" cy="32" r={radius} fill="none" stroke="#22c55e" strokeWidth="4"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">{percentage}%</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-1.5">
            <input 
              type="text" 
              placeholder="Set a goal (e.g. Run 20 days)"
              className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 placeholder-gray-400"
              value={goal.label}
              onChange={e => setGoal({ ...goal, label: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1" max="31"
                className="w-8 bg-white/60 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-bold text-gray-600"
                value={goal.target}
                onChange={e => setGoal({ ...goal, target: parseInt(e.target.value) || 1 })}
              />
              <span className="text-[10px] text-gray-400 font-medium">target days</span>
              <span className="ml-auto text-[10px] font-bold text-green-600">{completedCount} done</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ notes, year, month, averageMood }: { notes: Note[]; year: number; month: number; averageMood: number }) {
  const today = new Date();
  const filled = notes.filter(n => n.text?.trim());
  const completed = filled.filter(n => n.isCompleted);
  const pct = filled.length ? Math.round((completed.length / filled.length) * 100) : 0;

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const daysLeft = isSameMonth(today, new Date(year, month))
    ? eachDayOfInterval({ start: today, end: monthEnd }).length - 1
    : eachDayOfInterval({ start: monthStart, end: monthEnd }).length;

  const workDaysLeft = isSameMonth(today, new Date(year, month))
    ? eachDayOfInterval({ start: today, end: monthEnd }).filter(d => !isWeekend(d)).length
    : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 border-t border-blue-100/60">
      <BarChart2 size={12} className="text-gray-400 flex-shrink-0" />
      <div className="flex items-center gap-1 text-[10px] text-gray-500">
        <span className="font-bold text-[var(--cal-accent)]">{completed.length}/{filled.length}</span>
        <span>done</span>
        {filled.length > 0 && (
          <span className="text-gray-400">({pct}%)</span>
        )}
      </div>
      {workDaysLeft > 0 && (
        <>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-500">
            <span className="font-bold">{workDaysLeft}</span> work days left
          </span>
        </>
      )}
      {daysLeft > 0 && isSameMonth(today, new Date(year, month)) && (
        <>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-500">
            <span className="font-bold text-gray-800">{daysLeft}</span> days left
          </span>
        </>
      )}
      {averageMood > 0 && (
        <>
          <span className="text-gray-300">·</span>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-700 ring-1 ring-amber-200">
            MOOD: {averageMood}/5
          </div>
        </>
      )}
    </div>
  );
}

// ─── Export helper ─────────────────────────────────────────────────────────────
function exportNotes(title: string, notes: Note[]) {
  const lines = notes
    .filter(n => n.text?.trim())
    .map(n => `${n.isCompleted ? '[x]' : '[ ]'} ${n.text}`);
  if (!lines.length) return;
  const content = `${title}\n${'─'.repeat(title.length)}\n${lines.join('\n')}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Month notes tab ────────────────────────────────────────────────────────────
function MonthNotesTab({ year, month, averageMood }: { year: number; month: number; averageMood: number }) {
  const storageKey = getMonthlyKey(year, month);
  const { notes, isLoaded, addNote, updateNote, toggleNote, removeNote } = useNotes(storageKey);
  const title = format(new Date(year, month), 'MMMM yyyy') + ' Notes';
  const lastCompletedRef = useRef<boolean>(false);
  const triggerMonthRef = useRef<string>('');

  useEffect(() => {
    if (!isLoaded || notes.length === 0) return;
    
    const filled = notes.filter(n => n.text?.trim());
    if (filled.length === 0) return;
    
    const allCompleted = filled.every(n => n.isCompleted);
    const monthKey = `${year}-${month}`;

    if (allCompleted && !lastCompletedRef.current && triggerMonthRef.current !== monthKey) {
      // Trigger confetti
      import('https://esm.sh/canvas-confetti').then(confetti => {
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--cal-accent').trim();
        const accentLight = getComputedStyle(document.documentElement).getPropertyValue('--cal-accent-light').trim();
        
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [accent || '#1A9EE2', '#FFFFFF', accentLight || '#DAEEF9']
        });
      });
      triggerMonthRef.current = monthKey;
    }
    
    lastCompletedRef.current = allCompleted;
  }, [notes, isLoaded, year, month]);

  if (!isLoaded) return <div className="animate-pulse h-40 bg-yellow-50/60 rounded-lg mx-4 mt-4" />;

  return (
    <>
      <div className="flex flex-col relative px-2 sm:px-4 py-2 flex-1">
        {/* Red margin lines */}
        <div className="absolute top-0 bottom-0 left-8 sm:left-10 w-px bg-red-300/60 z-0 pointer-events-none hidden sm:block" />
        <div className="absolute top-0 bottom-0 left-9 sm:left-11 w-px bg-red-300/60 z-0 pointer-events-none hidden sm:block" />
        <NoteList notes={notes} addNote={addNote} updateNote={updateNote} toggleNote={toggleNote} removeNote={removeNote} />
      </div>
      <StatsBar notes={notes} year={year} month={month} averageMood={averageMood} />
      <div className="flex justify-end px-4 py-2 border-t border-blue-100/50">
        <button
          onClick={() => exportNotes(title, notes)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-[var(--cal-accent)] transition-colors"
        >
          <Download size={11} />
          Export
        </button>
      </div>
    </>
  );
}

// ─── Inline editable range note editor (used in accordion) ────────────────────
function RangeNoteEditor({ rangeKey, onSave }: { rangeKey: string; onSave: () => void }) {
  const { notes, isLoaded, addNote, updateNote, toggleNote, removeNote } = useNotes(rangeKey);

  const wrapped = {
    add: () => { addNote(); onSave(); },
    update: (id: string, text: string) => { updateNote(id, text); onSave(); },
    toggle: (id: string) => { toggleNote(id); onSave(); },
    remove: (id: string) => { removeNote(id); onSave(); },
  };

  if (!isLoaded) return <div className="h-12 animate-pulse bg-gray-50 rounded" />;
  return <NoteList notes={notes} addNote={wrapped.add} updateNote={wrapped.update} toggleNote={wrapped.toggle} removeNote={wrapped.remove} />;
}

// ─── Range notes tab ────────────────────────────────────────────────────────────
function RangeNotesTab({
  year, month, activeRangeKey,
}: {
  year: number; month: number; activeRangeKey: string | null;
}) {
  const { rangeNotes, refresh } = useStoredRangeNotes(year, month);
  const today = new Date();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(activeRangeKey ? [activeRangeKey] : [])
  );

  // Auto-expand when active range key changes
  useEffect(() => {
    if (activeRangeKey) setExpandedKeys(prev => new Set([...prev, activeRangeKey]));
  }, [activeRangeKey]);

  const toggle = (key: string) => setExpandedKeys(prev => {
    const n = new Set(prev);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  });

  if (rangeNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
        <CalendarDays size={32} className="text-gray-300" />
        <p className="text-sm text-gray-400/80 italic">No date-range notes this month.</p>
        <p className="text-xs text-gray-400/60">Select a range on the calendar to add notes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-3 overflow-y-auto">
      {rangeNotes.map(rn => {
        const isActive = rn.rangeKey === activeRangeKey;
        const containsToday = today >= rn.start && today <= rn.end;
        const isSingle = isSameDay(rn.start, rn.end);
        const label = isSingle
          ? format(rn.start, 'MMM d, yyyy')
          : `${format(rn.start, 'MMM d')} – ${format(rn.end, 'MMM d, yyyy')}`;
        const isExpanded = expandedKeys.has(rn.rangeKey);
        const filled = rn.notes.filter(n => n.text?.trim());
        const done = filled.filter(n => n.isCompleted).length;

        return (
          <div key={rn.rangeKey} className={cn(
            'rounded-lg border transition-all',
            isActive ? 'border-[var(--cal-accent)] bg-[var(--cal-accent-light)]'
              : containsToday ? 'border-blue-200 bg-blue-50/60'
              : 'border-gray-200 bg-white/70'
          )}>
            <button onClick={() => toggle(rn.rangeKey)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
              {isExpanded
                ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
              <span className={cn('text-xs font-bold flex-1 truncate', isActive ? 'text-[var(--cal-accent)]' : 'text-gray-700')}>
                {label}
              </span>
              {containsToday && <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">TODAY</span>}
              {filled.length > 0 && <span className="text-[9px] text-gray-400 flex-shrink-0">{done}/{filled.length}</span>}
            </button>

            {isExpanded && (
              <div className="border-t border-gray-200/60 px-3 py-2">
                <RangeNoteEditor rangeKey={rn.rangeKey} onSave={refresh} />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => exportNotes(label, rn.notes)}
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[var(--cal-accent)] transition-colors"
                  >
                    <Download size={10} />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Active selection card (shown at top of Ranges tab) ───────────────────────
function ActiveRangeCard({ selection }: { selection: { start: Date; end: Date | null } }) {
  const end = selection.end ?? selection.start;
  const storageKey = getRangeKey(selection.start, end);
  const isSingle = isSameDay(selection.start, end);
  const label = isSingle
    ? format(selection.start, 'MMM d, yyyy')
    : `${format(selection.start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;

  const { notes, isLoaded, addNote, updateNote, toggleNote, removeNote } = useNotes(storageKey);

  if (!isLoaded) return <div className="animate-pulse h-16 bg-yellow-50/60 rounded-lg mx-3 mt-2" />;

  return (
    <div className="mx-3 mt-3 rounded-lg border-2 border-[var(--cal-accent)] bg-[var(--cal-accent-light)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--cal-accent)]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--cal-accent)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cal-accent)]">{label}</span>
        </div>
        <button
          onClick={() => exportNotes(label, notes)}
          className="flex items-center gap-1 text-[9px] font-bold text-[var(--cal-accent)]/70 hover:text-[var(--cal-accent)] transition-colors"
        >
          <Download size={9} />
          Export
        </button>
      </div>
      <div className="px-2 py-1">
        <NoteList notes={notes} addNote={addNote} updateNote={updateNote} toggleNote={toggleNote} removeNote={removeNote} />
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function NotesPanel({ currentYear, currentMonth, selection, averageMood, starred }: NotesPanelProps) {
  const hasActiveSelection = !!selection.start;
  const hasCompleteSelection = !!(selection.start && selection.end);

  const activeRangeKey = selection.start && selection.end
    ? getRangeKey(selection.start, selection.end)
    : selection.start
    ? getRangeKey(selection.start, selection.start)
    : null;

  const monthName = format(new Date(currentYear, currentMonth), 'MMMM yyyy');

  const [tab, setTab] = useState<'month' | 'ranges'>('month');

  // Switch to ranges tab when a selection is made
  useEffect(() => {
    if (hasActiveSelection) setTab('ranges');
  }, [hasActiveSelection]);

  // Switch back to month tab when selection is cleared
  useEffect(() => {
    if (!hasActiveSelection) setTab('month');
  }, [hasActiveSelection]);

  const headerTitle = hasCompleteSelection
    ? `${format(selection.start!, 'MMM d')} – ${format(selection.end!, 'MMM d')}`
    : selection.start
    ? format(selection.start, 'MMM d, yyyy')
    : `Notes — ${monthName}`;

  return (
    <div className="flex flex-col h-full lg:pr-8 pb-8 lg:pb-0 relative">
      <div className="relative bg-[#FEFCE8] border border-yellow-200/60 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] flex flex-col h-full overflow-hidden">
        
        {/* Monthly Goal */}
        <GoalTracker year={currentYear} month={currentMonth} starred={starred} />

        {/* Push Pin */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 w-4 h-4 rounded-full bg-red-400 shadow-[2px_4px_6px_rgba(0,0,0,0.3)] border-2 border-red-500/80 after:content-[''] after:absolute after:-bottom-2 after:left-1.5 after:w-0.5 after:h-2 after:bg-gray-400 after:-z-10" />

        {/* Header */}
        <div className="pt-8 pb-3 px-6 border-b-2 border-blue-200/50 relative">
          <h3 className={cn(
            'text-[11px] uppercase tracking-widest font-bold text-center leading-tight truncate',
            hasActiveSelection ? 'text-[var(--cal-accent)]' : 'text-gray-800'
          )}>
            {headerTitle}
          </h3>

          {/* Tabs */}
          <div className="flex justify-center gap-1 mt-2">
            {[
              { key: 'month',  icon: <BookOpen size={10} />,     label: 'Month' },
              { key: 'ranges', icon: <CalendarDays size={10} />, label: 'Ranges' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as 'month' | 'ranges')}
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all',
                  tab === t.key
                    ? 'bg-[var(--cal-accent)] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {tab === 'month' ? (
            <MonthNotesTab year={currentYear} month={currentMonth} averageMood={averageMood} />
          ) : (
            <>
              {hasActiveSelection && selection.start && (
                <ActiveRangeCard selection={{ start: selection.start, end: selection.end }} />
              )}
              {hasActiveSelection && (
                <p className="px-4 pt-3 pb-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Saved ranges this month
                </p>
              )}
              <RangeNotesTab
                year={currentYear}
                month={currentMonth}
                activeRangeKey={activeRangeKey}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
