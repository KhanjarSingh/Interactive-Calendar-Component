'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { getMonthGrid } from './utils/dateHelpers';
import { cn } from '@/lib/utils';

interface YearOverviewProps {
  year: number;
  onSelectMonth: (month: number) => void;
  getStamp: (dateKey: string) => string | undefined;
}

export function YearOverview({ year, onSelectMonth, getStamp }: YearOverviewProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="p-4 lg:p-8 bg-white h-full overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {months.map((month) => (
          <MonthSmallGrid
            key={month}
            year={year}
            month={month}
            onClick={() => onSelectMonth(month)}
            getStamp={getStamp}
          />
        ))}
      </div>
    </div>
  );
}

function MonthSmallGrid({ year, month, onClick, getStamp }: {
  year: number;
  month: number;
  onClick: () => void;
  getStamp: (dateKey: string) => string | undefined;
}) {
  const d = new Date(year, month);
  const grid = getMonthGrid(year, month);
  
  // Scan for notes in this month to show grey dots
  const hasNotes = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const keyPrefix = `wallcal_notes_general_${year}-${month.toString().padStart(2, '0')}`;
    const general = localStorage.getItem(keyPrefix);
    if (general && JSON.parse(general).length > 0) return true;
    
    // Check range notes (approximate check)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('wallcal_notes_range_') && key.includes(`${year}-${(month + 1).toString().padStart(2, '0')}`)) {
            const raw = localStorage.getItem(key);
            if (raw && JSON.parse(raw).length > 0) return true;
        }
    }
    return false;
  }, [year, month]);

  return (
    <motion.div
      layoutId={`month-grid-${year}-${month}`}
      onClick={onClick}
      className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 hover:border-[var(--cal-accent)] hover:shadow-lg transition-all cursor-pointer group bg-gray-50/30"
    >
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[var(--cal-accent)] transition-colors">
        {format(d, 'MMMM')}
      </h4>
      
      <div className="grid grid-cols-7 gap-0.5">
        {grid.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, d);
          const dateKey = format(date, 'yyyy-MM-dd');
          const stamp = getStamp(dateKey);
          
          return (
            <div
              key={i}
              className="relative aspect-square flex items-center justify-center"
            >
              <span className={cn(
                "text-[7px] font-medium transition-opacity",
                isCurrentMonth ? "text-gray-600" : "text-gray-200"
              )}>
                {date.getDate()}
              </span>
              
              {/* Activity Indicator */}
              {isCurrentMonth && (stamp || hasNotes) && (
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full mb-0.5"
                  style={{ backgroundColor: stamp || '#94a3b8' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
