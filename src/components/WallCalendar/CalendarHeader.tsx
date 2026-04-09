import React from 'react';
import { format, differenceInCalendarDays, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeasonalBanner } from './SeasonalBanner';
import { holidays2025_2026 } from './constants/holidays';
import { getUnsplashBanner } from './utils/unsplash';

interface CalendarHeaderProps {
  currentYear: number;
  currentMonth: number;
  onNext: () => void;
  onPrev: () => void;
  onToday?: () => void;
}

const MONTH_IMAGES = [
  'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1200&q=80&fit=crop', // Jan snow
  'https://images.unsplash.com/photo-1433155398244-a957c7908b98?w=1200&q=80&fit=crop', // Feb
  'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80&fit=crop', // Mar blossom
  'https://images.unsplash.com/photo-1521404176378-500b5caaea49?w=1200&q=80&fit=crop', // Apr rain
  'https://images.unsplash.com/photo-1467043153537-a4fba2cd39ef?w=1200&q=80&fit=crop', // May
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&fit=crop', // Jun beach
  'https://images.unsplash.com/photo-1440615496174-ee7ecbe8e5eb?w=1200&q=80&fit=crop', // Jul sun
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80&fit=crop', // Aug forest
  'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&q=80&fit=crop', // Sep autumn
  'https://images.unsplash.com/photo-1506869640319-fea1a2ab822e?w=1200&q=80&fit=crop', // Oct pumpkins
  'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=1200&q=80&fit=crop', // Nov farm
  'https://images.unsplash.com/photo-1512341689857-198e7e2f3ea8?w=1200&q=80&fit=crop', // Dec cozy
];

// Seasonal gradient fallbacks — always visible if image fails to load
const MONTH_GRADIENTS: string[] = [
  'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #0284c7 100%)', // Jan – deep winter blue
  'linear-gradient(135deg, #831843 0%, #be185d 45%, #f43f5e 100%)', // Feb – valentine rose
  'linear-gradient(135deg, #14532d 0%, #16a34a 45%, #4ade80 100%)', // Mar – spring green
  'linear-gradient(135deg, #365314 0%, #65a30d 45%, #bef264 100%)', // Apr – fresh lime
  'linear-gradient(135deg, #9d174d 0%, #db2777 45%, #fda4af 100%)', // May – blossom pink
  'linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #38bdf8 100%)', // Jun – summer sky
  'linear-gradient(135deg, #78350f 0%, #b45309 45%, #fbbf24 100%)', // Jul – summer gold
  'linear-gradient(135deg, #064e3b 0%, #047857 45%, #34d399 100%)', // Aug – deep forest
  'linear-gradient(135deg, #7c2d12 0%, #c2410c 45%, #fb923c 100%)', // Sep – autumn ember
  'linear-gradient(135deg, #431407 0%, #9a3412 45%, #ea580c 100%)', // Oct – deep pumpkin
  'linear-gradient(135deg, #1e3a5f 0%, #334155 45%, #64748b 100%)', // Nov – cool slate
  'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #1d4ed8 100%)', // Dec – midnight
];

// Find next upcoming holiday from today
function getNextHoliday() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const upcoming = holidays2025_2026
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!upcoming.length) return null;
  const next = upcoming[0];
  const days = differenceInCalendarDays(new Date(next.date + 'T00:00:00'), today);
  return { name: next.name, days };
}

function MoonPhase({ currentYear, currentMonth }: { currentYear: number; currentMonth: number }) {
  const EPOCH = new Date(2000, 0, 6, 18, 14);
  const LUNAR_MONTH = 29.53059;
  
  // Use the 15th of the month to provide a stable phase for the month view and avoid hydration mismatch
  const stableDate = new Date(currentYear, currentMonth, 15);
  const daysSince = (stableDate.getTime() - EPOCH.getTime()) / (24 * 60 * 60 * 1000);
  const phase = (daysSince % LUNAR_MONTH) / LUNAR_MONTH;
  const normalizedPhase = phase < 0 ? phase + 1 : phase;

  return (
    <div className="absolute top-4 sm:top-[76px] lg:top-[92px] left-4 sm:left-5 lg:left-8 z-40 w-8 h-8 text-white opacity-80 filter drop-shadow-md" title="Moon Phase">
      <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
        <circle cx="50" cy="50" r="45" fill="rgba(255,255,255,0.2)" />
        {normalizedPhase <= 0.5 ? (
          <path d={`M 50 5 A 45 45 0 1 ${normalizedPhase > 0.25 ? 0 : 1} 50 95 A ${45 * (1 - normalizedPhase * 4)} 45 0 1 ${normalizedPhase > 0.25 ? 1 : 0} 50 5`} fill="white" />
        ) : (
          <>
            <path d={`M 50 5 A 45 45 0 1 ${normalizedPhase > 0.75 ? 1 : 0} 50 95 A ${45 * (1 - (normalizedPhase - 0.5) * 4)} 45 0 1 ${normalizedPhase > 0.75 ? 0 : 1} 50 5`} fill="rgba(255,255,255,0.2)" />
            <circle cx="50" cy="50" r="45" fill="white" />
          </>
        )}
        {normalizedPhase < 0.06 || normalizedPhase > 0.94 ? <circle cx="50" cy="50" r="45" fill="white" /> : null}
      </svg>
    </div>
  );
}

export function CalendarHeader({ currentYear, currentMonth, onNext, onPrev, onToday }: CalendarHeaderProps) {
  const stateKey = `${currentYear}-${currentMonth}`;
  const d = new Date(currentYear, currentMonth);
  const staticFallback = MONTH_IMAGES[currentMonth % 12];
  const gradient = MONTH_GRADIENTS[currentMonth % 12];
  const nextHoliday = getNextHoliday();

  const [bannerUrl, setBannerUrl] = React.useState(staticFallback);

  React.useEffect(() => {
    let active = true;
    async function fetchBanner() {
      const url = await getUnsplashBanner(currentMonth);
      if (active) setBannerUrl(url);
    }
    fetchBanner();
    return () => { active = false; };
  }, [currentMonth]);

  const imageUrl = bannerUrl || staticFallback;

  return (
    <div className="relative overflow-hidden rounded-t-lg">
      {/* Wire Binding */}
      <div className="h-[28px] w-full bg-[#f3f4f6] relative z-30 flex justify-evenly items-center shadow-[inset_0_-3px_5px_rgba(0,0,0,0.1)] border-b-2 border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="relative w-[10px] sm:w-[14px] h-[40px] -translate-y-2">
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1f2937] rounded-full shadow-[inset_0_3px_5px_rgba(0,0,0,1)] z-0" />
            <div className="absolute top-0 left-0 w-full h-[32px] bg-gradient-to-b from-[#ffffff] via-[#6b7280] to-[#374151] rounded-full border border-[#4b5563] shadow-[1px_4px_6px_rgba(0,0,0,0.5)] z-10" />
            <div className="absolute bottom-1 left-1.5 w-1 h-2 rounded-full bg-white/30 z-20" />
          </div>
        ))}
      </div>

      {/* Hero container — gradient always shows; image overlays; SVG art behind both */}
      <div className="relative h-56 sm:h-72 md:h-[320px] w-full overflow-hidden" style={{ background: gradient }}>

        {/* Seasonal SVG art — always visible as the base illustration */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <SeasonalBanner month={currentMonth} />
        </div>

        {/* Unsplash photo — overlays art when it loads; hidden via onError if broken */}
        <AnimatePresence mode="wait">
          <motion.img
            key={stateKey}
            src={imageUrl}
            alt="Month scenery"
            className="absolute inset-0 w-full h-full object-cover z-[1]"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
        </AnimatePresence>

        {/* Moon Phase Component positioned in the hero banner */}
        <MoonPhase currentYear={currentYear} currentMonth={currentMonth} />

        {/* Today Button (Desktop only - Mobile uses FAB) */}
        {onToday && (
          <button
            onClick={onToday}
            className="hidden sm:block absolute top-5 left-5 lg:top-8 lg:left-8 z-30 px-5 py-2.5 bg-white/95 backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 text-[var(--cal-accent)] font-extrabold text-xs lg:text-sm uppercase tracking-wider rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all focus:outline-none"
          >
            Today
          </button>
        )}

        {/* Next holiday countdown pill */}
        {nextHoliday && (
          <div className="absolute top-[68px] sm:top-5 left-1/2 -translate-x-1/2 z-30 px-3 sm:px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-1.5 sm:gap-2 select-none whitespace-nowrap">
            <span className="hidden sm:inline text-white/70 text-[10px] font-semibold uppercase tracking-wider">Next holiday</span>
            <span className="text-white text-[11px] font-bold truncate max-w-[120px] sm:max-w-none">{nextHoliday.name}</span>
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0">
              {nextHoliday.days === 0 ? 'Today!' : nextHoliday.days === 1 ? 'Tomorrow' : `${nextHoliday.days}d`}
            </span>
          </div>
        )}

        {/* Dark gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none" />

        {/* Wave cut at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-8 sm:h-12 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full bottom-0 absolute fill-[var(--cal-accent)] opacity-80">
            <path d="M0,0V120H1200V0C1200,60 900,120 600,120C300,120 0,60 0,0Z" />
          </svg>
        </div>

        {/* Month + nav panel (diagonal clip) */}
        <div
          className="absolute right-0 bottom-0 z-20 flex items-center pr-6 pl-14 py-4 lg:pl-20 lg:py-6 lg:pr-10"
          style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)', backgroundColor: 'var(--cal-accent)' }}
        >
          <div className="flex items-center gap-4 pl-4 text-white">
            <button onClick={onPrev} className="p-1.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none" aria-label="Previous month">
              <ChevronLeft size={28} strokeWidth={2} />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={stateKey}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center min-w-[130px] select-none"
              >
                <span className="text-sm lg:text-base font-light tracking-[0.2em] opacity-90 leading-tight">{currentYear}</span>
                <span className="text-3xl lg:text-4xl font-extrabold uppercase tracking-widest leading-tight">{format(d, 'MMM')}</span>
              </motion.div>
            </AnimatePresence>
            <button onClick={onNext} className="p-1.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none" aria-label="Next month">
              <ChevronRight size={28} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
