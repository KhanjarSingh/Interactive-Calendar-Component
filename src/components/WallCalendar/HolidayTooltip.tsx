import React, { useState } from 'react';

export function HolidayTooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full mb-1 z-50 px-2 py-1 bg-gray-900 text-white text-xs whitespace-nowrap rounded shadow-lg pointer-events-none">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
