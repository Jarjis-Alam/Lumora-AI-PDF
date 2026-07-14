import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlignLeft,
  BookOpen,
  Lightbulb,
  List,
  Sparkles,
  FileText,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useStore } from '../store';
import { timeAgo } from '../lib/utils';

const SUMMARY_CARDS = [
  {
    icon: BookOpen,
    title: 'Overall Summary',
    desc: 'A concise overview of the entire document — themes, structure, and contribution in a few paragraphs.',
    color: '#C0392B',
  },
  {
    icon: AlignLeft,
    title: 'Chapter Summaries',
    desc: 'Section-by-section breakdowns with key arguments and evidence highlighted for each chapter.',
    color: '#4A6FA5',
  },
  {
    icon: Lightbulb,
    title: 'Key Takeaways',
    desc: 'The most important insights distilled into a scannable list of bullet points.',
    color: '#6B8E6F',
  },
  {
    icon: Sparkles,
    title: 'Important Concepts',
    desc: 'Glossary of terms with clear definitions pulled directly from the document.',
    color: '#B8893A',
  },
  {
    icon: List,
    title: 'Bullet Summary',
    desc: 'A rapid-fire summary in bullet form — perfect for last-minute review.',
    color: '#7A5C8F',
  },
];

import { useEffect } from 'react';

export function SummaryPage() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const openDocument = useStore((s) => s.openDocument);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  const doc = documents.find((d) => d.id === activeDocId);
  const readyDocs = documents.filter((d) => d.status === 'ready');

  useEffect(() => {
    if (doc) {
      setWorkspaceTab('summary');
      navigate('/app/workspace', { replace: true });
    }
  }, [doc, navigate, setWorkspaceTab]);

  if (doc) return null;

  return (
    <div className="h-full overflow-y-auto paper-texture">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
            <AlignLeft size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-800">Smart Summaries</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Lumora generates five kinds of summaries from any document — from a high-level
            overview to detailed chapter breakdowns and key takeaways.
          </p>
        </motion.div>

        {/* Summary type cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="mb-10 grid gap-4 sm:grid-cols-2"
        >
          {SUMMARY_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-ink-100 bg-paper-50 p-5 opacity-75 transition-opacity hover:opacity-100"
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  <Icon size={18} strokeWidth={1.6} />
                </div>
                <h3 className="font-serif text-sm font-semibold text-ink-800">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{c.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Document picker */}
        {readyDocs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
              Select a document to generate summaries
            </p>
            <div className="space-y-2">
              {readyDocs.slice(0, 5).map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    openDocument(d.id);
                    navigate('/app/summary');
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-left transition-colors hover:border-ink-200 hover:bg-paper-100"
                >
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: d.accent }} />
                  <FileText size={15} className="text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-700">{d.name}</p>
                    <p className="text-2xs text-ink-400">
                      {d.pages} pages
                      {d.summary ? ` · Summary ready` : ''}
                      {d.lastOpenedAt ? ` · ${timeAgo(d.lastOpenedAt)}` : ''}
                    </p>
                  </div>
                  {d.summary ? (
                    <span className="flex items-center gap-1 text-2xs text-sage">
                      <Clock size={10} /> Available
                    </span>
                  ) : null}
                  <ArrowRight size={15} className="text-ink-300 transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink-200 bg-paper-50/50 p-8 text-center">
            <Sparkles size={24} className="mx-auto mb-2 text-ink-300" />
            <p className="text-sm text-ink-500">Upload a document to generate summaries.</p>
            <button onClick={() => navigate('/app')} className="btn-primary mt-4">
              Browse Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
