'use client';
import React, { useMemo } from 'react';
import { getDayOfYear } from 'date-fns';

export function YearProgressBar() {
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const dayOfYear = getDayOfYear(today);
  const pct = Math.round((dayOfYear / totalDays) * 100);

  return (
    <div className="px-6 lg:px-8 py-2 bg-white border-b border-gray-100 flex items-center gap-3 select-none">
      {/* Label left */}
      <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
        Day {dayOfYear}
      </span>

      {/* Progress track */}
      <div className="flex-1 relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--cal-accent-dark), var(--cal-accent))',
          }}
        />
        {/* Pulse on the leading edge */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow"
          style={{
            left: `calc(${pct}% - 5px)`,
            backgroundColor: 'var(--cal-accent)',
            boxShadow: '0 0 0 3px var(--cal-accent-light)',
          }}
        />
      </div>

      {/* Label right */}
      <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: 'var(--cal-accent)' }}>
        {pct}% of {year}
      </span>
    </div>
  );
}
