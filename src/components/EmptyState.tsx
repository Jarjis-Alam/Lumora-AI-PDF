import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  accent?: string;
}

export function EmptyState({ icon: Icon, title, description, action, accent = '#C0392B' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div
        className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${accent}12` }}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ boxShadow: `inset 0 0 0 1.5px ${accent}25` }}
        />
        <Icon size={32} strokeWidth={1.25} style={{ color: accent }} />
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink-700">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-400">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-5">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
