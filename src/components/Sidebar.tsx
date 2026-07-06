import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  AlignLeft,
  Layers,
  ListChecks,
  Share2,
  Search,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../store';
import { classNames } from '../lib/utils';

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/app', label: 'Documents', icon: FileText, exact: true },
      { to: '/app/chat', label: 'AI Chat', icon: MessageSquare },
      { to: '/app/summary', label: 'Summaries', icon: AlignLeft },
    ],
  },
  {
    label: 'Study',
    items: [
      { to: '/app/flashcards', label: 'Flashcards', icon: Layers },
      { to: '/app/quiz', label: 'Quiz', icon: ListChecks },
      { to: '/app/graph', label: 'Knowledge Graph', icon: Share2 },
    ],
  },
  {
    label: 'Discovery',
    items: [
      { to: '/app/search', label: 'Search', icon: Search },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const activeDoc = documents.find((d) => d.id === activeDocId);

  return (
    <aside className="flex h-full w-60 flex-col border-r border-ink-100/80 bg-paper-200/60">
      <div className="flex h-14 items-center px-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Logo size={28} withWordmark />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="mb-1.5 px-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-300">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      classNames(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-crimson-50 text-crimson-700'
                          : 'text-ink-500 hover:bg-paper-300/60 hover:text-ink-700'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-crimson-500"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon
                          size={18}
                          strokeWidth={1.75}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100/80 p-3">
        {activeDoc ? (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/app/workspace')}
            className="w-full rounded-lg bg-paper-50 border border-ink-100 p-3 text-left transition-all hover:border-ink-200 hover:shadow-soft"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-1 rounded-full shrink-0"
                style={{ backgroundColor: activeDoc.accent }}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink-700">{activeDoc.name}</p>
                <p className="text-2xs text-ink-400">{activeDoc.pages} pages</p>
              </div>
            </div>
          </motion.button>
        ) : (
          <div className="rounded-lg border border-dashed border-ink-200 p-3 text-center">
            <p className="text-2xs text-ink-400">No document selected</p>
          </div>
        )}
        <div className="mt-3 flex items-center gap-1">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-2xs text-ink-400 transition-colors hover:bg-paper-300/60 hover:text-ink-600">
            <Settings size={13} /> Settings
          </button>
          <button className="flex items-center justify-center rounded-lg px-2 py-1.5 text-2xs text-ink-400 transition-colors hover:bg-paper-300/60 hover:text-ink-600">
            <HelpCircle size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
