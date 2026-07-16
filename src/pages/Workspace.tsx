import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  AlignLeft,
  Layers,
  ListChecks,
  Share2,
  Search,
  X,
  FileText,
  ArrowRight,
  Cpu,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStore, type WorkspaceTab } from '../store';
import { useResizablePanels } from '../lib/resize';
import { PdfViewer } from '../components/PdfViewer';
import { ChatPanel } from '../components/ChatPanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { FlashcardsPanel } from '../components/FlashcardsPanel';
import { QuizPanel } from '../components/QuizPanel';
import { KnowledgeGraphView } from '../components/KnowledgeGraphView';
import { Tooltip } from '../components/Tooltip';
import { UploadZone } from '../components/UploadZone';
import { timeAgo } from '../lib/utils';

export function Workspace() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const workspaceTab = useStore((s) => s.workspaceTab);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  const openDocument = useStore((s) => s.openDocument);
  const readyDocs = documents.filter((d) => d.status === 'ready');

  const [graphFullscreen, setGraphFullscreen] = useState(false);

  const panels = useResizablePanels();

  const doc = documents.find((d) => d.id === activeDocId);

  // Define tabs configuration
  const tabs = useMemo<Array<{ id: WorkspaceTab; label: string; icon: any }>>(() => [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'summary', label: 'Summary', icon: AlignLeft },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quiz', icon: ListChecks },
    { id: 'graph', label: 'Concept Graph', icon: Share2 },
    { id: 'search', label: 'Search', icon: Search },
  ], []);

  if (!doc) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-paper-50 to-paper-100">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-crimson-500 to-crimson-600 text-white text-4xl shadow-float"
            >
              📄
            </motion.div>
            <h1 className="font-serif text-3xl font-bold text-ink-900 mb-3">
              Upload a Document to Begin
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-600">
              Upload a PDF to unlock AI-powered summaries, interactive flashcards, quizzes, knowledge graphs, and semantic search.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <UploadZone />
          </motion.div>

          {/* Document picker */}
          {readyDocs.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Or continue with recent
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
              </div>
              <div className="space-y-2">
                {readyDocs.slice(0, 5).map((d, idx) => (
                  <motion.button
                    key={d.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.08 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openDocument(d.id)}
                    className="group flex w-full items-center gap-4 rounded-xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 px-4 py-3.5 shadow-soft transition-all hover:border-ink-300 hover:shadow-card"
                  >
                    <div 
                      className="h-10 w-2 rounded-full shadow-soft" 
                      style={{ backgroundColor: d.accent }} 
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ink-100 to-ink-200">
                      <FileText size={18} className="text-ink-600" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-bold text-ink-900">{d.name}</p>
                      <p className="text-xs text-ink-500">
                        {d.pages} pages
                        {d.lastOpenedAt ? ` · ${timeAgo(d.lastOpenedAt)}` : ''}
                      </p>
                    </div>
                    <ArrowRight 
                      size={18} 
                      className="text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-crimson-600" 
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-paper-50 to-paper-100 select-none">
      {/* Enhanced Top bar / Breadcrumbs - Responsive */}
      <div className="flex h-12 items-center justify-between border-b-2 border-ink-200/60 bg-paper-50/95 px-3 sm:px-5 backdrop-blur-lg shadow-soft">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 text-xs overflow-hidden">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-ink-500 transition-all hover:bg-ink-100 hover:text-ink-800 shrink-0"
          >
            <ArrowLeft size={14} />
            <span className="font-semibold hidden sm:inline">Library</span>
          </button>
          <ChevronRight size={12} className="text-ink-300 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 rounded-lg border border-ink-200/60 bg-paper-100 px-2 sm:px-3 py-1.5 shadow-soft overflow-hidden">
            <div className="h-2 w-2 rounded-full shadow-soft shrink-0" style={{ backgroundColor: doc.accent }} />
            <span className="truncate font-semibold text-ink-800 text-xs">{doc.name}</span>
          </div>
          <span className="chip chip-secondary text-2xs hidden lg:inline-block">{doc.pages} pages</span>
        </div>

        <div className="flex items-center gap-2">
          {doc.status === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-amber-200/60 bg-gradient-to-r from-amber-50 to-amber-100/50 px-2 sm:px-3 py-1 sm:py-1.5 shadow-soft"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Cpu size={14} className="text-amber-600" />
              </motion.div>
              <span className="text-xs font-bold text-amber-800 hidden sm:inline">
                Processing {Math.round(doc.progress)}%
              </span>
              <span className="text-xs font-bold text-amber-800 sm:hidden">
                {Math.round(doc.progress)}%
              </span>
            </motion.div>
          )}
          {doc.status === 'ready' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 rounded-full border-2 border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-2 sm:px-3 py-1 sm:py-1.5 shadow-soft"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-800 hidden sm:inline">Ready</span>
            </motion.div>
          )}
          <Tooltip label="Expand Knowledge Graph" position="bottom">
            <button
              onClick={() => setGraphFullscreen(true)}
              className="btn-secondary gap-1.5 text-xs px-2 sm:px-3"
            >
              <Share2 size={14} />
              <span className="hidden lg:inline">Graph</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main split-screen panel area */}
      <div
        ref={panels.containerRef}
        className="flex flex-1 overflow-hidden"
        onPointerMove={panels.onPointerMove}
        onPointerUp={panels.onPointerUp}
      >
        {/* Left Side: PDF Viewer */}
        <div className="overflow-hidden" style={{ width: `${panels.sizes.center}%` }}>
          <PdfViewer />
        </div>

        {/* Resize handle */}
        <div
          className="resize-handle border-l border-r border-ink-100/20"
          onPointerDown={panels.onPointerDown}
        />

        {/* Right Side: Enhanced Tabbed workspace panel */}
        <div className="flex flex-col overflow-hidden bg-gradient-to-br from-paper-50 to-paper-100 border-l-2 border-ink-200/60" style={{ width: `${panels.sizes.right}%` }}>
          {/* Enhanced Workspace Tabs Header */}
          <div className="relative border-b-2 border-ink-200/60 bg-paper-50/95 backdrop-blur-lg">
            <div className="flex h-14 items-center gap-1 overflow-x-auto px-3 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = workspaceTab === tab.id;
                
                // Check if feature is available
                const isAvailable = () => {
                  if (tab.id === 'summary') return !!doc.summary;
                  if (tab.id === 'flashcards') return doc.flashcards.length > 0;
                  if (tab.id === 'quiz') return doc.quiz.length > 0;
                  if (tab.id === 'graph') return !!doc.graph;
                  return true; // chat and search always available
                };
                
                const available = isAvailable();
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setWorkspaceTab(tab.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      active 
                        ? 'text-white' 
                        : available
                        ? 'text-ink-600 hover:text-ink-900'
                        : 'text-ink-400 opacity-60'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="workspace-active-tab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-crimson-500 to-crimson-600 shadow-float"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    {!active && available && (
                      <div className="absolute inset-0 rounded-xl border-2 border-ink-200/60 bg-paper-100 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                    
                    <Icon
                      size={16}
                      className={`relative z-10 transition-transform ${
                        active ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    />
                    <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
                    
                    {available && !active && (
                      <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-soft" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Panel Content with enhanced transitions */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={workspaceTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full overflow-hidden"
              >
                {workspaceTab === 'chat' && <ChatPanel />}
                {workspaceTab === 'summary' && <SummaryPanel docId={activeDocId} />}
                {workspaceTab === 'flashcards' && <FlashcardsPanel docId={activeDocId} />}
                {workspaceTab === 'quiz' && <QuizPanel docId={activeDocId} />}
                {workspaceTab === 'graph' && <KnowledgeGraphView docId={activeDocId} />}
                {workspaceTab === 'search' && <LocalDocSearchTab docId={activeDocId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Graph fullscreen overlay */}
      <AnimatePresence>
        {graphFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-paper-100"
          >
            <div className="flex h-12 items-center justify-between border-b border-ink-100 bg-paper-50 px-4">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-crimson-600" />
                <span className="font-serif text-base font-semibold text-ink-800">Knowledge Graph</span>
                <span className="text-2xs text-ink-400">· {doc.name}</span>
              </div>
              <Tooltip label="Close graph" position="bottom">
                <button onClick={() => setGraphFullscreen(false)} className="btn-ghost btn-sm">
                  <X size={16} /> Close
                </button>
              </Tooltip>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <KnowledgeGraphView docId={activeDocId} fullscreen />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Doc-Specific Local Search Tab                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

const SAMPLE_TEXTS: { text: string; page: number; paragraph: number }[] = [
  { text: 'The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.', page: 2, paragraph: 1 },
  { text: 'Attention functions can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors.', page: 3, paragraph: 0 },
  { text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.', page: 4, paragraph: 2 },
  { text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.', page: 1, paragraph: 2 },
  { text: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.', page: 1, paragraph: 3 },
  { text: 'In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64.', page: 5, paragraph: 1 },
  { text: 'The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S.', page: 3, paragraph: 1 },
  { text: 'On the WMT 2014 English-to-German translation task, the big transformer model outperforms the best previously reported models by more than 2.0 BLEU.', page: 8, paragraph: 0 },
];

function LocalDocSearchTab({ docId }: { docId: string | null }) {
  const documents = useStore((s) => s.documents);
  const setPdfPage = useStore((s) => s.setPdfPage);
  const setPdfHighlight = useStore((s) => s.setPdfHighlight);

  const doc = documents.find((d) => d.id === docId);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || !doc) return;
    setSearching(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 600));

    const qLower = query.toLowerCase();
    const qWords = qLower.split(/\s+/).filter((w) => w.length > 2);
    const scored: any[] = [];

    SAMPLE_TEXTS.forEach((t) => {
      const textLower = t.text.toLowerCase();
      const overlap = qWords.filter((w) => textLower.includes(w)).length;
      const score = Math.min(0.98, 0.55 + (overlap / Math.max(qWords.length, 1)) * 0.4 + Math.random() * 0.1);
      if (overlap > 0 || score > 0.7) {
        scored.push({
          page: t.page,
          paragraph: t.paragraph,
          text: t.text,
          score,
        });
      }
    });

    scored.sort((a, b) => b.score - a.score);
    setResults(scored);
    setSearching(false);
  };

  const jumpTo = (r: any) => {
    setPdfPage(r.page);
    setPdfHighlight({ page: r.page, paragraph: r.paragraph });
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-paper-50 to-paper-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-500 to-crimson-600 text-white shadow-soft">
            <Search size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-ink-900">Document Search</h3>
            <p className="text-xs text-ink-600">Search by meaning in {doc?.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 rounded-xl border-2 border-ink-200/60 bg-paper-100 p-2 shadow-soft transition-all focus-within:border-crimson-400 focus-within:shadow-card">
          <Search size={16} className="ml-2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask a question or search for concepts..."
            className="flex-1 bg-transparent px-2 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || searching}
            className="btn-primary gap-2 disabled:opacity-50"
          >
            {searching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={14} />
                </motion.div>
                Searching
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Search
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {searching && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border-2 border-ink-200/60 bg-paper-50 p-4 space-y-2"
              >
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </motion.div>
            ))}
          </div>
        )}

        {results && results.length === 0 && !searching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
              <Search size={28} />
            </div>
            <p className="text-sm font-semibold text-ink-700">No matches found</p>
            <p className="mt-1 text-xs text-ink-500">Try different keywords or rephrase your query</p>
          </motion.div>
        )}

        {results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-ink-600 px-1">
              Found {results.length} relevant passage{results.length > 1 ? 's' : ''}
            </p>
            {results.map((r, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => jumpTo(r)}
                className="w-full rounded-xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-4 text-left shadow-soft transition-all hover:border-crimson-300 hover:shadow-card"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-crimson-700">
                    Page {r.page} · Paragraph {r.paragraph + 1}
                  </span>
                  <span className="chip chip-success text-2xs">
                    {(r.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-ink-700">{r.text}</p>
              </motion.button>
            ))}
          </motion.div>
        )}

        {!results && !searching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4 text-6xl"
            >
              🔍
            </motion.div>
            <p className="text-sm font-semibold text-ink-700 mb-2">Ready to search</p>
            <p className="max-w-xs text-xs leading-relaxed text-ink-500">
              Enter a question or topic to find relevant passages in this document
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
