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
import { ProcessingOverlay } from './Skeletons';

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
    return <ProcessingOverlay label="Generating quiz..." />;
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
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-crimson-50">
              <Award size={36} className="text-crimson-600" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-ink-800">Quiz Complete</h2>
            <p className="mt-1 text-sm text-ink-400">You scored</p>
            <p className="font-serif text-4xl font-bold text-crimson-600">{score}%</p>
            <p className="mt-1 text-sm text-ink-500">
              {correct} out of {quiz.length} correct
            </p>
          </motion.div>

          <div className="mb-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setStarted(false);
                setAnswers({});
                setCurrent(0);
              }}
              className="btn-primary"
            >
              <RotateCw size={15} /> Retry
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
              className="btn-secondary"
            >
              <RefreshCw size={15} /> Generate Again
            </button>
          </div>

          <div className="space-y-4">
            {quiz.map((q, i) => {
              const userAnswer = answers[q.id] || '(no answer)';
              const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4"
                >
                  <div className="mb-2 flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    )}
                    <p className="text-sm font-medium text-ink-700">{q.question}</p>
                  </div>
                  <div className="ml-6 space-y-1 text-xs">
                    <p className={isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                      Your answer: {userAnswer}
                    </p>
                    {!isCorrect && <p className="text-emerald-600">Correct: {q.answer}</p>}
                    <p className="pt-1 text-ink-400">
                      <HelpCircle size={11} className="mr-1 inline" />
                      {q.explanation}
                    </p>
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
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
          <ListChecks size={28} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-xl font-semibold text-ink-800">Ready to test your knowledge?</h2>
        <p className="mt-1.5 max-w-sm text-sm text-ink-400">
          {quiz.length} questions · MCQ, True/False, and Short Answer
        </p>
        <div className="mt-4 flex gap-2">
          {['easy', 'medium', 'hard'].map((d) => {
            const count = quiz.filter((q) => q.difficulty === d).length;
            return (
              <span key={d} className="chip border border-ink-200 bg-paper-50 text-ink-500 capitalize">
                {d}: {count}
              </span>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setStarted(true)} className="btn-primary">
            Start Quiz <ChevronRight size={16} />
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
            className="btn-secondary"
          >
            <RefreshCw size={15} /> Regenerate
          </button>
        </div>
      </div>
    );
  }

  const q = quiz[current];
  const progress = ((current + 1) / quiz.length) * 100;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-100/80 px-6 pt-4">
        <div className="mb-2 flex items-center justify-between text-2xs text-ink-400">
          <span>Question {current + 1} of {quiz.length}</span>
          <span className="capitalize chip bg-paper-200 text-ink-500">{q.difficulty}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-ink-100">
          <motion.div
            className="h-full rounded-full bg-crimson-500"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <span className="chip bg-ink-100/60 text-ink-500 capitalize mb-3">{q.type.replace('truefalse', 'True/False')}</span>
          <h3 className="mb-6 font-serif text-xl font-semibold leading-relaxed text-ink-800">{q.question}</h3>

          {q.type === 'mcq' && q.options && (
            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? 'border-crimson-400 bg-crimson-50/50 text-ink-800'
                        : 'border-ink-100 bg-paper-50 text-ink-600 hover:border-ink-200'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-crimson-500 bg-crimson-500' : 'border-ink-200'
                      }`}
                    >
                      {selected && <div className="h-2 w-2 rounded-full bg-paper-50" />}
                    </span>
                    {opt}
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
                    className={`rounded-lg border px-4 py-6 text-center font-serif text-lg font-medium transition-all ${
                      selected
                        ? 'border-crimson-400 bg-crimson-50/50 text-crimson-700'
                        : 'border-ink-100 bg-paper-50 text-ink-600 hover:border-ink-200'
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
              placeholder="Type your answer..."
              rows={4}
              className="input"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100/80 px-6 py-3">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-ghost"
        >
          Previous
        </button>
        {current === quiz.length - 1 ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!answers[q.id]}
            className="btn-primary"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(quiz.length - 1, c + 1))}
            disabled={!answers[q.id]}
            className="btn-primary"
          >
            Next <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
