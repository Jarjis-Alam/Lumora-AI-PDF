import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  FileText,
  ArrowRight,
  BookOpen,
  HelpCircle,
  ListChecks,
  Lightbulb,
} from 'lucide-react';
import { useStore } from '../store';
import { timeAgo } from '../lib/utils';

const SUGGESTED_QUESTIONS = [
  { icon: BookOpen, text: 'Summarize this paper' },
  { icon: HelpCircle, text: 'Explain the methodology' },
  { icon: Lightbulb, text: 'What are the key concepts?' },
  { icon: ListChecks, text: 'Generate flashcards' },
];

import { useEffect } from 'react';

export function ChatPage() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const openDocument = useStore((s) => s.openDocument);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  const doc = documents.find((d) => d.id === activeDocId);
  const readyDocs = documents.filter((d) => d.status === 'ready');

  useEffect(() => {
    if (doc) {
      setWorkspaceTab('chat');
      navigate('/app/workspace', { replace: true });
    }
  }, [doc, navigate, setWorkspaceTab]);

  if (doc) return null;

  return (
    <div className="h-full overflow-y-auto paper-texture">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
            <MessageSquare size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-800">AI Chat</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Ask questions about your documents and get cited, streaming answers.
            Every response links back to the exact page and paragraph.
          </p>
        </motion.div>

        {/* Suggested questions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
            Try asking
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTED_QUESTIONS.map((q, i) => {
              const Icon = q.icon;
              return (
                <motion.div
                  key={q.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-sm text-ink-600"
                >
                  <Icon size={15} className="text-crimson-500" />
                  {q.text}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent documents */}
        {readyDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
              Select a document to start
            </p>
            <div className="space-y-2">
              {readyDocs.slice(0, 5).map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    openDocument(d.id);
                    navigate('/app/chat');
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-left transition-colors hover:border-ink-200 hover:bg-paper-100"
                >
                  <div
                    className="h-8 w-1 rounded-full"
                    style={{ backgroundColor: d.accent }}
                  />
                  <FileText size={15} className="text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-700">{d.name}</p>
                    <p className="text-2xs text-ink-400">
                      {d.pages} pages · {d.chat.length} messages
                      {d.lastOpenedAt ? ` · ${timeAgo(d.lastOpenedAt)}` : ''}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-ink-300 transition-transform group-hover:translate-x-0.5"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {readyDocs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-dashed border-ink-200 bg-paper-50/50 p-8 text-center"
          >
            <Sparkles size={24} className="mx-auto mb-2 text-ink-300" />
            <p className="text-sm text-ink-500">Upload a document to start chatting.</p>
            <button
              onClick={() => navigate('/app')}
              className="btn-primary mt-4"
            >
              Browse Documents
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
