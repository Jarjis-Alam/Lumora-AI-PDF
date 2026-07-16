import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  RotateCw,
  ChevronRight,
  HelpCircle,
  Layers,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { SkeletonQuiz } from './Skeletons';

export function QuizPanel({ docId }: { docId: string | null }) {
  const documents = useStore((s) => s.documents);
  const generateQuiz = useStore((s) => s.generateQuiz);

  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);

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
        description="Select a document from the sidebar to generate and take a quiz."
        tips={[
          'Quizzes test your understanding across the entire document',
          'Questions include multiple choice, true/false, and short answer',
          'Get instant feedback with explanations for each answer'
        ]}
        accent="#3B82F6"
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
        tips={[
          'Questions are tailored to the difficulty of your material',
          'Track weak topics to focus your studying',
          'Retake quizzes to improve your score'
        ]}
        accent="#3B82F6"
      />
    );
  }

  if (submitted) {
    const correct = quiz.filter((q) => {
      const a = answers[q.id]?.trim().toLowerCase();
      return a && a === q.answer.trim().toLowerCase();
    }).length;
    const score = Math.round((correct / quiz.length) * 100);

    const incorrectQuestions = quiz.filter((q) => {
      const a = answers[q.id]?.trim().toLowerCase();
      return !a || a !== q.answer.trim().toLowerCase();
    });

    const weakTopics = Array.from(new Set(
      incorrectQuestions.map((q) => {
        const text = q.question.toLowerCase();
        if (text.includes('self-attention') || text.includes('self attention')) return 'Self-Attention';
        if (text.includes('multi-head') || text.includes('multi head')) return 'Multi-Head Attention';
        if (text.includes('attention')) return 'Attention Mechanisms';
        if (text.includes('recurrence') || text.includes('rnn')) return 'Recurrent Connections';
        if (text.includes('positional')) return 'Positional Encoding';
        if (text.includes('encoder') || text.includes('decoder')) return 'Encoder-Decoder Architecture';
        if (text.includes('feed-forward') || text.includes('feed forward')) return 'Feed-Forward Networks';
        return 'General Concepts';
      })
    ));

    // Determine grade and color
    const getGrade = (score: number) => {
      if (score >= 90) return { grade: 'A+', color: 'emerald', message: 'Outstanding!' };
      if (score >= 80) return { grade: 'A', color: 'emerald', message: 'Excellent work!' };
      if (score >= 70) return { grade: 'B', color: 'blue', message: 'Good job!' };
      if (score >= 60) return { grade: 'C', color: 'amber', message: 'Keep practicing!' };
      return { grade: 'D', color: 'red', message: 'Review the material' };
    };

    const { grade, color, message } = getGrade(score);

    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-paper-50 to-paper-100">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Certificate/Results Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 relative overflow-hidden rounded-2xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-8 shadow-paper-lg"
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 h-32 w-32 bg-gradient-to-br from-crimson-100/40 to-transparent rounded-br-full" />
            <div className="absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-crimson-100/40 to-transparent rounded-tl-full" />
            
            <div className="relative text-center space-y-6">
              {/* Trophy/Award Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-float ${
                  score >= 80 ? 'from-emerald-500 to-emerald-600' :
                  score >= 60 ? 'from-amber-500 to-amber-600' :
                  'from-red-500 to-red-600'
                } text-white`}
              >
                <Award size={48} strokeWidth={2} />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-serif text-3xl font-bold text-ink-900">Quiz Complete!</h2>
                <p className="mt-2 text-sm text-ink-600">{message}</p>
              </motion.div>

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex justify-center gap-8 pt-4"
              >
                <div className="text-center">
                  <div className={`font-serif text-6xl font-bold ${
                    score >= 80 ? 'text-emerald-600' :
                    score >= 60 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {score}%
                  </div>
                  <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mt-1">
                    Final Score
                  </div>
                </div>
                <div className="h-16 w-px bg-ink-200" />
                <div className="text-center">
                  <div className="font-serif text-6xl font-bold text-ink-800">{grade}</div>
                  <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mt-1">
                    Grade
                  </div>
                </div>
                <div className="h-16 w-px bg-ink-200" />
                <div className="text-center">
                  <div className="font-serif text-6xl font-bold text-ink-800">{correct}/{quiz.length}</div>
                  <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mt-1">
                    Correct
                  </div>
                </div>
              </motion.div>

              {/* Weak Topics */}
              {weakTopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mx-auto max-w-md rounded-xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/30 p-4 text-left shadow-soft"
                >
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <AlertCircle size={14} />
                    Areas for Review
                  </h4>
                  <ul className="space-y-1">
                    {weakTopics.map((topic) => (
                      <li key={topic} className="flex items-center gap-2 text-xs font-medium text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap justify-center gap-3 pt-6"
              >
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setStarted(false);
                    setAnswers({});
                    setCurrent(0);
                  }}
                  className="btn-primary gap-2"
                >
                  <RotateCw size={16} /> Retry Quiz
                </button>
                {weakTopics.length > 0 && (
                  <button
                    onClick={() => setWorkspaceTab('flashcards')}
                    className="btn-secondary gap-2 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  >
                    <Layers size={16} /> Study Flashcards
                  </button>
                )}
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
                  className="btn-secondary gap-2"
                >
                  <RefreshCw size={16} /> New Quiz
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink-700">
              <HelpCircle size={16} className="text-crimson-600" />
              Review Your Answers
            </h3>
            {quiz.map((q, i) => {
              const userAnswer = answers[q.id] || '(no answer)';
              const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className={`rounded-xl border-2 p-4 shadow-soft transition-all hover:shadow-card ${
                    isCorrect 
                      ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/30' 
                      : 'border-red-200/60 bg-gradient-to-br from-red-50 to-red-100/30'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white">
                        <XCircle size={18} />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Question {i + 1}</span>
                      <h4 className="mt-1 text-sm font-semibold text-ink-800 leading-relaxed">{q.question}</h4>
                    </div>
                  </div>
                  
                  <div className="ml-11 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                        Your Answer:
                      </span>
                      <span className="text-ink-700">{userAnswer}</span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-700">Correct Answer:</span>
                        <span className="text-ink-700">{q.answer}</span>
                      </div>
                    )}
                    <div className="rounded-lg border border-ink-200/60 bg-paper-50 p-3 mt-2">
                      <p className="text-xs leading-relaxed text-ink-600">{q.explanation}</p>
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
      <div className="flex h-full flex-col items-center justify-center px-6 bg-gradient-to-b from-paper-50 to-paper-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-float"
          >
            <ListChecks size={40} strokeWidth={2} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="font-serif text-2xl font-bold text-ink-900">Ready to Test Your Knowledge?</h2>
            <p className="text-sm text-ink-600 leading-relaxed max-w-md mx-auto">
              {quiz.length} carefully crafted questions from <span className="font-semibold text-ink-800">{doc.name}</span> to assess your understanding.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 pt-2"
          >
            {['easy', 'medium', 'hard'].map((d) => {
              const count = quiz.filter((q) => q.difficulty === d).length;
              if (count === 0) return null;
              const colors = {
                easy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                medium: 'border-amber-200 bg-amber-50 text-amber-700',
                hard: 'border-red-200 bg-red-50 text-red-700',
              };
              return (
                <span key={d} className={`chip ${colors[d as keyof typeof colors]} capitalize`}>
                  {d}: {count} question{count > 1 ? 's' : ''}
                </span>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            <button 
              onClick={() => setStarted(true)} 
              className="btn-primary gap-2"
            >
              Start Quiz <ChevronRight size={18} />
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
              className="btn-secondary gap-2"
            >
              <RefreshCw size={16} /> New Questions
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const q = quiz[current];
  const progress = ((current + 1) / quiz.length) * 100;
  const answered = !!answers[q.id];

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-paper-50 to-paper-100">
      {/* Enhanced Progress Header */}
      <div className="border-b border-ink-100/60 bg-paper-50/95 px-6 py-4 backdrop-blur-lg shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-soft">
              <ListChecks size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-800">
                Question {current + 1} of {quiz.length}
              </p>
              <p className="text-xs text-ink-500">{Object.keys(answers).length} answered</p>
            </div>
          </div>
          <span className={`chip ${
            q.difficulty === 'easy' ? 'chip-success' :
            q.difficulty === 'medium' ? 'chip-warning' :
            'border-red-200 bg-red-50 text-red-700'
          } capitalize`}>
            {q.difficulty}
          </span>
        </div>
        
        {/* Premium Progress Bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-ink-100 shadow-inset">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-2xl space-y-6"
          >
            {/* Question Card */}
            <div className="rounded-2xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-6 shadow-paper">
              <span className="chip chip-primary uppercase tracking-wider">
                {q.type === 'truefalse' ? 'True / False' : q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
              </span>
              <h3 className="mt-4 font-serif text-xl font-bold leading-relaxed text-ink-900">
                {q.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {q.type === 'mcq' && q.options && (
                q.options.map((opt, idx) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                        selected
                          ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-soft'
                          : 'border-ink-200/60 bg-paper-50 hover:border-ink-300 hover:bg-paper-100'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          selected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-ink-300'
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2.5 w-2.5 rounded-full bg-white"
                          />
                        )}
                      </span>
                      <span className={`text-sm font-medium ${selected ? 'text-ink-900' : 'text-ink-700'}`}>
                        {opt}
                      </span>
                    </motion.button>
                  );
                })
              )}

              {q.type === 'truefalse' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={`rounded-xl border-2 py-6 text-center font-serif text-lg font-bold transition-all ${
                          selected
                            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700 shadow-soft'
                            : 'border-ink-200/60 bg-paper-50 text-ink-600 hover:border-ink-300 hover:bg-paper-100'
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {q.type === 'short' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Type your answer here..."
                  rows={5}
                  className="input text-sm"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-ink-100/60 bg-paper-50/95 px-6 py-4 backdrop-blur-lg">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary gap-2 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        
        {current === quiz.length - 1 ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!answered}
            className="btn-primary gap-2 disabled:opacity-50"
          >
            Submit Quiz <CheckCircle2 size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(quiz.length - 1, c + 1))}
            disabled={!answered}
            className="btn-primary gap-2 disabled:opacity-50"
          >
            Next Question <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
