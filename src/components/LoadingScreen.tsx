import { motion } from 'framer-motion';
import { LoaderAnimation } from './LoaderAnimation';
import { LoadingMessage } from './LoadingMessage';
import { memo } from 'react';

export const LoadingScreen = memo(function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center paper-texture select-none"
    >
      {/* Visual background spot lights */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(140, 29, 24, 0.02) 0%, transparent 70%)',
        }}
      />

      <div className="loader-wrapper">
        <div className="loader">
          <LoaderAnimation />
        </div>
        <h1 className="lumora-title font-serif">Lumora</h1>
        <div className="h-6">
          <LoadingMessage />
        </div>
      </div>
    </motion.div>
  );
});
