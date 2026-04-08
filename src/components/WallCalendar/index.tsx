'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { NotesPanel } from './NotesPanel';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MiniMonthPreview } from './MiniMonthPreview';
import { YearProgressBar } from './YearProgressBar';
import { useCalendarState } from './useCalendarState';
import { useStarredDates } from './useStarredDates';
import { format } from 'date-fns';

// ─── Keyboard shortcut hint bar ────────────────────────────────────────────────
function ShortcutHint() {
  return (
    <div className="hidden lg:flex items-center justify-center gap-4 py-1.5 bg-gray-50/80 border-t border-gray-100 text-[9px] text-gray-400 font-medium select-none flex-wrap px-4">
      <span><kbd className="bg-gray-200 rounded px-1 py-0.5 font-mono">←</kbd><kbd className="bg-gray-200 rounded px-1 py-0.5 font-mono ml-0.5">→</kbd> navigate months</span>
      <span className="text-gray-300">·</span>
      <span><kbd className="bg-gray-200 rounded px-1 py-0.5 font-mono">Esc</kbd> clear selection</span>
      <span className="text-gray-300">·</span>
      <span><kbd className="bg-gray-200 rounded px-1 py-0.5 font-mono">Shift</kbd>+click stamp a date</span>
      <span className="text-gray-300">·</span>
      <span><kbd className="bg-gray-200 rounded px-1 py-0.5 font-mono">⌘/Ctrl</kbd>+click copy date</span>
    </div>
  );
}

export default function WallCalendar() {
  const { state, dispatch } = useCalendarState();
  const { getStamp, toggleStamp } = useStarredDates();
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // ── Navigation handlers ──────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    setDirection('next');
    dispatch({ type: 'NEXT_MONTH' });
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    setDirection('prev');
    dispatch({ type: 'PREV_MONTH' });
  }, [dispatch]);

  const handleToday = useCallback(() => {
    const today = new Date();
    const isAlreadyToday =
      state.currentYear === today.getFullYear() &&
      state.currentMonth === today.getMonth();
    if (isAlreadyToday) return;
    const isForward =
      today.getFullYear() > state.currentYear ||
      (today.getFullYear() === state.currentYear && today.getMonth() > state.currentMonth);
    setDirection(isForward ? 'next' : 'prev');
    dispatch({ type: 'GO_TO_TODAY' });
  }, [dispatch, state.currentYear, state.currentMonth]);

  const handleDateClick = useCallback((d: Date) => {
    dispatch({ type: 'CLICK_DATE', payload: d });
  }, [dispatch]);

  const handleDateHover = useCallback((d: Date) => {
    dispatch({ type: 'SET_HOVER_DATE', payload: d });
  }, [dispatch]);

  const handleClearHover = useCallback(() => {
    dispatch({ type: 'CLEAR_HOVER' });
  }, [dispatch]);

  const handleClearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [dispatch]);

  const handleShiftClick = useCallback((d: Date) => {
    toggleStamp(format(d, 'yyyy-MM-dd'));
  }, [toggleStamp]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't fire when typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handlePrev(); }
      if (e.key === 'Escape')     { e.preventDefault(); handleClearSelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') { e.preventDefault(); handleToday(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, handleClearSelection, handleToday]);

  // ── Mini-month previews ───────────────────────────────────────────────────────
  const nextMonthNum  = state.currentMonth === 11 ? 0  : state.currentMonth + 1;
  const nextMonthYear = state.currentMonth === 11 ? state.currentYear + 1 : state.currentYear;
  const prevMonthNum  = state.currentMonth === 0  ? 11 : state.currentMonth - 1;
  const prevMonthYear = state.currentMonth === 0  ? state.currentYear - 1 : state.currentYear;

  const contentKey = `${state.currentYear}-${state.currentMonth}`;

  // ── Flip animation ────────────────────────────────────────────────────────────
  const flipVariants: Variants = {
    initial: (dir: 'next' | 'prev') => ({
      rotateX: dir === 'next' ? -90 : 90,
      opacity: 0.2,
      scale: 0.98,
    }),
    animate: {
      rotateX: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, type: 'spring', bounce: 0.1 },
    },
    exit: (dir: 'next' | 'prev') => ({
      rotateX: dir === 'next' ? 90 : -90,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white rounded-xl shadow-[0_4px_40px_rgba(0,0,0,0.10)] relative flex flex-col font-sans overflow-hidden border border-gray-100">

      {/* Theme switcher */}
      <div className="absolute top-4 right-4 z-[60]">
        <ThemeSwitcher />
      </div>

      {/* Header with hero image / seasonal banner */}
      <CalendarHeader
        currentYear={state.currentYear}
        currentMonth={state.currentMonth}
        onNext={handleNext}
        onPrev={handlePrev}
        onToday={handleToday}
      />

      {/* Year progress bar */}
      <YearProgressBar />

      {/* 3-D page-flip container */}
      <div style={{ perspective: '2000px' }} className="relative bg-white w-full z-10 flex-1 overflow-hidden min-h-[500px]">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={contentKey}
            custom={direction}
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: 'top center', backfaceVisibility: 'hidden' }}
            className="flex w-full"
          >
            <div className="flex flex-col lg:flex-row p-6 lg:p-8 pt-6 w-full gap-8 lg:gap-0 min-h-[500px]">

              {/* Left: Notes panel */}
              <div className="w-full lg:w-[40%] flex-shrink-0 relative z-20">
                <NotesPanel
                  currentYear={state.currentYear}
                  currentMonth={state.currentMonth}
                  selection={state.selectedRange}
                />
              </div>

              {/* Right: Calendar grid */}
              <div className="w-full lg:w-[60%] flex flex-col h-full relative z-10">
                <CalendarGrid
                  state={state}
                  onDateClick={handleDateClick}
                  onDateHover={handleDateHover}
                  onClearSelection={handleClearSelection}
                  onClearHover={handleClearHover}
                  getStamp={getStamp}
                  onShiftClick={handleShiftClick}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mini-month previews */}
      <div className="hidden lg:flex justify-center gap-6 p-4 bg-[#f8fafc] border-t border-gray-100 z-50">
        <MiniMonthPreview label="Prev" year={prevMonthYear} month={prevMonthNum} onSelect={handlePrev} />
        <div className="w-px bg-gray-200" />
        <MiniMonthPreview label="Next" year={nextMonthYear} month={nextMonthNum} onSelect={handleNext} />
      </div>

      {/* Keyboard shortcut hint */}
      <ShortcutHint />
    </div>
  );
}
