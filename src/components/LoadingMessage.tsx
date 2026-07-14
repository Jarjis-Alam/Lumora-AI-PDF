import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Preparing your research workspace...',
  'Reading documents...',
  'Building knowledge graph...',
  'Generating summaries...',
  'Almost ready...',
];

export const LoadingMessage = memo(function LoadingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200); // 1.2s switch for comfortable reading and crossfade
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-6 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={MESSAGES[index]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="lumora-status font-sans select-none"
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
});
