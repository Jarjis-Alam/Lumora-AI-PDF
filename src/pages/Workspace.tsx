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
      <div className="h-full overflow-y-auto paper-texture">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
              <FileText size={28} strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-ink-800">Workspace</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
              Select a document to open the full workspace — PDF viewer, AI chat, summaries,
              flashcards, quizzes, and knowledge graph in one place.
            </p>
          </motion.div>

          {/* Document picker */}
          {readyDocs.length > 0 ? (
            <div>
              <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                Open a document
              </p>
              <div className="space-y-2">
                {readyDocs.slice(0, 5).map((d) => (
                  <motion.button
                    key={d.id}
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      openDocument(d.id);
                    }}
                    className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-left transition-colors hover:border-ink-200 hover:bg-paper-100"
                  >
                    <div className="h-8 w-1 rounded-full" style={{ backgroundColor: d.accent }} />
                    <FileText size={15} className="text-ink-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-700">{d.name}</p>
                      <p className="text-2xs text-ink-400">
                        {d.pages} pages
                        {d.lastOpenedAt ? ` · ${timeAgo(d.lastOpenedAt)}` : ''}
                      </p>
                    </div>
                    <ArrowRight size={15} className="text-ink-300 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-ink-200 bg-paper-50/50 p-8 text-center">
              <p className="text-sm text-ink-500">Upload a document to start working.</p>
              <button onClick={() => navigate('/app')} className="btn-primary mt-4">
                Browse Documents
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-paper-100 select-none">
      {/* Top bar / Breadcrumbs */}
      <div className="flex h-11 items-center justify-between border-b border-ink-100/40 bg-paper-50/80 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1 text-ink-400 hover:text-ink-700 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Library</span>
          </button>
          <ChevronRight size={10} className="text-ink-300" />
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: doc.accent }} />
            <span className="truncate font-medium text-ink-700">{doc.name}</span>
          </div>
          <span className="text-[10px] text-ink-400 px-1.5 py-0.5 rounded bg-paper-200">{doc.pages} pages</span>
        </div>

        <div className="flex items-center gap-2">
          {doc.status === 'processing' && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 rounded-full px-2 py-0.5 text-[10px] font-medium text-amber-700">
              <Cpu size={10} className="animate-pulse" />
              <span>Analyzing ({Math.round(doc.progress)}%)</span>
            </div>
          )}
          <Tooltip label="Expand Knowledge Graph" position="bottom">
            <button
              onClick={() => setWorkspaceTab('graph')}
              className="btn-ghost btn-sm border border-ink-100/40 bg-paper-50"
            >
              <Share2 size={13} />
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

        {/* Right Side: Tabbed workspace panel */}
        <div className="flex flex-col overflow-hidden bg-paper-50" style={{ width: `${panels.sizes.right}%` }}>
          {/* Workspace Tabs Header */}
          <div className="flex h-11 items-center border-b border-ink-100/40 bg-paper-100/50 px-2 gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = workspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setWorkspaceTab(tab.id)}
                  className={`group relative flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                    active ? 'text-crimson-800' : 'text-ink-500 hover:bg-paper-200/50 hover:text-ink-800'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="workspace-active-tab"
                      className="absolute inset-0 rounded bg-crimson-50"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={13}
                    className={`relative z-10 transition-transform duration-200 ${
                      active ? 'text-crimson-600' : 'text-ink-400 group-hover:scale-105'
                    }`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={workspaceTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
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
    <div className="flex h-full flex-col bg-paper-50 p-4">
      <div className="mb-3">
        <h3 className="font-serif text-sm font-semibold text-ink-800 mb-1">Search in Document</h3>
        <p className="text-[10px] text-ink-400">Search by meaning across pages of {doc?.name}.</p>
      </div>

      <div className="relative mb-4">
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-paper-100 p-1.5 transition-colors focus-within:border-crimson-300">
          <Search size={14} className="ml-1 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search ideas... e.g. self-attention"
            className="flex-1 bg-transparent px-1 py-1 text-xs text-ink-700 placeholder:text-ink-300 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || searching}
            className="btn-primary btn-sm rounded px-3 py-1 text-[11px]"
          >
            {searching ? (
              <span className="flex gap-0.5">
                <span className="h-1 w-1 bg-white rounded-full animate-pulse-soft" />
                <span className="h-1 w-1 bg-white rounded-full animate-pulse-soft" style={{ animationDelay: '150ms' }} />
                <span className="h-1 w-1 bg-white rounded-full animate-pulse-soft" style={{ animationDelay: '300ms' }} />
              </span>
            ) : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
        {searching && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card p-3 space-y-2">
                <div className="skeleton h-3 w-1/4" />
                <div className="skeleton h-3.5 w-full" />
                <div className="skeleton h-3.5 w-5/6" />
              </div>
            ))}
          </div>
        )}

        {results && results.length === 0 && !searching && (
          <div className="text-center py-10 text-xs text-ink-400">No semantic matches found.</div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-ink-400 px-1">{results.length} matches found</p>
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => jumpTo(r)}
                className="card w-full p-3 text-left hover:border-crimson-300 hover:bg-crimson-50/10 transition-all flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[10px] text-ink-400">
                  <span className="font-semibold text-crimson-700">p. {r.page} · Paragraph {r.paragraph + 1}</span>
                  <span className="text-2xs font-semibold px-1 py-0.5 rounded bg-crimson-50 text-crimson-600">
                    {(r.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed font-body">{r.text}</p>
              </button>
            ))}
          </div>
        )}

        {!results && !searching && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-ink-400">
            <Sparkles size={24} className="text-crimson-500/50 mb-2 animate-breathe" />
            <p className="text-xs">Type a question or term to find relevant paragraphs in this document.</p>
          </div>
        )}
      </div>
    </div>
  );
}
