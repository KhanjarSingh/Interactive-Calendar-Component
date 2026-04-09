import React from 'react';
import { DateCell } from './DateCell';
import { getMonthGrid } from './utils/dateHelpers';
import { CalendarState, HolidayEvent } from './types';
import { holidays2025_2026 } from './constants/holidays';
import { format, isSameMonth, getISOWeek, isToday, isSameWeek, endOfMonth, eachDayOfInterval, startOfMonth, isWeekend } from 'date-fns';
import { useTheme } from './useTheme';
import { useMediaQuery } from './useMediaQuery';

interface CalendarGridProps {
  state: CalendarState;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date) => void;
  onClearSelection: () => void;
  onClearHover: () => void;
  getStamp: (dateKey: string) => string | undefined;
  onShiftClick: (d: Date) => void;
  moods: Record<string, number>;
  onMoodChange: (d: Date, score: number) => void;
  recurring: Record<string, any>;
  addRecurring: (rule: any) => void;
  removeRecurring: (baseDate: string) => void;
  setStamp: (dateKey: string, color: string | null) => void;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function CalendarGrid({ 
  state, onDateClick, onDateHover, onClearSelection, onClearHover, 
  getStamp, onShiftClick, moods, onMoodChange,
  recurring, addRecurring, removeRecurring, setStamp
}: CalendarGridProps) {
  const { currentYear, currentMonth, selectedRange, hoverDate, selectionPhase } = state;
  const { compactMode } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isCompact = compactMode || isMobile;

  const gridDates = getMonthGrid(currentYear, currentMonth);
  const displayMonthDate = new Date(currentYear, currentMonth);
  const today = new Date();

  const holidayMap = holidays2025_2026.reduce((acc, h) => {
    acc[h.date] = h;
    return acc;
  }, {} as Record<string, HolidayEvent>);

  const hasSelection = selectedRange.start !== null || selectedRange.end !== null;

  // Group flat array into rows of 7 (weeks)
  const weeks: Date[][] = [];
  for (let i = 0; i < gridDates.length; i += 7) {
    weeks.push(gridDates.slice(i, i + 7));
  }

  // Work days remaining in this month
  const monthEnd = endOfMonth(displayMonthDate);
  const workDaysLeft = eachDayOfInterval({ start: today > displayMonthDate ? today : displayMonthDate, end: monthEnd })
    .filter(d => isSameMonth(d, displayMonthDate) && !isWeekend(d)).length;
  const isCurrentMonth = isSameMonth(today, displayMonthDate);

  return (
    <div
      className="flex flex-col h-full pl-0 lg:pl-8 pt-6 lg:pt-0"
      onPointerLeave={onClearHover}
    >
      {/* Utility Header */}
      <div className="flex items-center justify-between mb-2 min-h-[24px]">
        {isCurrentMonth && (
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {workDaysLeft} work day{workDaysLeft !== 1 ? 's' : ''} left
          </span>
        )}
        <div className="flex-1" />
        {hasSelection && (
          <button
            onClick={onClearSelection}
            className="text-xs font-bold text-gray-400 hover:text-[var(--cal-accent)] transition-colors flex items-center gap-1 bg-gray-50 hover:bg-[var(--cal-accent-light)] px-3 py-1 rounded-full shadow-sm"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Days header — 8 cols: narrow week-num col + 7 day cols */}
      <div className="grid gap-0 mb-3" style={{ gridTemplateColumns: isCompact ? 'repeat(7, 1fr)' : '28px repeat(7, 1fr)' }}>
        {/* Week col header (blank) */}
        {!isCompact ? <div /> : <div className="hidden" />}
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[11px] uppercase tracking-widest font-bold ${
              i >= 5 ? 'text-[var(--cal-accent)]' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date rows — each row starts with a week number */}
      <div className="flex flex-col gap-y-1 relative z-10 pb-4">
        {weeks.map((week, wi) => {
          const weekNum = getISOWeek(week[0]);
          const isTodayInWeek = week.some(d => isToday(d));

          return (
            <div
              key={wi}
              className="grid gap-0 relative"
              style={{ gridTemplateColumns: isCompact ? 'repeat(7, 1fr)' : '28px repeat(7, 1fr)' }}
            >
              {/* Today's week highlight */}
              {isTodayInWeek && (
                <div className="absolute inset-y-0 left-7 right-0 bg-[var(--cal-accent-light)]/40 rounded-xl pointer-events-none z-0" />
              )}

              {/* Week number */}
              <div className={`flex items-start justify-center pt-3 select-none ${isCompact ? 'hidden' : ''}`}>
                <span
                  className={`text-[9px] font-bold ${
                    isTodayInWeek ? 'text-[var(--cal-accent)]' : 'text-gray-300'
                  }`}
                >
                  W{weekNum}
                </span>
              </div>

              {/* 7 date cells */}
              {week.map((date, di) => {
                const hk = format(date, 'yyyy-MM-dd');
                return (
                  <div key={di} className="flex justify-center relative z-10">
                    <DateCell
                      date={date}
                      currentDisplayMonth={displayMonthDate}
                      isToday={isToday(date)}
                      holiday={holidayMap[hk]}
                      selection={selectedRange}
                      hoverDate={hoverDate}
                      selectionPhase={selectionPhase}
                      stampColor={getStamp(hk)}
                      onClick={onDateClick}
                      onHover={onDateHover}
                      onShiftClick={onShiftClick}
                      mood={moods[hk]}
                      onMoodChange={onMoodChange}
                      recurring={recurring}
                      onAddRecurring={addRecurring}
                      onRemoveRecurring={removeRecurring}
                      onSetStamp={setStamp}
                      isCompact={isCompact}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Holiday Legend + month holiday list */}
      <HolidayLegend holidayMap={holidayMap} displayMonthDate={displayMonthDate} />
    </div>
  );
}

function HolidayLegend({
  holidayMap,
  displayMonthDate,
}: {
  holidayMap: Record<string, HolidayEvent>;
  displayMonthDate: Date;
}) {
  const [open, setOpen] = React.useState(false);

  const monthHolidays = Object.entries(holidayMap)
    .filter(([dateStr]) => isSameMonth(new Date(dateStr + 'T00:00:00'), displayMonthDate))
    .sort(([a], [b]) => a.localeCompare(b));

  if (monthHolidays.length === 0) return null;

  return (
    <div className="mt-auto pt-2 border-t border-gray-100">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-1 py-1 group"
      >
        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1.5 rounded-full bg-red-500" />
            National
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1.5 rounded-full bg-amber-400" />
            Observance
          </span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
          {open ? '▲ Hide' : `▼ ${monthHolidays.length} holiday${monthHolidays.length > 1 ? 's' : ''}`}
        </span>
      </button>

      {open && (
        <ul className="mt-1 flex flex-col gap-0.5 pb-2">
          {monthHolidays.map(([dateStr, h]) => (
            <li key={dateStr} className="flex items-center gap-2 px-1 py-0.5">
              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${h.type === 'national' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <span className="text-[11px] text-gray-600 font-medium">{format(new Date(dateStr + 'T00:00:00'), 'MMM d')}</span>
              <span className="text-[11px] text-gray-500 truncate">{h.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
