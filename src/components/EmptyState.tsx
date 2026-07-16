import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Lightbulb, Sparkles as SparklesIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  accent?: string;
  tips?: string[];
  prompts?: string[];
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  secondaryAction,
  accent = '#C0392B',
  tips,
  prompts
}: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-gradient-to-b from-paper-50 to-paper-100 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl space-y-8 text-center"
      >
        {/* Icon with decorative elements */}
        <div className="relative mx-auto w-fit">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl shadow-float"
            style={{ 
              background: `linear-gradient(135deg, ${accent}E6 0%, ${accent} 100%)`,
            }}
          >
            <Icon size={44} strokeWidth={2} className="text-white" />
          </motion.div>
          
          {/* Decorative rings */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 -m-4 rounded-full"
            style={{ border: `2px solid ${accent}` }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.08 }}
            transition={{ delay: 0.4 }}
            className="absolute inset-0 -m-8 rounded-full"
            style={{ border: `2px solid ${accent}` }}
          />
        </div>

        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-serif text-2xl font-bold text-ink-900">{title}</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-600">
            {description}
          </p>
        </motion.div>

        {/* Action Buttons */}
        {(action || secondaryAction) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {action && (
              <button onClick={action.onClick} className="btn-primary gap-2">
                <SparklesIcon size={16} />
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button onClick={secondaryAction.onClick} className="btn-secondary gap-2">
                {secondaryAction.label}
              </button>
            )}
          </motion.div>
        )}

        {/* Example Prompts */}
        {prompts && prompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500">
              <SparklesIcon size={12} />
              Try asking:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {prompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.08 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="chip chip-secondary text-left"
                >
                  "{prompt}"
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Helpful Tips */}
        {tips && tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto max-w-md rounded-2xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/30 p-5 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Lightbulb size={16} />
              </div>
              <h4 className="text-sm font-bold text-amber-900">Pro Tips</h4>
            </div>
            <ul className="space-y-2 text-left">
              {tips.map((tip, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.08 }}
                  className="flex items-start gap-2 text-xs leading-relaxed text-amber-800"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
