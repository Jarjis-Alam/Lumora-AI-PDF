import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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
  ChevronDown,
  Clock,
  Star,
  BookOpen,
  TrendingUp,
  HardDrive,
  Plus,
} from 'lucide-react';
import { Logo } from './Logo';
import { useStore, type WorkspaceTab } from '../store';
import { classNames, timeAgo } from '../lib/utils';
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
  const openDocument = useStore((s) => s.openDocument);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);
  
  const [recentExpanded, setRecentExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  
  const activeDoc = documents.find((d) => d.id === activeDocId);
  
  // Get recent documents (last 3 opened)
  const recentDocs = [...documents]
    .filter((d) => d.status === 'ready' && d.lastOpenedAt)
    .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
    .slice(0, 3);
  
  // Calculate storage used (mock - could be real implementation)
  const totalSize = documents.reduce((sum, d) => sum + d.size, 0);
  const storageUsedMB = (totalSize / (1024 * 1024)).toFixed(1);
  const storagePercent = Math.min((totalSize / (100 * 1024 * 1024)) * 100, 100); // out of 100MB

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    setMobileMenuOpen(false);
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
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-ink-200/60 bg-gradient-to-b from-paper-50 via-paper-100 to-paper-50 shadow-[0_10px_40px_rgba(28,27,25,0.06)]">
      {/* Header */}
      <div className="relative border-b border-ink-200/60 bg-paper-50/90 px-4 py-4 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top_left,_rgba(192,57,43,0.10),_transparent_50%)]" />
        <div className="relative flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 transition-all hover:opacity-80"
          >
            <Logo size={28} withWordmark />
          </button>
          <Tooltip label="Upload Document" position="right">
            <button 
              onClick={() => navigate('/app')}
              className="rounded-lg border border-ink-200/60 bg-paper-50 p-2 text-crimson-600 shadow-soft transition-all hover:border-crimson-300 hover:bg-crimson-50"
            >
              <Plus size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 no-scrollbar">
        
        {/* Quick Access Tools */}
        <div className="rounded-[1.25rem] border border-ink-200/60 bg-paper-50/70 p-2 shadow-soft">
          <button
            onClick={() => setToolsExpanded(!toolsExpanded)}
            className="flex w-full items-center justify-between px-2 py-1.5 text-2xs font-bold uppercase tracking-wider text-ink-400 transition-colors hover:text-ink-600"
          >
            <span>Quick Access</span>
            <ChevronDown 
              size={12} 
              className={classNames(
                'transition-transform duration-200',
                toolsExpanded ? 'rotate-0' : '-rotate-90'
              )}
            />
          </button>
          
          <AnimatePresence initial={false}>
            {toolsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5 overflow-hidden"
              >
                {NAV_SECTIONS.flatMap((section) => section.items).map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item);
                  const badge = getBadgeValue(item);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={(e) => handleItemClick(e, item)}
                      className={classNames(
                        'group relative flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-xs font-medium transition-all duration-200',
                        isActive
                          ? 'border-crimson-200/70 bg-gradient-to-r from-crimson-50 to-crimson-50/50 text-crimson-800 shadow-soft'
                          : 'text-ink-600 hover:border-ink-200 hover:bg-paper-200/80 hover:text-ink-900'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-crimson-600 to-crimson-500"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={classNames(
                            'transition-all duration-200',
                            isActive ? 'text-crimson-600 scale-110' : 'text-ink-500 group-hover:scale-105 group-hover:text-ink-700'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {badge !== null && (
                        <span className={classNames(
                          'badge text-[10px]',
                          isActive 
                            ? 'badge-primary' 
                            : 'badge-secondary'
                        )}>
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Documents */}
        {recentDocs.length > 0 && (
          <div className="rounded-[1.25rem] border border-ink-200/60 bg-paper-50/70 p-2 shadow-soft">
            <button
              onClick={() => setRecentExpanded(!recentExpanded)}
              className="flex w-full items-center justify-between px-2 py-1.5 text-2xs font-bold uppercase tracking-wider text-ink-400 transition-colors hover:text-ink-600"
            >
              <div className="flex items-center gap-1.5">
                <Clock size={11} />
                <span>Recent</span>
              </div>
              <ChevronDown 
                size={12} 
                className={classNames(
                  'transition-transform duration-200',
                  recentExpanded ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
            
            <AnimatePresence initial={false}>
              {recentExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {recentDocs.map((doc) => (
                    <motion.button
                      key={doc.id}
                      onClick={() => openDocument(doc.id)}
                      whileHover={{ x: 2 }}
                      className={classNames(
                        'group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-200',
                        activeDocId === doc.id
                          ? 'border-crimson-200 bg-crimson-50/60 shadow-soft'
                          : 'border-transparent bg-paper-200/40 hover:border-ink-200 hover:bg-paper-200 hover:shadow-soft'
                      )}
                    >
                      <div 
                        className="h-8 w-1 shrink-0 rounded-full shadow-soft" 
                        style={{ backgroundColor: doc.accent }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={classNames(
                          'truncate text-xs font-semibold leading-tight mb-0.5',
                          activeDocId === doc.id ? 'text-crimson-800' : 'text-ink-700'
                        )}>
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 text-2xs text-ink-400">
                          <span>{doc.pages} pages</span>
                          <span>•</span>
                          <span>{timeAgo(doc.lastOpenedAt || doc.uploadedAt)}</span>
                        </div>
                      </div>
                      <FileText size={14} className={classNames(
                        'shrink-0 transition-colors',
                        activeDocId === doc.id ? 'text-crimson-600' : 'text-ink-400'
                      )} />
                    </motion.button>
                  ))}
                  
                  <button
                    onClick={() => navigate('/app')}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-200 bg-transparent py-2 text-2xs font-medium text-ink-500 transition-all hover:border-ink-300 hover:bg-paper-200/60 hover:text-ink-700"
                  >
                    <BookOpen size={12} />
                    View All Documents
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Study Progress (if active doc) */}
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.25rem] border border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-3 shadow-soft"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-crimson-600" />
              <span className="text-2xs font-bold uppercase tracking-wider text-ink-500">Study Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-ink-500">Flashcards</span>
                <span className="font-semibold text-ink-700">{activeDoc.flashcards.length}</span>
              </div>
              <div className="flex items-center justify-between text-2xs">
                <span className="text-ink-500">Quiz Questions</span>
                <span className="font-semibold text-ink-700">{activeDoc.quiz.length}</span>
              </div>
              <div className="flex items-center justify-between text-2xs">
                <span className="text-ink-500">Chat Messages</span>
                <span className="font-semibold text-ink-700">{activeDoc.chat.length}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Storage Indicator */}
        {documents.length > 0 && (
          <div className="rounded-[1.25rem] border border-ink-200/60 bg-paper-50/80 p-3 shadow-soft">
            <div className="mb-2 flex items-center gap-1.5">
              <HardDrive size={12} className="text-ink-500" />
              <span className="text-2xs font-bold uppercase tracking-wider text-ink-500">Storage</span>
            </div>
            <div className="mb-2">
              <div className="progress-bar h-1.5">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-2xs text-ink-500">
              <span>{storageUsedMB} MB used</span>
              <span>{documents.length} docs</span>
            </div>
          </div>
        )}
      </nav>

      {/* Active Document Footer */}
      <div className="border-t border-ink-200/60 bg-paper-50/90 p-3 backdrop-blur-xl">
        {activeDoc ? (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/app/workspace')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-[1.1rem] border border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-3 text-left shadow-soft transition-all hover:border-crimson-300 hover:shadow-card"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-10 w-1.5 shrink-0 rounded-full shadow-soft"
                style={{ backgroundColor: activeDoc.accent }}
              />
              <div className="min-w-0 flex-1">
                <p className="mb-1 truncate text-xs font-bold text-ink-800">{activeDoc.name}</p>
                <div className="flex items-center gap-2 text-2xs text-ink-500">
                  <span>{activeDoc.pages} pages</span>
                  {activeDoc.status === 'ready' && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="status-ready" />
                        Ready
                      </span>
                    </>
                  )}
                  {activeDoc.status === 'processing' && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="status-processing" />
                        {Math.round(activeDoc.progress)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ) : (
          <div className="rounded-[1.1rem] border border-dashed border-ink-200/80 bg-paper-200/40 p-3 text-center">
            <FileText size={20} className="mx-auto mb-1 text-ink-300" />
            <p className="text-2xs font-medium text-ink-400">No document active</p>
          </div>
        )}
        
        <div className="mt-3 flex items-center gap-2">
          <Tooltip label="Settings" position="top">
            <button className="btn-icon flex-1 border border-ink-200/50 bg-paper-50">
              <Settings size={13} />
            </button>
          </Tooltip>
          <Tooltip label="Help & Support" position="top">
            <button className="btn-icon border border-ink-200/50 bg-paper-50">
              <HelpCircle size={13} />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
