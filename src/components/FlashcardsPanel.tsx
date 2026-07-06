import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  RefreshCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { ProcessingOverlay } from './Skeletons';
import { uid } from '../lib/utils';
import type { Flashcard } from '../types';

export function FlashcardsPanel({ docId }: { docId: string | null }) {
  const documents = useStore((s) => s.documents);
  const generateFlashcards = useStore((s) => s.generateFlashcards);
  const editFlashcard = useStore((s) => s.editFlashcard);
  const deleteFlashcard = useStore((s) => s.deleteFlashcard);
  const addFlashcard = useStore((s) => s.addFlashcard);

  const [generating, setGenerating] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState<Flashcard[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [adding, setAdding] = useState(false);

  const doc = documents.find((d) => d.id === docId);
  const cards = shuffled || doc?.flashcards || [];

  if (!docId || !doc) {
    return (
      <EmptyState
        icon={Layers}
        title="No document selected"
        description="Select a document to generate and study flashcards."
      />
    );
  }

  if (generating) {
    return <ProcessingOverlay label="Generating flashcards..." />;
  }

  if (doc.flashcards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No flashcards yet"
        description="Generate flashcards from your document to start studying key concepts."
        action={{
          label: 'Generate Flashcards',
          onClick: () => {
            setGenerating(true);
            setTimeout(() => {
              generateFlashcards(doc.id);
              setGenerating(false);
            }, 1500);
          },
        }}
      />
    );
  }

  if (studyMode) {
    const card = cards[studyIndex];
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-ink-400">
            Card {studyIndex + 1} of {cards.length}
          </span>
          <button
            onClick={() => {
              setStudyMode(false);
              setShuffled(null);
              setFlipped(false);
              setStudyIndex(0);
            }}
            className="btn-ghost btn-sm"
          >
            <X size={14} /> Exit Study
          </button>
        </div>

        <div className="w-full max-w-lg" style={{ perspective: '1000px' }}>
          <motion.button
            onClick={() => setFlipped((v) => !v)}
            className="relative w-full cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div
              className="flex min-h-[280px] flex-col items-center justify-center rounded-xl2 border border-ink-100 bg-paper-50 p-8 text-center shadow-card"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="mb-3 text-2xs font-medium uppercase tracking-wide2 text-crimson-500">Question</span>
              <p className="font-serif text-xl font-medium leading-relaxed text-ink-800">{card.front}</p>
              <span className="mt-4 text-2xs text-ink-300">Click to flip</span>
            </div>
            <div
              className="absolute inset-0 flex min-h-[280px] flex-col items-center justify-center rounded-xl2 border border-crimson-200 bg-crimson-50/40 p-8 text-center shadow-card"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="mb-3 text-2xs font-medium uppercase tracking-wide2 text-crimson-500">Answer</span>
              <p className="text-base leading-relaxed text-ink-700">{card.back}</p>
              <span className="mt-4 text-2xs text-ink-300">Click to flip back</span>
            </div>
          </motion.button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              setFlipped(false);
              setStudyIndex((i) => Math.max(0, i - 1));
            }}
            disabled={studyIndex === 0}
            className="btn-secondary"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={() => {
              setShuffled([...cards].sort(() => Math.random() - 0.5));
            }}
            className="btn-secondary"
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={() => {
              setFlipped(false);
              setStudyIndex((i) => Math.min(cards.length - 1, i + 1));
            }}
            disabled={studyIndex === cards.length - 1}
            className="btn-primary"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink-800">Flashcards</h2>
            <p className="text-2xs text-ink-400">{doc.flashcards.length} cards</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStudyMode(true)} className="btn-primary btn-sm">
              <Layers size={13} /> Study Mode
            </button>
            <button
              onClick={() => {
                setGenerating(true);
                setTimeout(() => {
                  generateFlashcards(doc.id);
                  setGenerating(false);
                }, 1200);
              }}
              className="btn-secondary btn-sm"
            >
              <RefreshCw size={13} /> Regenerate
            </button>
            <button onClick={() => setAdding(true)} className="btn-secondary btn-sm">
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="card p-4">
                <input placeholder="Question (front)" className="input mb-2" id="new-front" />
                <textarea placeholder="Answer (back)" className="input mb-2" rows={2} id="new-back" />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const f = (document.getElementById('new-front') as HTMLInputElement).value;
                      const b = (document.getElementById('new-back') as HTMLTextAreaElement).value;
                      if (f.trim() && b.trim()) {
                        addFlashcard(doc.id, { id: uid('fc'), front: f, back: b });
                        setAdding(false);
                      }
                    }}
                    className="btn-primary btn-sm"
                  >
                    <Check size={13} /> Save
                  </button>
                  <button onClick={() => setAdding(false)} className="btn-ghost btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 sm:grid-cols-2">
          {doc.flashcards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card group relative p-4"
            >
              {editingId === card.id ? (
                <div>
                  <input
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    className="input mb-2 text-sm"
                  />
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    className="input text-sm"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        editFlashcard(doc.id, card.id, { front: editFront, back: editBack });
                        setEditingId(null);
                      }}
                      className="btn-primary btn-sm"
                    >
                      <Check size={12} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="chip bg-crimson-50 text-crimson-600">Q</span>
                    <span className="text-2xs text-ink-300">Card {i + 1}</span>
                  </div>
                  <p className="mb-3 text-sm font-medium text-ink-700">{card.front}</p>
                  <div className="border-t border-ink-100 pt-2">
                    <span className="chip bg-ink-100/60 text-ink-500">A</span>
                    <p className="mt-1.5 text-sm text-ink-500">{card.back}</p>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditingId(card.id);
                        setEditFront(card.front);
                        setEditBack(card.back);
                      }}
                      className="rounded p-1 text-ink-400 hover:bg-paper-200 hover:text-ink-600"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => deleteFlashcard(doc.id, card.id)}
                      className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
