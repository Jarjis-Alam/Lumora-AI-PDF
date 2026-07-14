import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from './LoadingScreen';

interface SplashTransitionProps {
  children: ReactNode;
}

export function SplashTransition({ children }: SplashTransitionProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Premium 2.2 second minimum display duration to guarantee high-end visual rhythm
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="splash-screen" />
        ) : (
          <motion.div
            key="workspace-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1], // Apple / iOS standard ease out
            }}
            className="w-full h-full min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
