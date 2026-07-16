import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  AlignLeft, 
  Layers, 
  ListChecks, 
  Share2, 
  HelpCircle, 
  CornerDownLeft,
  Command,
  Clock,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { useStore } from '../store';

export function CommandPalette() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const openDocument = useStore((s) => s.openDocument);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery('');
        setSelectedIndex(0);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const readyDocs = documents.filter((d) => d.status === 'ready');

  const navigationCommands = [
    { label: 'Go to Library', icon: FileText, action: () => navigate('/app'), category: 'Navigation', badge: 'Home' },
    { label: 'Search All Documents', icon: Search, action: () => navigate('/app/search'), category: 'Navigation', badge: 'Search' },
    ...(activeDocId
      ? [
          { label: 'Open AI Chat', icon: MessageSquare, action: () => { setWorkspaceTab('chat'); navigate('/app/workspace'); }, category: 'Workspace', badge: 'Chat' },
          { label: 'View Summary', icon: AlignLeft, action: () => { setWorkspaceTab('summary'); navigate('/app/workspace'); }, category: 'Workspace', badge: 'Summary' },
          { label: 'Study Flashcards', icon: Layers, action: () => { setWorkspaceTab('flashcards'); navigate('/app/workspace'); }, category: 'Workspace', badge: 'Study' },
          { label: 'Take Quiz', icon: ListChecks, action: () => { setWorkspaceTab('quiz'); navigate('/app/workspace'); }, category: 'Workspace', badge: 'Quiz' },
          { label: 'Explore Knowledge Graph', icon: Share2, action: () => { setWorkspaceTab('graph'); navigate('/app/workspace'); }, category: 'Workspace', badge: 'Graph' },
        ]
      : []),
  ];

  const documentCommands = readyDocs.map((doc) => ({
    label: doc.name,
    icon: FileText,
    action: () => {
      openDocument(doc.id);
      setWorkspaceTab('chat');
      navigate('/app/workspace');
      addRecentAction(`Open: ${doc.name}`);
    },
    category: 'Documents',
    badge: `${doc.pages}p`,
  }));

  const allCommands = [...navigationCommands, ...documentCommands];

  const addRecentAction = (label: string) => {
    setRecentActions((prev) => {
      const filtered = prev.filter((a) => a !== label);
      return [label, ...filtered].slice(0, 5);
    });
  };

  const filtered = allCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    (cmd.category && cmd.category.toLowerCase().includes(query.toLowerCase()))
  );

  // Group commands by category
  const groupedCommands = filtered.reduce((acc, cmd) => {
    const category = cmd.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const recentCommands = allCommands.filter((cmd) => 
    recentActions.some((action) => cmd.label.includes(action) || action.includes(cmd.label))
  ).slice(0, 3);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-gradient-to-b from-ink-950/60 to-ink-950/40 backdrop-blur-md"
          />

          {/* Enhanced Palette container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 shadow-paper-lg flex flex-col max-h-[500px]"
          >
            {/* Header with enhanced input */}
            <div className="relative border-b-2 border-ink-200/60 bg-paper-50/95 backdrop-blur-lg">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-500 to-crimson-600 text-white shadow-soft">
                  <Command size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-ink-200/60 bg-white px-4 py-2.5 shadow-soft transition-all focus-within:border-crimson-400 focus-within:shadow-card">
                    <Search size={18} className="text-ink-400" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search commands, documents, or actions..."
                      className="flex-1 bg-transparent text-sm font-medium text-ink-900 focus:outline-none placeholder:text-ink-400"
                    />
                    {query && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuery('')}
                        className="rounded-lg bg-ink-100 px-2 py-1 text-2xs font-bold text-ink-600 hover:bg-ink-200"
                      >
                        Clear
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3 px-5 pb-3 text-xs">
                <span className="flex items-center gap-1.5 text-ink-500">
                  <Zap size={12} className="text-crimson-600" />
                  <span className="font-semibold">{filtered.length}</span> results
                </span>
                {recentCommands.length > 0 && !query && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-ink-300" />
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <Clock size={12} className="text-blue-600" />
                      <span className="font-semibold">{recentCommands.length}</span> recent
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Recent commands when no query */}
              {!query && recentCommands.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <Clock size={14} className="text-ink-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-600">Recent</h3>
                  </div>
                  <div className="space-y-1">
                    {recentCommands.map((cmd, i) => {
                      const Icon = cmd.icon;
                      return (
                        <motion.button
                          key={cmd.label}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => {
                            cmd.action();
                            setOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl border-2 border-blue-200/60 bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 py-2.5 text-left transition-all hover:border-blue-300 hover:shadow-soft"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                              <Icon size={16} />
                            </div>
                            <span className="truncate text-sm font-semibold text-ink-900">{cmd.label}</span>
                          </div>
                          <span className="chip chip-secondary text-2xs">{cmd.badge}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grouped commands */}
              {query && filtered.length > 0 ? (
                Object.entries(groupedCommands).map(([category, commands], categoryIndex) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <Sparkles size={14} className="text-crimson-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink-600">{category}</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-ink-200 to-transparent" />
                    </div>
                    <div className="space-y-1">
                      {commands.map((cmd, i) => {
                        const Icon = cmd.icon;
                        const globalIndex = filtered.indexOf(cmd);
                        const selected = globalIndex === selectedIndex;
                        return (
                          <motion.button
                            key={cmd.label}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: categoryIndex * 0.1 + i * 0.03 }}
                            onClick={() => {
                              cmd.action();
                              addRecentAction(cmd.label);
                              setOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            whileHover={{ x: 4, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                              selected
                                ? 'border-crimson-400 bg-gradient-to-r from-crimson-50 to-crimson-100/50 shadow-soft'
                                : 'border-ink-200/60 bg-paper-50 hover:border-ink-300 hover:bg-paper-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                                selected 
                                  ? 'bg-crimson-500 text-white' 
                                  : 'bg-ink-100 text-ink-600'
                              }`}>
                                <Icon size={16} />
                              </div>
                              <span className={`truncate text-sm font-semibold ${
                                selected ? 'text-crimson-900' : 'text-ink-800'
                              }`}>
                                {cmd.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {cmd.badge && (
                                <span className="chip text-2xs">{cmd.badge}</span>
                              )}
                              {selected && (
                                <span className="flex items-center gap-1 rounded-lg bg-crimson-500 px-2 py-1 text-2xs font-bold text-white">
                                  <CornerDownLeft size={10} />
                                </span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : query && filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                    <HelpCircle size={28} />
                  </div>
                  <p className="text-sm font-semibold text-ink-700">No matching commands</p>
                  <p className="mt-1 text-xs text-ink-500">Try a different search term</p>
                </motion.div>
              ) : null}

              {/* Suggestions when empty */}
              {!query && recentCommands.length === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-600">Quick Actions</h3>
                  </div>
                  <div className="space-y-1">
                    {navigationCommands.slice(0, 4).map((cmd, i) => {
                      const Icon = cmd.icon;
                      return (
                        <motion.button
                          key={cmd.label}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => {
                            cmd.action();
                            addRecentAction(cmd.label);
                            setOpen(false);
                          }}
                          whileHover={{ x: 4, scale: 1.01 }}
                          className="flex w-full items-center justify-between rounded-xl border-2 border-ink-200/60 bg-paper-50 px-4 py-2.5 text-left transition-all hover:border-ink-300 hover:bg-paper-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                              <Icon size={16} />
                            </div>
                            <span className="text-sm font-semibold text-ink-800">{cmd.label}</span>
                          </div>
                          {cmd.badge && <span className="chip text-2xs">{cmd.badge}</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced footer with keyboard hints */}
            <div className="border-t-2 border-ink-200/60 bg-gradient-to-r from-paper-100 to-paper-50 px-5 py-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-ink-600">
                    <span className="kbd-key">↑</span>
                    <span className="kbd-key">↓</span>
                    <span className="font-medium">Navigate</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-600">
                    <span className="kbd-key">↵</span>
                    <span className="font-medium">Select</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-600">
                    <span className="kbd-key">Esc</span>
                    <span className="font-medium">Close</span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-ink-500">
                  <Command size={12} />
                  <span className="font-semibold">⌘K</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
