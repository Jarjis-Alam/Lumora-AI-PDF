import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Menu, Search, User } from 'lucide-react';

export default function PremiumNav() {
  return (
    <header className="fixed inset-x-6 top-6 z-60 rounded-2xl bg-white/30 backdrop-blur-md border border-white/10 shadow-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 px-2 py-1 opacity-95 hover:opacity-100 transition">
          <Logo size={28} />
          <span className="font-serif text-lg font-semibold tracking-tight text-ink-900">Lumora</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {['Features', 'Canvas', 'How it works', 'FAQ'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, '-')}`}
              className="relative px-3 py-2 text-sm font-medium text-ink-700 transition-transform will-change-transform hover:-translate-y-0.5"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="flex items-center gap-2 rounded-full bg-white/40 px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-sm"
          >
            <Search size={14} /> Quick find
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, y: -3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-full bg-ink-900/5 p-2"
          >
            <User size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="ml-2 rounded-full bg-crimson-700 hover:bg-crimson-600 px-3 py-2 text-sm font-semibold text-white shadow-lg"
          >
            Open Workspace
          </motion.button>

          <button className="ml-2 inline-flex items-center rounded-lg bg-white/6 p-2 md:hidden">
            <Menu size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
