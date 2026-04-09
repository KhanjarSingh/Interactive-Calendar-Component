import React from 'react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { getMonthGrid } from './utils/dateHelpers';

interface Props {
  year: number;
  month: number;
  label: string;
  onSelect: () => void;
}

export function MiniMonthPreview({ year, month, label, onSelect }: Props) {
  const d = new Date(year, month);
  const grid = getMonthGrid(year, month);
  const today = new Date();

  return (
    <div 
      onClick={onSelect}
      className="cursor-pointer group select-none transition-transform hover:scale-105"
    >
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-[var(--cal-accent)] transition-colors">
        {label}
      </p>
      <h4 className="text-xs font-bold text-gray-800 mb-2">
        {format(d, 'MMMM yyyy')}
      </h4>
      <div className="grid grid-cols-7 gap-1">
        {['M','T','W','T','F','S','S'].map((day, i) => (
          <div key={i} className="text-[8px] text-center text-gray-400 font-medium leading-none mb-1">{day}</div>
        ))}
        {grid.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, d);
          const isToday = isSameDay(date, today);
          return (
            <div 
              key={i} 
              className={`text-[9px] text-center w-4 h-4 flex items-center justify-center rounded-full font-medium ${
                !isCurrentMonth ? 'text-gray-200' : 'text-gray-600'
              } ${
                isToday ? 'bg-[var(--cal-accent)] text-white font-bold' : ''
              }`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
