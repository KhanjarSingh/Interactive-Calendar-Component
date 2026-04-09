'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { NotesPanel } from './NotesPanel';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MiniMonthPreview } from './MiniMonthPreview';
import { YearProgressBar } from './YearProgressBar';
import { GlobalSearch } from './GlobalSearch';
import { YearOverview } from './YearOverview';
import { useCalendarState } from './useCalendarState';
import { useStarredDates } from './useStarredDates';
import { useMoodData } from './useMoodData';
import { format } from 'date-fns';
import { Search, Grid, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { NotesBottomSheet } from './NotesBottomSheet';
import { FloatingActionButton } from './FloatingActionButton';
import { useMotionValue, useTransform } from 'framer-motion';
import { vibrate, HAP_NAVIGATE } from './utils/haptics';

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
  const { starred, getStamp, toggleStamp, setStamp, recurring, addRecurring, removeRecurring } = useStarredDates();
  const { moods, setMood, averageMood } = useMoodData(state.currentYear, state.currentMonth);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotesSheetOpen, setIsNotesSheetOpen] = useState(false);
  
  // Swipe Gestures
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom pull to refresh state
  const [scrollY, setScrollY] = useState(0);

  // Re-calculate notes count across all valid keys for this month
  const [notesCount, setNotesCount] = useState(0);
  useEffect(() => {
    let count = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('wallcal_notes_')) {
          const mKey = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}`;
          if (key.includes(mKey)) {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            count += data.filter((n: any) => n.text?.trim()).length;
          }
        }
      }
    } catch(e) {}
    setNotesCount(count);
  }, [state.currentYear, state.currentMonth]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    vibrate(HAP_NAVIGATE);
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true); }
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
      transition: { 
        duration: 0.8, 
        type: 'spring', 
        bounce: 0.4,
        stiffness: 100 
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      rotateX: dir === 'next' ? 90 : -90,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.4 },
    }),
  };

  const handleDragEnd = (e: any, info: any) => {
    setIsDragging(false);
    if (info.offset.x > 80 && Math.abs(info.offset.y) < 50) {
      vibrate(HAP_NAVIGATE);
      handlePrev();
    } else if (info.offset.x < -80 && Math.abs(info.offset.y) < 50) {
      vibrate(HAP_NAVIGATE);
      handleNext();
    }
  };

  return (
    <>
      {/* Pull down to refresh icon indicator */}
      <div 
        className="fixed top-0 left-0 right-0 h-24 pointer-events-none flex items-center justify-center -z-10"
        style={{ opacity: scrollY < 0 ? Math.min(-scrollY / 50, 1) : 0, transform: `translateY(${Math.max(scrollY, -30)}px)` }}
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-[var(--cal-accent)] animate-spin-slow">
          <Loader2 size={18} />
        </div>
      </div>

      <div className="w-full max-w-[900px] mx-auto bg-white rounded-xl shadow-[0_4px_40px_rgba(0,0,0,0.10)] relative flex flex-col font-sans overflow-hidden border border-gray-100">
        
        {/* Swipe feedback edge gradients */}
        <AnimatePresence>
          {isDragging && dragX.get() > 20 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--cal-accent-light)] to-transparent z-[70] pointer-events-none flex items-center pl-2"
            >
              <span className="text-[var(--cal-accent)] text-2xl font-bold">›</span>
            </motion.div>
          )}
          {isDragging && dragX.get() < -20 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--cal-accent-light)] to-transparent z-[70] pointer-events-none flex items-center justify-end pr-2"
            >
              <span className="text-[var(--cal-accent)] text-2xl font-bold translate-x-1 rotate-180">›</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-[60] flex items-center gap-2">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-[var(--cal-accent)] hover:bg-[var(--cal-accent-light)] transition-all shadow-sm border border-gray-100"
          title="Search (⌘K)"
        >
          <Search size={18} />
        </button>
        <button
          onClick={() => setViewMode(v => v === 'month' ? 'year' : 'month')}
          className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-[var(--cal-accent)] hover:bg-[var(--cal-accent-light)] transition-all shadow-sm border border-gray-100"
          title={viewMode === 'month' ? "Year Overview" : "Month View"}
        >
          {viewMode === 'month' ? <Grid size={18} /> : <CalendarIcon size={18} />}
        </button>
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

      {/* 3-D page-flip container with gesture detection */}
      <motion.div 
        style={{ perspective: '2000px', x: dragX }} 
        className="relative bg-white w-full z-10 flex-1 overflow-hidden min-h-[500px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {viewMode === 'month' ? (
            <motion.div
              key={contentKey}
              custom={direction}
              variants={flipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ transformOrigin: 'top center', backfaceVisibility: 'hidden' }}
              className="flex w-full paper-shimmer"
            >
              <div className="flex flex-col lg:flex-row p-6 lg:p-8 pt-6 w-full gap-8 lg:gap-0 min-h-[500px]">
                {/* Left: Notes panel (Hidden on small screens) */}
                <div className="hidden lg:block w-[40%] flex-shrink-0 relative z-20">
                  <NotesPanel
                    currentYear={state.currentYear}
                    currentMonth={state.currentMonth}
                    selection={state.selectedRange}
                    averageMood={averageMood}
                    starred={starred}
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
                    moods={moods}
                    onMoodChange={setMood}
                    recurring={recurring}
                    addRecurring={addRecurring}
                    removeRecurring={removeRecurring}
                    setStamp={setStamp}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="year-overview"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="w-full"
            >
              <YearOverview 
                year={state.currentYear} 
                onSelectMonth={(m) => {
                  dispatch({ type: 'GO_TO_MONTH', payload: { year: state.currentYear, month: m } });
                  setViewMode('month');
                }}
                getStamp={getStamp}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mini-month previews */}
      <div className="hidden lg:flex justify-center gap-6 p-4 bg-[#f8fafc] border-t border-gray-100 z-50">
        <MiniMonthPreview label="Prev" year={prevMonthYear} month={prevMonthNum} onSelect={handlePrev} />
        <div className="w-px bg-gray-200" />
        <MiniMonthPreview label="Next" year={nextMonthYear} month={nextMonthNum} onSelect={handleNext} />
      </div>

      <ShortcutHint />

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(year, month) => {
          dispatch({ type: 'GO_TO_MONTH', payload: { year, month } });
          setIsSearchOpen(false);
          setIsNotesSheetOpen(true);
        }}
      />
      
      {/* Mobile-only Bottom Sheet trigger */}
      <div className="lg:hidden flex justify-center p-4 bg-gray-50/80 border-t border-gray-100 mt-auto">
        <button
          onClick={() => setIsNotesSheetOpen(true)}
          className="bg-white border-2 border-[var(--cal-accent)] text-[var(--cal-accent)] px-6 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-transform"
        >
          📝 Notes {notesCount > 0 ? `(${notesCount})` : ''}
        </button>
      </div>

    </div>

    {/* Portals and overlays */}
    <NotesBottomSheet isOpen={isNotesSheetOpen} onClose={() => setIsNotesSheetOpen(false)}>
      <div className="p-6">
        <NotesPanel
          currentYear={state.currentYear}
          currentMonth={state.currentMonth}
          selection={state.selectedRange}
          averageMood={averageMood}
          starred={starred}
        />
      </div>
    </NotesBottomSheet>

    <FloatingActionButton
      onAddNote={() => setIsNotesSheetOpen(true)}
      onStampToday={() => handleShiftClick(new Date())}
      onGoToToday={handleToday}
    />
    </>
  );
}
