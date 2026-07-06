import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  AlignLeft,
  Layers,
  ListChecks,
  Share2,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { UploadZone } from '../components/UploadZone';
import { DocumentCard } from '../components/DocumentCard';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../store';
import { timeAgo } from '../lib/utils';

const QUICK_ACTIONS = [
  { icon: AlignLeft, label: 'Generate Summary', desc: 'Chapter-level takeaways', view: 'summary' as const, color: '#C0392B' },
  { icon: MessageSquare, label: 'Open Chat', desc: 'Ask questions with citations', view: 'chat' as const, color: '#4A6FA5' },
  { icon: Layers, label: 'Create Flashcards', desc: 'Auto-generated study cards', view: 'flashcards' as const, color: '#6B8E6F' },
  { icon: ListChecks, label: 'Generate Quiz', desc: 'Test your understanding', view: 'quiz' as const, color: '#B8893A' },
  { icon: Share2, label: 'Knowledge Graph', desc: 'Explore concept connections', view: 'graph' as const, color: '#7A5C8F' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const documents = useStore((s) => s.documents);
  const activeDocId = useStore((s) => s.activeDocId);
  const setView = useStore((s) => s.setView);
  const openDocument = useStore((s) => s.openDocument);

  const readyDocs = documents.filter((d) => d.status === 'ready');
  const recentDocs = [...documents].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 6);
  const continueReading = readyDocs
    .filter((d) => d.lastOpenedAt)
    .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
    .slice(0, 3);
  const hasActiveDoc = !!activeDocId;
  const activeDoc = documents.find((d) => d.id === activeDocId);

  const handleOpen = (id: string) => {
    openDocument(id);
    navigate('/app/workspace');
  };

  return (
    <div className="h-full overflow-y-auto paper-texture">
      <div className="mx-auto max-w-6xl px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-editorial text-ink-800">
            Your Research Workspace
          </h1>
          <p className="mt-1.5 text-ink-500">Upload a document and start learning.</p>
        </motion.div>

        {/* Upload + Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2"
          >
            <UploadZone />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5"
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-ink-800">Quick Actions</h3>
              {hasActiveDoc ? (
                <span className="flex items-center gap-1 text-2xs text-sage">
                  <CheckCircle2 size={11} /> Active doc
                </span>
              ) : (
                <span className="text-2xs text-ink-400">Select a document</span>
              )}
            </div>
            {activeDoc && (
              <p className="mb-3 truncate text-2xs text-ink-400">
                Using: <span className="font-medium text-ink-600">{activeDoc.name}</span>
              </p>
            )}
            <div className="space-y-2">
              {QUICK_ACTIONS.map((a, i) => {
                const Icon = a.icon;
                const disabled = !hasActiveDoc;
                return (
                  <motion.button
                    key={a.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    disabled={disabled}
                    onClick={() => {
                      setView(a.view);
                      navigate(`/app/${a.view}`);
                    }}
                    whileHover={!disabled ? { x: 2 } : undefined}
                    className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-3 py-2.5 text-left transition-all hover:border-ink-200 hover:bg-paper-200/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${a.color}15`, color: a.color }}
                    >
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink-700">{a.label}</p>
                      <p className="text-2xs text-ink-400">{a.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-ink-300 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Clock size={16} className="text-ink-400" />
              <h2 className="font-serif text-lg font-semibold text-ink-800">Continue Reading</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continueReading.map((doc, i) => (
                <DocumentCard key={doc.id} doc={doc} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Uploads */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-800">Recent Documents</h2>
            {documents.length > 0 && (
              <span className="text-2xs text-ink-400">{documents.length} total</span>
            )}
          </div>
          {recentDocs.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No documents yet"
              description="Upload your first PDF to start chatting, summarizing, and learning."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentDocs.map((doc, i) => (
                <DocumentCard key={doc.id} doc={doc} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Recent activity strip */}
        {readyDocs.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-lg font-semibold text-ink-800">Recent Activity</h2>
            <div className="card divide-y divide-ink-100/70">
              {readyDocs.slice(0, 4).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleOpen(doc.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-paper-200/40"
                >
                  <div className="h-1 w-8 rounded-full" style={{ backgroundColor: doc.accent }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-700">{doc.name}</p>
                    <p className="text-2xs text-ink-400">
                      {doc.flashcards.length} flashcards · {doc.quiz.length} quiz questions ·{' '}
                      {doc.graph ? `${doc.graph.nodes.length} concepts` : 'no graph'}
                    </p>
                  </div>
                  <span className="text-2xs text-ink-400">{timeAgo(doc.uploadedAt)}</span>
                  <ArrowRight size={14} className="text-ink-300" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
