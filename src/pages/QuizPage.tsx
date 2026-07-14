import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ListChecks,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Brain,
  Trophy,
} from 'lucide-react';
import { useStore } from '../store';
import { timeAgo } from '../lib/utils';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Definitions & basics' },
  { id: 'medium', label: 'Medium', desc: 'Concepts & application' },
  { id: 'hard', label: 'Hard', desc: 'Analysis & synthesis' },
] as const;

const SAMPLE_QUESTIONS = [
  { type: 'MCQ', q: 'Which property of attention makes it suitable for parallel training?', preview: '4 options' },
  { type: 'True/False', q: 'Positional encodings are required because attention has no notion of order.', preview: '2 options' },
  { type: 'Short Answer', q: 'In one sentence, what does multi-head attention enable?', preview: 'Free text' },
];

import { useEffect } from 'react';

export function QuizPage() {
  const navigate = useNavigate();
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const openDocument = useStore((s) => s.openDocument);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  const doc = documents.find((d) => d.id === activeDocId);
  const readyDocs = documents.filter((d) => d.status === 'ready');
  const [difficulty, setDifficulty] = useState<string>('medium');

  useEffect(() => {
    if (doc) {
      setWorkspaceTab('quiz');
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
            <ListChecks size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-800">Quiz</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Test your understanding with auto-generated quizzes. Lumora creates MCQs,
            true/false, and short-answer questions from your document.
          </p>
        </motion.div>

        {/* Quiz preview card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-xl border border-ink-100 bg-paper-50 p-6 shadow-soft"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-crimson-600" />
              <h3 className="font-serif text-base font-semibold text-ink-800">Quiz Preview</h3>
            </div>
            <span className="chip bg-crimson-50 text-crimson-700">15 questions</span>
          </div>

          {/* Stats row */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-paper-200/50 p-3 text-center">
              <div className="font-serif text-xl font-semibold text-ink-800">15</div>
              <div className="text-2xs text-ink-400">Questions</div>
            </div>
            <div className="rounded-lg bg-paper-200/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 font-serif text-xl font-semibold text-ink-800">
                <Clock size={14} /> 10m
              </div>
              <div className="text-2xs text-ink-400">Est. time</div>
            </div>
            <div className="rounded-lg bg-paper-200/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 font-serif text-xl font-semibold text-ink-800">
                <Trophy size={14} /> 80%
              </div>
              <div className="text-2xs text-ink-400">Pass rate</div>
            </div>
          </div>

          {/* Difficulty selector */}
          <p className="mb-2 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
            Difficulty
          </p>
          <div className="mb-5 grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-lg border px-3 py-2 text-left transition-all ${
                  difficulty === d.id
                    ? 'border-crimson-300 bg-crimson-50/50'
                    : 'border-ink-200 bg-paper-50 hover:border-ink-300'
                }`}
              >
                <div className={`text-xs font-semibold ${difficulty === d.id ? 'text-crimson-700' : 'text-ink-700'}`}>
                  {d.label}
                </div>
                <div className="text-2xs text-ink-400">{d.desc}</div>
              </button>
            ))}
          </div>

          {/* Sample questions */}
          <div className="space-y-2">
            {SAMPLE_QUESTIONS.map((sq, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-ink-100 bg-paper-100 px-3 py-2.5"
              >
                <span className="chip bg-paper-200 text-ink-500">{sq.type}</span>
                <p className="min-w-0 flex-1 truncate text-xs text-ink-600">{sq.q}</p>
                <span className="text-2xs text-ink-300">{sq.preview}</span>
              </div>
            ))}
          </div>

          <button
            disabled
            className="btn-primary mt-5 w-full cursor-not-allowed opacity-40"
          >
            <Sparkles size={15} /> Generate Quiz
          </button>
        </motion.div>

        {/* Document picker */}
        {readyDocs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
              Select a document to generate a quiz
            </p>
            <div className="space-y-2">
              {readyDocs.slice(0, 5).map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    openDocument(d.id);
                    navigate('/app/quiz');
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-ink-100 bg-paper-50 px-4 py-3 text-left transition-colors hover:border-ink-200 hover:bg-paper-100"
                >
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: d.accent }} />
                  <FileText size={15} className="text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-700">{d.name}</p>
                    <p className="text-2xs text-ink-400">
                      {d.quiz.length} quiz questions
                      {d.lastOpenedAt ? ` · ${timeAgo(d.lastOpenedAt)}` : ''}
                    </p>
                  </div>
                  {d.quiz.length > 0 && (
                    <span className="flex items-center gap-1 text-2xs text-sage">
                      <CheckCircle2 size={10} /> Ready
                    </span>
                  )}
                  <ArrowRight size={15} className="text-ink-300 transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink-200 bg-paper-50/50 p-8 text-center">
            <Sparkles size={24} className="mx-auto mb-2 text-ink-300" />
            <p className="text-sm text-ink-500">Upload a document to generate quizzes.</p>
            <button onClick={() => navigate('/app')} className="btn-primary mt-4">
              Browse Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
