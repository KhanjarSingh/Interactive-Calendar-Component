import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
} from 'date-fns';

/**
 * Returns an array of dates representing the grid for a given month/year.
 * It always starts on Monday and ends on Sunday, padding with previous/next month dates.
 */
export function getMonthGrid(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
}

/**
 * Convenience to format date to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Gets the range key string for notes based on start and end dates.
 */
export function getRangeKey(start: Date, end: Date): string {
  const formattedStart = formatDateKey(start);
  const formattedEnd = formatDateKey(end);
  return `range_${formattedStart}_${formattedEnd}`;
}

/**
 * Gets the monthly key string for notes based on month and year.
 */
export function getMonthlyKey(year: number, month: number): string {
  const d = new Date(year, month);
  return `general_${format(d, 'yyyy-MM')}`;
}

/**
 * Helper to check if a date string acts as a holiday
 */
export function getHolidayKey(date: Date): string {
  return formatDateKey(date);
}
