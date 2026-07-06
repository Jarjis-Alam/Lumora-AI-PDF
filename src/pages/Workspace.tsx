import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, FileText, Upload, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { useResizablePanels } from '../lib/resize';
import { PdfViewer } from '../components/PdfViewer';
import { ChatPanel } from '../components/ChatPanel';
import { KnowledgeGraphView } from '../components/KnowledgeGraphView';
import { timeAgo } from '../lib/utils';

export function Workspace() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const bottomTab = useStore((s) => s.bottomTab);
  const setBottomTab = useStore((s) => s.setBottomTab);
  const openDocument = useStore((s) => s.openDocument);
  const readyDocs = documents.filter((d) => d.status === 'ready');

  const [graphFullscreen, setGraphFullscreen] = useState(false);

  const panels = useResizablePanels();

  const doc = documents.find((d) => d.id === activeDocId);

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

          {/* Processing timeline preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-xl border border-ink-100 bg-paper-50 p-5 shadow-soft"
          >
            <p className="mb-4 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
              What happens after you upload
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Upload, label: 'Upload Complete', done: true },
                { icon: Cpu, label: 'Parsing PDF', done: true },
                { icon: Cpu, label: 'Chunking & Embeddings', done: true },
                { icon: AlignLeft, label: 'Summary Ready', done: true },
                { icon: Layers, label: 'Flashcards Ready', done: true },
                { icon: ListChecks, label: 'Quiz Ready', done: true },
                { icon: Share2, label: 'Knowledge Graph Ready', done: true },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage/10 text-sage">
                      <CheckCircle2 size={14} />
                    </div>
                    <Icon size={14} className="text-ink-400" />
                    <span className="text-sm text-ink-600">{step.label}</span>
                  </motion.div>
                );
              })}
            </div>
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
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-10 items-center justify-between border-b border-ink-100/80 bg-paper-50/80 px-4 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <div className="h-1 w-8 rounded-full" style={{ backgroundColor: doc.accent }} />
          <span className="truncate text-sm font-medium text-ink-700">{doc.name}</span>
          <span className="text-2xs text-ink-400">· {doc.pages} pages</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setGraphFullscreen(true)}
            className="btn-ghost btn-sm"
            title="Open knowledge graph"
          >
            <Share2 size={14} /> Graph
          </button>
        </div>
      </div>

      {/* Main 2-panel area */}
      <div
        ref={panels.containerRef}
        className="flex flex-1 overflow-hidden"
        onPointerMove={panels.onPointerMove}
        onPointerUp={panels.onPointerUp}
      >
        {/* PDF Viewer */}
        <div className="overflow-hidden" style={{ width: `${panels.sizes.center}%` }}>
          <PdfViewer />
        </div>

        {/* Resize handle */}
        <div
          className="resize-handle"
          onPointerDown={panels.onPointerDown}
        />

        {/* Chat */}
        <div className="overflow-hidden" style={{ width: `${panels.sizes.right}%` }}>
          <ChatPanel />
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
              <button onClick={() => setGraphFullscreen(false)} className="btn-ghost btn-sm">
                <X size={16} /> Close
              </button>
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
