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
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  const doc = documents.find((d) => d.id === docId);
  const cards = sessionCards;

  const markCard = (id: string, difficulty: 'hard' | 'medium' | 'easy') => {
    const card = sessionCards[studyIndex];
    if (!card) return;

    if (difficulty === 'easy') {
      setMasteredIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } else if (difficulty === 'medium') {
      setReviewIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      // Spaced repetition: review again later in the session (end of queue)
      setSessionCards((prev) => [...prev, card]);
    } else if (difficulty === 'hard') {
      setReviewIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      // Spaced repetition: review again very soon (insert 3 cards down)
      setSessionCards((prev) => {
        const next = [...prev];
        const targetIndex = Math.min(next.length, studyIndex + 4);
        next.splice(targetIndex, 0, card);
        return next;
      });
    }

    // Advance or complete
    if (studyIndex < sessionCards.length - 1) {
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
      } else if (e.key === '1') {
        e.preventDefault();
        markCard(cards[studyIndex].id, 'hard');
      } else if (e.key === '2') {
        e.preventDefault();
        markCard(cards[studyIndex].id, 'medium');
      } else if (e.key === '3') {
        e.preventDefault();
        markCard(cards[studyIndex].id, 'easy');
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
        description="Select a document from the sidebar to generate and study flashcards."
        tips={[
          'Flashcards are auto-generated from key concepts in your document',
          'Use difficulty ratings to focus on challenging material',
          'Track your progress with the completion percentage'
        ]}
        accent="#8B5CF6"
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
        tips={[
          'AI extracts the most important concepts automatically',
          'Each card includes the source page for reference',
          'Cards are organized by difficulty level'
        ]}
        accent="#8B5CF6"
      />
    );
  }

  const handleStartStudy = () => {
    const deck = shuffled || doc?.flashcards || [];
    setSessionCards([...deck]);
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
        <div className="flex h-full flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-paper-50 to-paper-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="card-elevated max-w-md w-full p-8 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-float"
            >
              <CheckCircle size={40} strokeWidth={2} />
            </motion.div>
            
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-serif text-2xl font-bold text-ink-800"
              >
                Study Session Complete!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-sm text-ink-500 mt-2"
              >
                You reviewed <span className="font-semibold text-ink-700">{cards.length} cards</span> from {doc.name}.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 pt-2"
            >
              <div className="rounded-xl border-2 border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-4 text-center shadow-soft">
                <div className="text-3xl font-bold text-emerald-700">{masteredIds.size}</div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">Mastered</div>
              </div>
              <div className="rounded-xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/30 p-4 text-center shadow-soft">
                <div className="text-3xl font-bold text-amber-700">{reviewIds.size}</div>
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Review</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex gap-3 pt-4"
            >
              <button onClick={handleStartStudy} className="btn-primary flex-1 gap-2">
                <RotateCw size={16} /> Study Again
              </button>
              <button
                onClick={() => {
                  setStudyMode(false);
                  setShuffled(null);
                }}
                className="btn-secondary flex-1"
              >
                Exit Session
              </button>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    const card = cards[studyIndex];
    const baseLength = doc?.flashcards.length || 1;
    const progressPercent = Math.min(100, (masteredIds.size / baseLength) * 100);

    return (
      <div className="flex h-full flex-col bg-gradient-to-b from-paper-100 to-paper-200/60 px-6 py-8 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-8">
          {/* Enhanced Header & Progress */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-soft">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-800">
                    Card {studyIndex + 1} of {cards.length}
                  </p>
                  <p className="text-xs text-ink-500">{masteredIds.size} mastered</p>
                </div>
              </div>
              <Tooltip label="Exit study mode (Esc)" position="bottom">
                <button
                  onClick={() => {
                    setStudyMode(false);
                    setShuffled(null);
                  }}
                  className="btn-icon border-2 border-ink-200/60 bg-paper-50"
                >
                  <X size={16} />
                </button>
              </Tooltip>
            </div>
            
            {/* Premium Progress Bar */}
            <div className="relative h-2 w-full bg-ink-100 rounded-full overflow-hidden shadow-inset">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Enhanced Flashcard with 3D flip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
            style={{ perspective: '1200px' }}
          >
            <motion.div
              onClick={() => setFlipped((v) => !v)}
              className="relative w-full h-80 cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-violet-200/60 bg-gradient-to-br from-violet-50 to-violet-100/30 p-8 shadow-paper-lg"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between">
                  <span className="chip chip-primary">Question</span>
                  <span className="text-xs font-semibold text-violet-600">{studyIndex + 1}/{cards.length}</span>
                </div>
                <p className="font-serif text-xl font-bold leading-relaxed text-ink-900 text-center px-4">
                  {card.front}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-ink-400">
                  <Keyboard size={14} />
                  <span>Press <kbd className="kbd-key">Space</kbd> or click to flip</span>
                </div>
              </div>
              
              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/30 p-8 shadow-paper-lg"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="chip chip-success">Answer</span>
                  <span className="text-xs font-semibold text-emerald-600">{studyIndex + 1}/{cards.length}</span>
                </div>
                <p className="text-base leading-relaxed text-ink-700 text-center px-4">
                  {card.back}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-ink-400">
                  <Keyboard size={14} />
                  <span>Press <kbd className="kbd-key">Space</kbd> to flip back</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Difficulty Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                onClick={() => markCard(card.id, 'hard')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 border-2 border-red-200/80 bg-gradient-to-br from-red-50 to-red-100/30 rounded-xl py-4 px-3 text-red-800 hover:shadow-soft transition-all"
              >
                <AlertCircle size={20} />
                <div className="text-center">
                  <div className="text-sm font-bold">Hard</div>
                  <div className="text-2xs text-red-600 mt-0.5">Review soon</div>
                </div>
                <kbd className="kbd-key text-2xs">1</kbd>
              </motion.button>
              
              <motion.button
                onClick={() => markCard(card.id, 'medium')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl py-4 px-3 text-amber-800 hover:shadow-soft transition-all"
              >
                <RefreshCw size={20} />
                <div className="text-center">
                  <div className="text-sm font-bold">Medium</div>
                  <div className="text-2xs text-amber-600 mt-0.5">Review later</div>
                </div>
                <kbd className="kbd-key text-2xs">2</kbd>
              </motion.button>
              
              <motion.button
                onClick={() => markCard(card.id, 'easy')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl py-4 px-3 text-emerald-800 hover:shadow-soft transition-all"
              >
                <CheckCircle size={20} />
                <div className="text-center">
                  <div className="text-sm font-bold">Easy</div>
                  <div className="text-2xs text-emerald-600 mt-0.5">Mastered!</div>
                </div>
                <kbd className="kbd-key text-2xs">3</kbd>
              </motion.button>
            </div>

            {/* Keyboard Shortcuts Guide */}
            <div className="rounded-xl border border-ink-200/60 bg-paper-50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-ink-700">
                  <Keyboard size={14} className="text-violet-600" />
                  Keyboard Shortcuts
                </span>
                <div className="flex items-center gap-2 text-ink-500">
                  <span className="flex items-center gap-1">
                    <kbd className="kbd-key text-2xs">←</kbd>
                    <kbd className="kbd-key text-2xs">→</kbd>
                    Navigate
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="flex items-center gap-1">
                    <kbd className="kbd-key text-2xs">Space</kbd>
                    Flip
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
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
