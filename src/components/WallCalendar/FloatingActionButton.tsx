import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit3, Palette, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onAddNote: () => void;
  onStampToday: () => void;
  onGoToToday: () => void;
}

export function FloatingActionButton({ onAddNote, onStampToday, onGoToToday }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions = [
    { icon: <Edit3 size={18} />, label: 'Add note', onClick: onAddNote },
    { icon: <Palette size={18} />, label: 'Stamp today', onClick: onStampToday },
    { icon: <Calendar size={18} />, label: 'Go to today', onClick: onGoToToday },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] lg:hidden" ref={containerRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-end justify-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                closed: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
              className="flex flex-col items-end gap-3 mb-4 absolute bottom-full pb-2"
            >
              {actions.map((action, i) => (
                <motion.button
                  key={i}
                  variants={{
                    open: { opacity: 1, y: 0, scale: 1 },
                    closed: { opacity: 0, y: 20, scale: 0.8 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-gray-700 whitespace-nowrap">
                    {action.label}
                  </span>
                  <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[var(--cal-accent)]">
                    {action.icon}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleOpen}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? '#e5e7eb' : 'var(--cal-accent)' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors z-10",
            isOpen ? "text-gray-600 shadow-md" : ""
          )}
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}
