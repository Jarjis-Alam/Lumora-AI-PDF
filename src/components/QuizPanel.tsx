import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ListChecks,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  RotateCw,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { SkeletonQuiz } from './Skeletons';

export function QuizPanel({ docId }: { docId: string | null }) {
  const documents = useStore((s) => s.documents);
  const generateQuiz = useStore((s) => s.generateQuiz);

  const [generating, setGenerating] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const doc = documents.find((d) => d.id === docId);
  const quiz = doc?.quiz || [];

  if (!docId || !doc) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No document selected"
        description="Select a document to generate and take a quiz."
      />
    );
  }

  if (generating) {
    return <SkeletonQuiz />;
  }

  if (quiz.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No quiz available"
        description="Generate a quiz from your document to test your understanding."
        action={{
          label: 'Generate Quiz',
          onClick: async () => {
            setGenerating(true);
            try {
              await generateQuiz(doc.id);
            } finally {
              setGenerating(false);
            }
          },
        }}
      />
    );
  }

  if (submitted) {
    const correct = quiz.filter((q) => {
      const a = answers[q.id]?.trim().toLowerCase();
      return a && a === q.answer.trim().toLowerCase();
    }).length;
    const score = Math.round((correct / quiz.length) * 100);

    return (
      <div className="h-full overflow-y-auto bg-paper-50/20">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-center card p-6 space-y-4"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-crimson-50 text-crimson-600">
              <Award size={30} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-800">Quiz Complete</h2>
              <p className="mt-1 text-xs text-ink-400">Review your answers below</p>
            </div>
            <div className="flex justify-center gap-6 pt-2">
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-crimson-600">{score}%</div>
                <div className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide2">Score</div>
              </div>
              <div className="h-10 w-px bg-ink-100" />
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-ink-800">{correct} / {quiz.length}</div>
                <div className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide2">Correct</div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStarted(false);
                  setAnswers({});
                  setCurrent(0);
                }}
                className="btn-primary btn-sm rounded px-3 py-2 flex items-center gap-1"
              >
                <RotateCw size={12} /> Retry Quiz
              </button>
              <button
                onClick={async () => {
                  setGenerating(true);
                  try {
                    await generateQuiz(doc.id);
                    setSubmitted(false);
                    setStarted(false);
                    setAnswers({});
                    setCurrent(0);
                  } finally {
                    setGenerating(false);
                  }
                }}
                className="btn-secondary btn-sm rounded px-3 py-2 flex items-center gap-1"
              >
                <RefreshCw size={12} /> Generate Again
              </button>
            </div>
          </motion.div>

          <div className="space-y-3">
            {quiz.map((q, i) => {
              const userAnswer = answers[q.id] || '(no answer)';
              const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4 hover:shadow-card transition-shadow space-y-3 border-l-4"
                  style={{ borderLeftColor: isCorrect ? '#10B981' : '#EF4444' }}
                >
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    )}
                    <h4 className="text-sm font-semibold text-ink-800 leading-normal">{q.question}</h4>
                  </div>
                  <div className="pl-6 space-y-2 text-xs">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-2xs font-semibold">
                      <span className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                        Your Answer: {userAnswer}
                      </span>
                      {!isCorrect && <span className="text-emerald-700">Correct Answer: {q.answer}</span>}
                    </div>
                    <div className="bg-paper-100 p-2.5 rounded text-xs text-ink-500 font-body leading-relaxed flex gap-2">
                      <HelpCircle size={14} className="shrink-0 mt-0.5 text-crimson-600" />
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600 shadow-soft">
          <ListChecks size={28} strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-xl font-bold text-ink-800 tracking-editorial">Ready to test your knowledge?</h2>
          <p className="max-w-xs text-xs text-ink-400 leading-relaxed mx-auto">
            {quiz.length} auto-generated questions from {doc.name} to assess your understanding.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          {['easy', 'medium', 'hard'].map((d) => {
            const count = quiz.filter((q) => q.difficulty === d).length;
            if (count === 0) return null;
            return (
              <span key={d} className="chip border border-ink-200 bg-paper-50 text-ink-500 capitalize px-2 py-0.5 text-[10px]">
                {d}: {count} Q
              </span>
            );
          })}
        </div>
        <div className="flex gap-2.5 pt-2">
          <button onClick={() => setStarted(true)} className="btn-primary btn-sm rounded px-4 py-2 flex items-center gap-1.5 text-xs">
            Start Quiz <ChevronRight size={14} />
          </button>
          <button
            onClick={async () => {
              setGenerating(true);
              try {
                await generateQuiz(doc.id);
              } finally {
                setGenerating(false);
              }
            }}
            className="btn-secondary btn-sm rounded px-3 py-2 flex items-center gap-1.5 text-xs"
          >
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>
      </div>
    );
  }

  const q = quiz[current];
  const progress = ((current + 1) / quiz.length) * 100;

  return (
    <div className="flex h-full flex-col bg-paper-50/20">
      {/* Quiz Progress header */}
      <div className="border-b border-ink-100/40 px-6 py-3.5 bg-paper-50">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-ink-400 uppercase tracking-wide2">
          <span>Question {current + 1} of {quiz.length}</span>
          <span className="chip border border-ink-200 bg-paper-100 text-ink-500">{q.difficulty}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
          <motion.div
            className="h-full rounded-full bg-crimson-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 font-body">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="space-y-2">
            <span className="chip bg-crimson-50 text-crimson-700 font-semibold tracking-wider text-[9px] uppercase px-1.5 py-0.5 rounded">
              {q.type === 'truefalse' ? 'True / False' : q.type.toUpperCase()}
            </span>
            <h3 className="font-serif text-lg font-bold leading-relaxed text-ink-800">{q.question}</h3>
          </div>

          {q.type === 'mcq' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-xs font-semibold transition-all ${
                      selected
                        ? 'border-crimson-400 bg-crimson-50/40 text-ink-850 shadow-soft'
                        : 'border-ink-100 bg-paper-50 text-ink-600 hover:border-ink-250 hover:bg-paper-100/50'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected ? 'border-crimson-500 bg-crimson-500 text-white' : 'border-ink-200'
                      }`}
                    >
                      {selected && <div className="h-1.5 w-1.5 rounded-full bg-paper-50" />}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'truefalse' && (
            <div className="grid grid-cols-2 gap-3">
              {['True', 'False'].map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`rounded-lg border px-4 py-5 text-center font-serif text-base font-bold transition-all ${
                      selected
                        ? 'border-crimson-400 bg-crimson-50/40 text-crimson-700'
                        : 'border-ink-100 bg-paper-50 text-ink-600 hover:border-ink-250 hover:bg-paper-100/50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'short' && (
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Type your explanation..."
              rows={4}
              className="input text-xs font-body"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100/40 px-6 py-3.5 bg-paper-50">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-ghost btn-sm rounded px-3 py-1.5 text-xs font-semibold"
        >
          Previous
        </button>
        {current === quiz.length - 1 ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!answers[q.id]}
            className="btn-primary btn-sm rounded px-4 py-2 text-xs"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(quiz.length - 1, c + 1))}
            disabled={!answers[q.id]}
            className="btn-primary btn-sm rounded px-4 py-2 flex items-center gap-1 text-xs"
          >
            Next <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
