import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { useStore, type WorkspaceTab } from '../store';
import { classNames } from '../lib/utils';
import { Tooltip } from './Tooltip';

interface NavItem {
  to: string;
  label: string;
  icon: typeof FileText;
  exact?: boolean;
  tab?: WorkspaceTab;
}

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/app', label: 'Documents', icon: FileText, exact: true },
      { to: '/app/chat', label: 'AI Chat', icon: MessageSquare, tab: 'chat' as const },
      { to: '/app/summary', label: 'Summaries', icon: AlignLeft, tab: 'summary' as const },
    ],
  },
  {
    label: 'Study',
    items: [
      { to: '/app/flashcards', label: 'Flashcards', icon: Layers, tab: 'flashcards' as const },
      { to: '/app/quiz', label: 'Quiz', icon: ListChecks, tab: 'quiz' as const },
      { to: '/app/graph', label: 'Knowledge Graph', icon: Share2, tab: 'graph' as const },
    ],
  },
  {
    label: 'Discovery',
    items: [
      { to: '/app/search', label: 'Search', icon: Search, tab: 'search' as const },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const workspaceTab = useStore((s) => s.workspaceTab);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  
  const activeDoc = documents.find((d) => d.id === activeDocId);

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.tab) {
      setWorkspaceTab(item.tab);
      if (activeDocId) {
        e.preventDefault();
        navigate('/app/workspace');
      }
    }
  };

  const getBadgeValue = (item: NavItem) => {
    if (item.label === 'Documents') {
      return documents.length > 0 ? documents.length : null;
    }
    if (activeDoc) {
      if (item.tab === 'chat') return activeDoc.chat.length > 0 ? activeDoc.chat.length : null;
      if (item.tab === 'flashcards') return activeDoc.flashcards.length > 0 ? activeDoc.flashcards.length : null;
      if (item.tab === 'quiz') return activeDoc.quiz.length > 0 ? activeDoc.quiz.length : null;
    }
    return null;
  };

  const isItemActive = (item: NavItem) => {
    const isWorkspaceView = location.pathname.startsWith('/app/workspace');
    if (activeDocId && isWorkspaceView) {
      return item.tab === workspaceTab;
    }
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-ink-100/40 bg-paper-100">
      <div className="flex h-14 items-center px-4 border-b border-ink-100/40 bg-paper-50/50">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Logo size={26} withWordmark />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="px-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-300">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const badge = getBadgeValue(item);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={(e) => handleItemClick(e, item)}
                    className={classNames(
                      'group relative flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-crimson-50 text-crimson-800'
                        : 'text-ink-500 hover:bg-paper-200/60 hover:text-ink-800'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-crimson-600"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={15}
                        strokeWidth={isActive ? 2 : 1.75}
                        className={classNames(
                          'transition-transform duration-200 group-hover:scale-105',
                          isActive ? 'text-crimson-600' : 'text-ink-400'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {badge !== null && (
                      <span className={classNames(
                        'flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold border transition-all',
                        isActive 
                          ? 'border-crimson-200 bg-crimson-100/50 text-crimson-800' 
                          : 'border-ink-100 bg-paper-200/70 text-ink-400'
                      )}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100/40 p-3 bg-paper-50/50">
        {activeDoc ? (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/app/workspace')}
            className="w-full rounded-md border border-ink-200/60 bg-paper-50 p-2.5 text-left transition-all hover:border-ink-300 hover:shadow-soft"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-1 rounded-full shrink-0"
                style={{ backgroundColor: activeDoc.accent }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink-700 leading-none mb-0.5">{activeDoc.name}</p>
                <p className="text-[10px] text-ink-400">{activeDoc.pages} pages</p>
              </div>
            </div>
          </motion.button>
        ) : (
          <div className="rounded-md border border-dashed border-ink-200 p-2.5 text-center bg-paper-50/30">
            <p className="text-[10px] text-ink-400">No document active</p>
          </div>
        )}
        <div className="mt-3 flex items-center gap-1">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-100/40 bg-paper-50 py-1.5 text-[11px] text-ink-500 transition-colors hover:bg-paper-200/60 hover:text-ink-700">
            <Settings size={12} /> Settings
          </button>
          <Tooltip label="Help & support" position="top">
            <button className="flex items-center justify-center rounded-md border border-ink-100/40 bg-paper-50 p-1.5 text-ink-500 transition-colors hover:bg-paper-200/60 hover:text-ink-700">
              <HelpCircle size={12} />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
