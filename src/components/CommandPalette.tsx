import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, MessageSquare, AlignLeft, Layers, ListChecks, Share2, HelpCircle, CornerDownLeft } from 'lucide-react';
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
    { label: 'Go to Library', icon: FileText, action: () => navigate('/app') },
    ...(activeDocId
      ? [
          { label: 'Open AI Chat', icon: MessageSquare, action: () => { setWorkspaceTab('chat'); navigate('/app/workspace'); } },
          { label: 'Open Summaries', icon: AlignLeft, action: () => { setWorkspaceTab('summary'); navigate('/app/workspace'); } },
          { label: 'Open Flashcards', icon: Layers, action: () => { setWorkspaceTab('flashcards'); navigate('/app/workspace'); } },
          { label: 'Open Quiz', icon: ListChecks, action: () => { setWorkspaceTab('quiz'); navigate('/app/workspace'); } },
          { label: 'Open Concept Graph', icon: Share2, action: () => { setWorkspaceTab('graph'); navigate('/app/workspace'); } },
        ]
      : []),
  ];

  const documentCommands = readyDocs.map((doc) => ({
    label: `Open: ${doc.name}`,
    icon: FileText,
    action: () => {
      openDocument(doc.id);
      setWorkspaceTab('chat');
      navigate('/app/workspace');
    },
  }));

  const allCommands = [...navigationCommands, ...documentCommands];

  const filtered = allCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
          />

          {/* Palette container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-ink-200 bg-paper-50 shadow-lift flex flex-col max-h-[380px]"
          >
            {/* Input */}
            <div className="flex h-12 items-center border-b border-ink-100 bg-white px-4 gap-2">
              <Search size={16} className="text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands or documents... (Ctrl+K to toggle)"
                className="flex-1 bg-transparent text-xs text-ink-800 focus:outline-none placeholder:text-ink-300"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  const selected = i === selectedIndex;
                  return (
                    <button
                      key={cmd.label}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        selected ? 'bg-crimson-50 text-crimson-800' : 'text-ink-600 hover:bg-paper-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={14} className={selected ? 'text-crimson-600' : 'text-ink-400'} />
                        <span className="truncate font-medium">{cmd.label}</span>
                      </div>
                      {selected && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-crimson-500 uppercase">
                          <span>Select</span>
                          <CornerDownLeft size={8} strokeWidth={2.5} />
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-ink-400 flex flex-col items-center justify-center gap-1.5">
                  <HelpCircle size={20} className="text-ink-300/80" />
                  <span>No matching commands or files</span>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between border-t border-ink-100 bg-paper-100 px-4 py-2 text-[9px] font-medium text-ink-400 uppercase tracking-wider">
              <span>Use ↑↓ arrows to navigate</span>
              <span>Esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
