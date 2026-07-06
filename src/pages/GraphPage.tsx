import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Share2, FileText, ArrowRight, Sparkles, Network } from 'lucide-react';
import { useStore } from '../store';
import { KnowledgeGraphView } from '../components/KnowledgeGraphView';
import { timeAgo } from '../lib/utils';

const MOCK_NODES = [
  { id: 'n1', label: 'Transformer', x: 50, y: 50, main: true },
  { id: 'n2', label: 'Attention', x: 22, y: 25 },
  { id: 'n3', label: 'Embedding', x: 78, y: 25 },
  { id: 'n4', label: 'Neural Network', x: 22, y: 75 },
  { id: 'n5', label: 'Encoder', x: 78, y: 75 },
  { id: 'n6', label: 'Self-Attention', x: 50, y: 15 },
];

const MOCK_EDGES = [
  ['n1', 'n2'], ['n1', 'n3'], ['n1', 'n4'], ['n1', 'n5'],
  ['n1', 'n6'], ['n2', 'n6'], ['n3', 'n5'], ['n2', 'n4'],
];

export function GraphPage() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const openDocument = useStore((s) => s.openDocument);
  const doc = documents.find((d) => d.id === activeDocId);
  const readyDocs = documents.filter((d) => d.status === 'ready' && d.graph);

  if (doc && doc.graph) {
    return (
      <div className="h-full overflow-hidden">
        <KnowledgeGraphView docId={activeDocId!} fullscreen />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto paper-texture">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
            <Share2 size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-800">Knowledge Graph</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Explore concepts and their relationships in a zoomable, interactive graph.
            Lumora maps how ideas connect across your document.
          </p>
        </motion.div>

        {/* Animated mock graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative mb-8 overflow-hidden rounded-xl border border-ink-100 bg-paper-50 shadow-soft"
          style={{ height: 320 }}
        >
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(192,57,43,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Edges */}
          <svg className="absolute inset-0 h-full w-full">
            {MOCK_EDGES.map(([s, t], i) => {
              const sn = MOCK_NODES.find((n) => n.id === s)!;
              const tn = MOCK_NODES.find((n) => n.id === t)!;
              return (
                <motion.line
                  key={i}
                  x1={`${sn.x}%`}
                  y1={`${sn.y}%`}
                  x2={`${tn.x}%`}
                  y2={`${tn.y}%`}
                  stroke="#C9C6BF"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {MOCK_NODES.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 200 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-soft ${
                  n.main
                    ? 'border-2 border-crimson-400 bg-crimson-50 text-crimson-700'
                    : 'border border-ink-200 bg-paper-50 text-ink-600'
                }`}
              >
                {n.label}
              </motion.div>
            </motion.div>
          ))}

          {/* Overlay message */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-ink-200/60 bg-paper-50/90 px-3 py-1.5 text-2xs text-ink-500 backdrop-blur-sm">
              <Network size={11} className="text-crimson-500" />
              Select a document to generate an interactive knowledge graph
            </div>
          </div>
        </motion.div>

        {/* Document picker */}
        {readyDocs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
              Select a document to explore its graph
            </p>
            <div className="space-y-2">
              {readyDocs.slice(0, 5).map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    openDocument(d.id);
                    navigate('/app/graph');
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-left transition-colors hover:border-ink-200 hover:bg-paper-100"
                >
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: d.accent }} />
                  <FileText size={15} className="text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-700">{d.name}</p>
                    <p className="text-2xs text-ink-400">
                      {d.graph?.nodes.length || 0} concepts · {d.graph?.edges.length || 0} connections
                      {d.lastOpenedAt ? ` · ${timeAgo(d.lastOpenedAt)}` : ''}
                    </p>
                  </div>
                  <ArrowRight size={15} className="text-ink-300 transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink-200 bg-paper-50/50 p-8 text-center">
            <Sparkles size={24} className="mx-auto mb-2 text-ink-300" />
            <p className="text-sm text-ink-500">Upload a document to generate a knowledge graph.</p>
            <button onClick={() => navigate('/app')} className="btn-primary mt-4">
              Browse Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
