import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  RefreshCw,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Keyboard,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCw,
} from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { SkeletonFlashcards } from './Skeletons';
import { Tooltip } from './Tooltip';
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

  // Study progress state
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  const doc = documents.find((d) => d.id === docId);
  const cards = shuffled || doc?.flashcards || [];

  const markCard = (id: string, status: 'mastered' | 'review') => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (status === 'mastered') {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    setReviewIds((prev) => {
      const next = new Set(prev);
      if (status === 'review') {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

    // Advance or complete
    if (studyIndex < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => {
        setStudyIndex((i) => i + 1);
      }, 200);
    } else {
      setSessionComplete(true);
    }
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    if (!studyMode || sessionComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses inside input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowLeft') {
        setFlipped(false);
        setStudyIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        setFlipped(false);
        setStudyIndex((i) => Math.min(cards.length - 1, i + 1));
      } else if (e.key === '1' || e.key === 'ArrowUp') {
        e.preventDefault();
        markCard(cards[studyIndex].id, 'review');
      } else if (e.key === '2' || e.key === 'ArrowDown') {
        e.preventDefault();
        markCard(cards[studyIndex].id, 'mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studyMode, studyIndex, cards, sessionComplete]);

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
    return <SkeletonFlashcards />;
  }

  if (doc.flashcards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No flashcards yet"
        description="Generate flashcards from your document to start studying key concepts."
        action={{
          label: 'Generate Flashcards',
          onClick: async () => {
            setGenerating(true);
            try {
              await generateFlashcards(doc.id);
            } finally {
              setGenerating(false);
            }
          },
        }}
      />
    );
  }

  const handleStartStudy = () => {
    setShuffled(null);
    setStudyIndex(0);
    setFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setSessionComplete(false);
    setStudyMode(true);
  };

  if (studyMode) {
    if (sessionComplete) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-6 py-8 bg-paper-50/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full p-6 text-center space-y-5"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-crimson-50 text-crimson-600">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-ink-800">Study Session Complete!</h2>
              <p className="text-xs text-ink-400 mt-1">You reviewed {cards.length} cards from {doc.name}.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 text-center">
                <div className="text-xl font-bold text-emerald-700">{masteredIds.size}</div>
                <div className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Mastered</div>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/30 p-3 text-center">
                <div className="text-xl font-bold text-amber-700">{reviewIds.size}</div>
                <div className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">Need Review</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleStartStudy} className="btn-primary flex-1 btn-sm rounded py-2">
                <RotateCw size={13} /> Study Again
              </button>
              <button
                onClick={() => {
                  setStudyMode(false);
                  setShuffled(null);
                }}
                className="btn-secondary flex-1 btn-sm rounded py-2"
              >
                Exit Session
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    const card = cards[studyIndex];
    const studiedCount = masteredIds.size + reviewIds.size;
    const progressPercent = (studiedCount / cards.length) * 100;

    return (
      <div className="flex h-full flex-col bg-paper-50/30 px-6 py-6 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-6">
          {/* Header & progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-500">
                Card {studyIndex + 1} of {cards.length}
              </span>
              <button
                onClick={() => {
                  setStudyMode(false);
                  setShuffled(null);
                }}
                className="text-ink-400 hover:text-ink-700 flex items-center gap-1 transition-colors font-semibold"
              >
                <X size={13} /> Exit Study
              </button>
            </div>
            <div className="h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-crimson-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Flashcard container */}
          <div className="w-full" style={{ perspective: '1000px' }}>
            <motion.button
              onClick={() => setFlipped((v) => !v)}
              className="relative w-full cursor-pointer text-left block focus:outline-none"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              {/* Front */}
              <div
                className="flex min-h-[260px] flex-col justify-between rounded-xl border border-ink-200/60 bg-paper-50 p-6 shadow-soft"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide2 text-crimson-600 bg-crimson-50 rounded px-1.5 py-0.5 w-fit">Question</span>
                <p className="font-serif text-lg font-semibold leading-relaxed text-ink-800 my-4 text-center">{card.front}</p>
                <span className="text-[10px] text-ink-300 text-center uppercase tracking-wider block">Click or space to flip</span>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 flex min-h-[260px] flex-col justify-between rounded-xl border border-crimson-200/50 bg-crimson-50/20 p-6 shadow-soft"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide2 text-crimson-700 bg-crimson-50 rounded px-1.5 py-0.5 w-fit">Answer</span>
                <p className="text-sm leading-relaxed text-ink-700 my-4 text-center font-body">{card.back}</p>
                <span className="text-[10px] text-ink-400 text-center uppercase tracking-wider block">Click or space to flip back</span>
              </div>
            </motion.button>
          </div>

          {/* Action buttons / study feedback */}
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => markCard(card.id, 'review')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-amber-200 bg-amber-50/50 rounded-lg py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/50 active:scale-[0.98] transition-all"
              >
                <AlertCircle size={14} /> Need Review
              </button>
              <button
                onClick={() => markCard(card.id, 'mastered')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-emerald-200 bg-emerald-50/50 rounded-lg py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50 active:scale-[0.98] transition-all"
              >
                <CheckCircle size={14} /> Mastered
              </button>
            </div>

            <div className="flex items-center justify-between w-full text-[10px] text-ink-400 border-t border-ink-100/30 pt-3">
              <span className="flex items-center gap-1"><Keyboard size={12} /> Keyboard shortcuts:</span>
              <span className="space-x-1.5">
                <span className="px-1 py-0.5 rounded bg-paper-200">Space: flip</span>
                <span className="px-1 py-0.5 rounded bg-paper-200">Arrows: nav</span>
                <span className="px-1 py-0.5 rounded bg-paper-200">1: review</span>
                <span className="px-1 py-0.5 rounded bg-paper-200">2: master</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-paper-50/30">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink-800 tracking-editorial">Flashcards</h2>
            <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide2 mt-0.5">{doc.flashcards.length} cards in this deck</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleStartStudy} className="btn-primary btn-sm rounded px-3 py-1.5 flex items-center gap-1">
              <Play size={11} fill="currentColor" /> Start Deck
            </button>
            <Tooltip label="Regenerate cards">
              <button
                onClick={async () => {
                  setGenerating(true);
                  try {
                    await generateFlashcards(doc.id);
                  } finally {
                    setGenerating(false);
                  }
                }}
                className="btn-secondary btn-sm rounded p-1.5"
              >
                <RefreshCw size={12} />
              </button>
            </Tooltip>
            <button onClick={() => setAdding(true)} className="btn-secondary btn-sm rounded px-2.5 py-1.5 flex items-center gap-1">
              <Plus size={12} /> Add Card
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
              <div className="card p-4 space-y-3">
                <input placeholder="Question (front)" className="input text-xs" id="new-front" />
                <textarea placeholder="Answer (back)" className="input text-xs" rows={2} id="new-back" />
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
                    className="btn-primary btn-sm rounded px-3 py-1.5"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button onClick={() => setAdding(false)} className="btn-ghost btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-3 sm:grid-cols-2">
          {doc.flashcards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card group relative p-4 hover:shadow-card hover:border-ink-200 transition-all flex flex-col justify-between"
            >
              {editingId === card.id ? (
                <div className="space-y-2 w-full">
                  <input
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    className="input text-xs"
                  />
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    className="input text-xs"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => {
                        editFlashcard(doc.id, card.id, { front: editFront, back: editBack });
                        setEditingId(null);
                      }}
                      className="btn-primary btn-sm rounded px-2.5 py-1"
                    >
                      <Check size={11} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-crimson-50 text-crimson-700">Q</span>
                      <span className="text-[10px] text-ink-400">Card {i + 1}</span>
                    </div>
                    <p className="text-xs font-semibold text-ink-700 leading-relaxed">{card.front}</p>
                    <div className="border-t border-ink-100/30 pt-2 space-y-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-ink-100/60 text-ink-600">A</span>
                      <p className="text-xs text-ink-500 leading-relaxed font-body">{card.back}</p>
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 bg-paper-50 rounded border border-ink-100/30 p-0.5 shadow-soft">
                    <Tooltip label="Edit card" position="top">
                      <button
                        onClick={() => {
                          setEditingId(card.id);
                          setEditFront(card.front);
                          setEditBack(card.back);
                        }}
                        className="rounded p-1 text-ink-400 hover:bg-paper-200 hover:text-ink-600"
                      >
                        <Pencil size={11} />
                      </button>
                    </Tooltip>
                    <Tooltip label="Delete card" position="top">
                      <button
                        onClick={() => deleteFlashcard(doc.id, card.id)}
                        className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={11} />
                      </button>
                    </Tooltip>
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
