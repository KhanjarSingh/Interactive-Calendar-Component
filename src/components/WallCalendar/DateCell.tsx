import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { isSameDay, isSameMonth, format, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { HolidayEvent } from './types';

interface DateCellProps {
  date: Date;
  currentDisplayMonth: Date;
  isToday: boolean;
  holiday?: HolidayEvent;
  selection: { start: Date | null; end: Date | null };
  hoverDate: Date | null;
  selectionPhase: 'idle' | 'selecting-end';
  stampColor?: string;      // color from useStarredDates
  onClick: (d: Date) => void;
  onHover: (d: Date) => void;
  onShiftClick: (d: Date) => void;  // cycle stamp colour
}

const SHORT_NAMES: Record<string, string> = {
  "New Year's Day": 'New Year',
  "Martin Luther King Jr. Day": 'MLK Day',
  "Presidents' Day": 'Presidents',
  "Valentine's Day": 'Valentine',
  "St. Patrick's Day": "St. Pat's",
  "Easter Sunday": 'Easter',
  "Mother's Day": "Mother's",
  "Memorial Day": 'Memorial',
  "Father's Day": "Father's",
  "Juneteenth": 'Juneteenth',
  "Independence Day": 'July 4th',
  "Labor Day": 'Labor Day',
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
}: DateCellProps) {
  const [copied, setCopied] = React.useState(false);
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

  let hasLeftConnection = false;
  let hasRightConnection = false;
  const effectiveEnd = selectionPhase === 'selecting-end' ? hoverDate : end;
  if (start && effectiveEnd) {
    const s = isBefore(start, effectiveEnd) ? start : effectiveEnd;
    const e = isAfter(effectiveEnd, start) ? effectiveEnd : start;
    if (isWithinInterval(date, { start: s, end: e })) {
      if (!isSameDay(date, s)) hasLeftConnection = true;
      if (!isSameDay(date, e)) hasRightConnection = true;
    }
  }

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isNational = showHoliday && holiday.type === 'national';
  const isObservance = showHoliday && holiday.type === 'observance';

  const circleClass = !isCurrentMonth
    ? 'text-gray-400 italic font-normal'
    : isStart || (isEnd && selectionPhase !== 'selecting-end')
    ? 'text-white font-bold bg-[var(--cal-accent)] shadow-md'
    : isToday && !isInRange && !isPreviewRange
    ? 'bg-[var(--cal-accent)] text-white font-bold'
    : isNational
    ? 'text-red-700 font-bold ring-2 ring-red-300 bg-red-50'
    : isObservance
    ? 'text-amber-700 font-bold ring-2 ring-amber-300 bg-amber-50'
    : isWeekend
    ? 'font-bold text-gray-900'
    : 'text-gray-800 font-medium';

  function handleClick(e: React.MouseEvent) {
    // Ctrl/Cmd + click → copy date to clipboard
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const text = format(date, 'MMMM d, yyyy');
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
      return;
    }
    // Shift + click → cycle stamp colour
    if (e.shiftKey) {
      e.preventDefault();
      onShiftClick(date);
      return;
    }
    onClick(date);
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center cursor-pointer',
        showHoliday ? 'min-h-[62px] min-w-[44px]' : 'min-h-[44px] min-w-[44px]'
      )}
      onClick={handleClick}
      onPointerEnter={() => onHover(date)}
      title={
        holiday && isCurrentMonth
          ? holiday.name
          : stampColor
          ? `Shift+click to change colour · Ctrl+click to copy`
          : `Shift+click to stamp · Ctrl+click to copy date`
      }
    >
      {/* Holiday top-bar stripe */}
      {showHoliday && (
        <div className={cn(
          'absolute top-0 left-[6px] right-[6px] h-[3px] rounded-b-full z-20',
          isNational ? 'bg-red-500' : 'bg-amber-400'
        )} />
      )}

      {/* Stamp colour dot in top-right corner */}
      {stampColor && isCurrentMonth && (
        <div
          className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full z-20 ring-1 ring-white shadow-sm"
          style={{ backgroundColor: stampColor }}
        />
      )}

      {/* Range connection backgrounds */}
      <div className="absolute inset-y-1 left-0 right-0 flex pointer-events-none z-0">
        <div className={cn('flex-1 transition-colors', hasLeftConnection ? 'bg-[var(--cal-accent-light)]' : 'bg-transparent')} />
        <div className={cn('flex-1 transition-colors', hasRightConnection ? 'bg-[var(--cal-accent-light)]' : 'bg-transparent')} />
      </div>

      {/* Date circle */}
      <motion.div
        className={cn(
          'relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors cursor-pointer select-none mt-1',
          circleClass,
          (!isStart && !isEnd && (!isToday || isInRange || isPreviewRange) && !isNational && !isObservance)
            && 'hover:bg-[var(--cal-accent-light)]'
        )}
        whileTap={{ scale: 0.88 }}
        animate={isStart || isEnd ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={isStart || isEnd ? { duration: 0.3 } : { type: 'spring', stiffness: 500, damping: 15 }}
      >
        {date.getDate()}
      </motion.div>

      {/* Holiday name label */}
      {showHoliday && (
        <HolidayLabel name={holiday.name} isNational={!!isNational} />
      )}

      {/* "Copied!" flash tooltip */}
      {copied && (
        <div className="absolute bottom-full mb-1 z-50 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold whitespace-nowrap rounded shadow-lg pointer-events-none animate-in fade-in zoom-in duration-150">
          Copied!
        </div>
      )}

      {/* Range end-hover tooltip */}
      {selectionPhase === 'selecting-end' && start && hoverDate && isSameDay(date, hoverDate) && !copied && (
        <div className="absolute bottom-full mb-1 z-50 px-2 py-1 bg-gray-900 text-white text-xs font-semibold whitespace-nowrap rounded shadow-lg pointer-events-none animate-in fade-in zoom-in duration-200">
          {format(date, 'MMM d')}
        </div>
      )}
    </div>
  );
}

function HolidayLabel({ name, isNational }: { name: string; isNational: boolean }) {
  const [show, setShow] = React.useState(false);
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
