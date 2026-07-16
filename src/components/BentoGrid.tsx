import { motion } from 'framer-motion';
import { FileText, Share2, Layers, AlignLeft, ListChecks, Cpu } from 'lucide-react';

const DEFAULT = [
  { icon: FileText, title: 'AI Chat' },
  { icon: Share2, title: 'Knowledge Graph' },
  { icon: Layers, title: 'Flashcards' },
  { icon: AlignLeft, title: 'Research Canvas' },
  { icon: ListChecks, title: 'Semantic Search' },
  { icon: Cpu, title: 'Smart Notes' },
];

export default function BentoGrid({ items = DEFAULT }: { items?: { icon: any; title: string }[] }) {
  const accents = ['crimson', 'emerald', 'amber', 'copper', 'blue', 'violet'];
  const colorMap: Record<string, { bg: string; text: string }> = {
    crimson: { bg: 'bg-crimson-50', text: 'text-crimson-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500' },
    copper: { bg: 'bg-paper-100', text: 'text-ink-700' },
    blue: { bg: 'bg-paper-100', text: 'text-blue-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
  };
  return (
    <div className="mx-auto mt-12 grid w-full max-w-6xl gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {items.map((it, i) => {
        const accent = accents[i % accents.length];
        const bg = accent.includes('.') ? accent.split('.')[0] : accent;
        const classes = colorMap[accent] || { bg: 'bg-paper-100', text: 'text-ink-700' };
        return (
          <motion.div
            key={it.title}
            whileHover={{ y: -10, scale: 1.03 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.55, ease: 'easeOut' }}
            className="group relative overflow-hidden rounded-2xl border border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-6 shadow-soft"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`${classes.bg} ${classes.text} flex h-12 w-12 items-center justify-center rounded-lg shadow-soft group-hover:shadow-glow-soft`}>
                <it.icon size={20} strokeWidth={1.6} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">{it.title}</h3>
            </div>
            <p className="text-sm text-ink-600">A concise description that explains how {it.title} helps your research flow.</p>
          </motion.div>
        );
      })}
    </div>
  );
}
