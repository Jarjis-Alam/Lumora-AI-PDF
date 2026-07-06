import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Shuffle,
  Sparkles,
  FileText,
  ArrowRight,
  RotateCw,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
} from 'lucide-react';
import { useStore } from '../store';
import { FlashcardsPanel } from '../components/FlashcardsPanel';
import { timeAgo } from '../lib/utils';

const SAMPLE_CARD = {
  front: 'What is the main advantage of attention over recurrence?',
  back: 'Attention allows parallel computation across the entire sequence, whereas recurrence forces sequential processing and cannot exploit modern hardware fully.',
};

export function FlashcardsPage() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const openDocument = useStore((s) => s.openDocument);
  const doc = documents.find((d) => d.id === activeDocId);
  const readyDocs = documents.filter((d) => d.status === 'ready');
  const [flipped, setFlipped] = useState(false);

  if (doc) {
    return (
      <div className="h-full overflow-hidden">
        <FlashcardsPanel docId={activeDocId!} />
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
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
            <Layers size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-800">Flashcards</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Lumora auto-generates study cards from any document. Flip to reveal answers,
            shuffle for active recall, and track your accuracy.
          </p>
        </motion.div>

        {/* Sample flashcard preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="mb-3 text-center text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
            Preview
          </p>
          <div className="mx-auto max-w-md" style={{ perspective: 1000 }}>
            <motion.div
              onClick={() => setFlipped((v) => !v)}
              className="relative h-48 cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-crimson-200/60 bg-crimson-50/30 p-6 text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-crimson-500">
                  Question
                </span>
                <p className="font-serif text-base font-medium text-ink-800">
                  {SAMPLE_CARD.front}
                </p>
                <p className="mt-4 text-2xs text-ink-300">Click to flip</p>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-ink-200/60 bg-paper-50 p-6 text-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                  Answer
                </span>
                <p className="text-sm leading-relaxed text-ink-600">{SAMPLE_CARD.back}</p>
              </div>
            </motion.div>
          </div>

          {/* Disabled action buttons */}
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2">
            <button
              disabled
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-paper-50 px-4 py-2 text-sm font-medium text-ink-300 cursor-not-allowed"
            >
              <Sparkles size={14} /> Study
            </button>
            <button
              disabled
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-paper-50 px-4 py-2 text-sm font-medium text-ink-300 cursor-not-allowed"
            >
              <Shuffle size={14} /> Shuffle
            </button>
            <button
              disabled
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-paper-50 px-4 py-2 text-sm font-medium text-ink-300 cursor-not-allowed"
            >
              <RotateCw size={14} /> Generate
            </button>
          </div>
        </motion.div>

        {/* Document picker */}
        {readyDocs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
              Select a document to study
            </p>
            <div className="space-y-2">
              {readyDocs.slice(0, 5).map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    openDocument(d.id);
                    navigate('/app/flashcards');
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-left transition-colors hover:border-ink-200 hover:bg-paper-100"
                >
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: d.accent }} />
                  <FileText size={15} className="text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-700">{d.name}</p>
                    <p className="text-2xs text-ink-400">
                      {d.flashcards.length} flashcards
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
            <p className="text-sm text-ink-500">Upload a document to generate flashcards.</p>
            <button onClick={() => navigate('/app')} className="btn-primary mt-4">
              Browse Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
