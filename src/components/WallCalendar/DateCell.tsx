import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { isSameDay, isSameMonth, format, isWithinInterval, isBefore, isAfter, addDays, differenceInDays, parseISO } from 'date-fns';
import { HolidayEvent } from './types';
import { vibrate, HAP_TAP_CELL } from './utils/haptics';

interface DateCellProps {
  date: Date;
  currentDisplayMonth: Date;
  isToday: boolean;
  holiday?: HolidayEvent;
  selection: { start: Date | null; end: Date | null };
  hoverDate: Date | null;
  selectionPhase: 'idle' | 'selecting-end';
  stampColor?: string;
  onClick: (d: Date) => void;
  onHover: (d: Date) => void;
  onShiftClick: (d: Date) => void;
  mood?: number;
  onMoodChange?: (d: Date, score: number) => void;
  recurring?: Record<string, any>;
  onAddRecurring?: (rule: any) => void;
  onRemoveRecurring?: (baseDate: string) => void;
  onSetStamp?: (dateKey: string, color: string | null) => void;
  isCompact?: boolean;
}

const SHORT_NAMES: Record<string, string> = {
  "New Year's Day": 'New Year',
  "Martin Luther King Jr. Day": 'MLK',
  "Presidents' Day": 'Presidents',
  "Valentine's Day": 'Valentine',
  "St. Patrick's Day": "St. Pat's",
  "Easter Sunday": 'Easter',
  "Mother's Day": "Mother's",
  "Memorial Day": 'Memorial',
  "Father's Day": "Father's",
  "Juneteenth": 'Juneteenth',
  "Independence Day": 'July 4th',
  "Labor Day": 'Labor',
  "Columbus Day": 'Columbus',
  "Halloween": 'Halloween',
  "Veterans Day": 'Veterans',
  "Thanksgiving Day": 'Thanksgvng',
  "Christmas Day": 'Christmas',
  "New Year's Eve": "New Yr Eve",
};

function getShortName(name: string): string {
  return SHORT_NAMES[name] ?? name.split(' ').slice(0, 2).join(' ');
}

export function DateCell({
  date,
  currentDisplayMonth,
  isToday,
  holiday,
  selection,
  hoverDate,
  selectionPhase,
  stampColor,
  onClick,
  onHover,
  onShiftClick,
  mood,
  onMoodChange,
  recurring,
  onAddRecurring,
  onRemoveRecurring,
  onSetStamp,
  isCompact,
}: DateCellProps) {
  const [copied, setCopied] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showRecurrencePopover, setShowRecurrencePopover] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isCurrentMonth = isSameMonth(date, currentDisplayMonth);
  const { start, end } = selection;
  const showHoliday = holiday && isCurrentMonth;

  const isStart = start && isSameDay(date, start);
  const isEnd = end && isSameDay(date, end);

  let isInRange = false;
  let isPreviewRange = false;

  if (start && end) {
    const s = isBefore(start, end) ? start : end;
    const e = isAfter(end, start) ? end : start;
    if (!isSameDay(date, s) && !isSameDay(date, e)) {
      isInRange = isWithinInterval(date, { start: s, end: e });
    }
  }

  if (selectionPhase === 'selecting-end' && start && hoverDate) {
    const s = isBefore(start, hoverDate) ? start : hoverDate;
    const e = isAfter(hoverDate, start) ? hoverDate : start;
    if (!isSameDay(date, s) && !isSameDay(date, e)) {
      isPreviewRange = isWithinInterval(date, { start: s, end: e });
    }
  }

  const recurringRule = useMemo(() => {
    if (!recurring) return null;
    const dateKey = format(date, 'yyyy-MM-dd');
    
    for (const baseKey in recurring) {
      const rule = recurring[baseKey];
      const baseDate = parseISO(baseKey);
      if (isBefore(date, baseDate) || isSameDay(date, baseDate)) continue;
      
      let match = false;
      if (rule.frequency === 'weekly') {
        match = date.getDay() === baseDate.getDay();
      } else if (rule.frequency === 'monthly') {
        match = date.getDate() === baseDate.getDate();
      } else if (rule.frequency === 'yearly') {
        match = date.getDate() === baseDate.getDate() && date.getMonth() === baseDate.getMonth();
      }
      
      if (match) return rule;
    }
    return null;
  }, [date, recurring]);

  function handleClick(e: React.MouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const text = format(date, 'MMMM d, yyyy');
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
      return;
    }
    if (e.shiftKey) {
      e.preventDefault();
      onShiftClick(date);
      return;
    }
    vibrate(HAP_TAP_CELL);
    onClick(date);
  }

  function handleContextMenu(e: React.MouseEvent) {
    if (isCurrentMonth) {
      e.preventDefault();
      setShowMoodPicker(true);
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!isCurrentMonth) return;
    longPressTimer.current = setTimeout(() => {
      setShowMoodPicker(true);
    }, 400);
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleDragStart(e: React.DragEvent) {
    if (!stampColor) return;
    const dateKey = format(date, 'yyyy-MM-dd');
    e.dataTransfer.setData('application/wallcal-stamp', JSON.stringify({
      dateKey,
      color: stampColor
    }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    if (stampColor) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('application/wallcal-stamp');
    if (!data) return;

    try {
      const { dateKey: srcKey, color } = JSON.parse(data);
      const dstKey = format(date, 'yyyy-MM-dd');
      
      if (srcKey === dstKey) return;

      onSetStamp?.(srcKey, null);
      onSetStamp?.(dstKey, color);

      const srcNotesKey = `wallcal_notes_range_${srcKey}_${srcKey}`;
      const dstNotesKey = `wallcal_notes_range_${dstKey}_${dstKey}`;
      const srcNotes = localStorage.getItem(srcNotesKey);
      
      if (srcNotes) {
        localStorage.setItem(dstNotesKey, srcNotes);
        localStorage.removeItem(srcNotesKey);
      }

      setJustDropped(true);
      setTimeout(() => setJustDropped(false), 800);
      
    } catch (err) {
      console.error('Drop failed', err);
    }
  }

  const moodColorMap: Record<number, string> = {
    1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 5: '#22c55e'
  };
  const moodColor = mood ? moodColorMap[mood] : null;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center cursor-pointer group/cell select-none',
        isCompact ? 'h-12 w-full' : 'h-20 w-full',
        isDragOver && 'ring-2 ring-inset ring-[var(--cal-accent)] bg-[var(--cal-accent-light)]/20',
        justDropped && 'animate-[pulse_0.4s_ease-in-out_2]'
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!!stampColor}
      onPointerLeave={() => {
        handlePointerUp();
        onHover(date);
      }}
      onPointerEnter={() => onHover(date)}
      style={{
        backgroundColor: moodColor ? `${moodColor}15` : undefined,
        opacity: isDragOver ? 0.8 : 1,
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        {isInRange && !isStart && !isEnd && (
          <div className="h-8 w-full bg-[var(--cal-accent-light)] absolute top-1" />
        )}
        {isPreviewRange && !isInRange && !isStart && !isEnd && (
          <div className="h-8 w-full bg-[var(--cal-accent-light)]/50 absolute top-1" />
        )}
        {isStart && end && !isSameDay(start, end) && (
          <div className={cn(
            "h-8 bg-[var(--cal-accent-light)] absolute top-1",
            isBefore(start, end) ? "left-1/2 right-0" : "right-1/2 left-0"
          )} />
        )}
        {isEnd && start && !isSameDay(start, end) && (
          <div className={cn(
            "h-8 bg-[var(--cal-accent-light)] absolute top-1",
            isAfter(end, start) ? "right-1/2 left-0" : "left-1/2 right-0"
          )} />
        )}
      </div>

      <div className="relative w-8 h-8 flex items-center justify-center translate-y-1 z-10">
        <span
          className={cn(
            'inline-block select-none leading-none transition-colors relative z-10',
            isCompact ? 'text-[14px] font-bold' : isStart || isEnd ? 'text-[13px] font-extrabold' : 'text-[13px] font-bold',
            isStart || isEnd ? 'text-white' : !isCurrentMonth ? 'text-gray-300' : 'text-gray-800'
          )}
        >
          {format(date, 'd')}
        </span>

        {(isStart || isEnd) && (
          <motion.div
            layoutId={isStart ? "selection-start" : "selection-end"}
            className="absolute inset-0 rounded-full bg-[var(--cal-accent)] shadow-md z-0 pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
          />
        )}
      </div>

      {showHoliday && !holiday.type.includes('observance') && !isCompact && (
        <div className="absolute top-[34px] left-0 right-0 z-20 pointer-events-none pb-1 flex justify-center">
          <HolidayLabel name={holiday.name} isNational={holiday.type === 'national'} />
        </div>
      )}

      {(stampColor || (recurringRule && !stampColor)) && (
        <motion.div
          layoutId={`stamp-${date.toISOString()}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute z-30 w-[12px] h-[12px] rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] pointer-events-none",
            isCompact ? "bottom-1 right-1" : "top-1 right-1",
            !stampColor && recurringRule ? "opacity-30 border-[1.5px] border-dashed bg-transparent" : ""
          )}
          style={{
            backgroundColor: stampColor || 'transparent',
            borderColor: !stampColor && recurringRule ? recurringRule.color : 'transparent',
          }}
        />
      )}

      <AnimatePresence>
        {copied && (
          <div className="absolute bottom-full mb-1 z-50 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold whitespace-nowrap rounded shadow-lg pointer-events-none animate-in fade-in zoom-in duration-150">
            Copied!
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMoodPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] bg-white rounded-full shadow-xl border border-gray-100 p-1.5 flex gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => {
                  onMoodChange?.(date, score);
                  setShowMoodPicker(false);
                }}
                className={cn(
                  "w-5 h-5 rounded-full transition-transform hover:scale-125 shadow-sm",
                  mood === score ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                )}
                style={{ backgroundColor: moodColorMap[score] }}
              />
            ))}
            <button 
              onClick={() => setShowMoodPicker(false)}
              className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurrence Popover */}
      <AnimatePresence>
        {showRecurrencePopover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-48 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Recurrence</span>
              <button 
                onClick={() => setShowRecurrencePopover(false)} 
                className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center p-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {(['weekly', 'monthly', 'yearly'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => {
                    onAddRecurring?.({
                      baseDate: format(date, 'yyyy-MM-dd'),
                      color: stampColor || '#3b82f6',
                      frequency: freq,
                      label: format(date, 'MMM d') + ' Event'
                    });
                    setShowRecurrencePopover(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-[var(--cal-accent)] hover:text-white text-xs font-bold text-gray-600 transition-colors capitalize text-left"
                >
                  Repeat {freq}
                </button>
              ))}
              {recurring && recurring[format(date, 'yyyy-MM-dd')] && (
                <button
                  onClick={() => {
                    onRemoveRecurring?.(format(date, 'yyyy-MM-dd'));
                    setShowRecurrencePopover(false);
                  }}
                  className="mt-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-xs font-bold text-red-500 transition-colors text-left"
                >
                  Remove Rule
                </button>
              )}
            </div>
            <p className="text-[9px] text-gray-400 leading-tight">Will repeat based on this date's position.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HolidayLabel({ name, isNational }: { name: string; isNational: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative flex flex-col items-center w-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className={cn(
        'text-[8px] font-bold leading-none text-center px-0.5 truncate max-w-full mt-0.5',
        isNational ? 'text-red-600' : 'text-amber-600'
      )}>
        {getShortName(name)}
      </span>
      {show && (
        <div className="absolute bottom-full mb-1 z-50 px-2 py-1 bg-gray-900 text-white text-xs whitespace-nowrap rounded shadow-lg pointer-events-none">
          {name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
