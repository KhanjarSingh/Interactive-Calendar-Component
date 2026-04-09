import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotesBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function NotesBottomSheet({ isOpen, onClose, children }: NotesBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[80] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              // Dismiss if dragged down more than 100px or fast swipe
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            // Start at 70vh, allow user to drag it to 90vh natively via scroll overflow
            className="fixed bottom-0 left-0 right-0 z-[90] bg-[#FEFCE8] rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden will-change-transform lg:hidden"
            style={{ height: '70vh', maxHeight: '90vh' }}
          >
            {/* Drag Handle Area */}
            <div className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-inherit shrink-0">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
