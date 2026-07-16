import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  AlignLeft,
  Layers,
  ListChecks,
  Share2,
  FileText,
  ChevronDown,
  Github,
  BookOpen,
  Scale,
  Upload,
  Cpu,
  Quote,
  Zap,
  Shield,
  Lock,
  Network,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '../components/Logo';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Data                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = ['Features', 'Canvas', 'How it works', 'FAQ'];

const FEATURES = [
  { icon: Upload, title: 'Upload', desc: 'Drop in a paper, report, or textbook and let Lumora start reading immediately.' },
  { icon: AlignLeft, title: 'Understand', desc: 'Turn dense sections into clear explanations, takeaways, and cited answers.' },
  { icon: Share2, title: 'Connect', desc: 'Link concepts into an interactive graph so ideas stop feeling isolated.' },
  { icon: Layers, title: 'Learn', desc: 'Generate flashcards, summaries, and study prompts without leaving the workspace.' },
  { icon: ListChecks, title: 'Remember', desc: 'Quiz yourself with structured review loops that help knowledge stick.' },
];

const TRUST_BRANDS = ['Groq', 'FastAPI', 'PostgreSQL', 'Vercel', 'React', 'Open Source'];

const EDITORIAL_POINTS = [
  'Cited answers',
  'Interactive graphs',
  'Study loops',
  'Private workspace',
];

const CANVAS_ITEMS = ['PDFs', 'AI answers', 'Notes', 'Flashcards', 'Knowledge graph'];

const COMPARISON_ITEMS = {
  left: ['Read manually', 'Highlight manually', 'Search manually', 'Build notes by hand'],
  right: ['Understand automatically', 'Answer questions with citations', 'Generate quizzes', 'Build flashcards and graphs'],
};

const WORKFLOW = [
  { icon: Upload, title: 'Upload PDF', desc: 'Drag in any document.' },
  { icon: Cpu, title: 'AI Processing', desc: 'Indexing & embeddings.' },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Chat with citations.' },
  { icon: AlignLeft, title: 'Summary', desc: 'Chapter-level takeaways.' },
  { icon: Layers, title: 'Flashcards', desc: 'Auto-generated study cards.' },
  { icon: ListChecks, title: 'Quiz', desc: 'Test your understanding.' },
  { icon: Network, title: 'Knowledge Graph', desc: 'Explore connections.' },
];

const CINEMATIC_STEPS = [
  { title: 'The paper opens', body: 'A dense PDF becomes a living surface of ideas, citations, and context.' },
  { title: 'The concepts surface', body: 'Important terms, definitions, and relationships emerge in real time.' },
  { title: 'The graph grows', body: 'Connections appear as the workspace begins to map the document into understanding.' },
  { title: 'The study tools appear', body: 'Summaries, flashcards, and quizzes arrive as the story becomes easier to remember.' },
];

const PREMIUM_PILLARS = [
  'Verifiable citations',
  'Local-first privacy',
  'Study-ready outputs',
  'A workspace that grows with your thinking',
];

const SCREENS = [
  { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
  { id: 'workspace', label: 'PDF Workspace', icon: FileText },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
];

const TESTIMONIALS = [
  { name: 'Aisha Patel', role: 'PhD Researcher', icon: '🎓', quote: 'Lumora replaced three tools in my research workflow. The citations alone save me hours every week — I can finally trust what the AI tells me.' },
  { name: 'Marcus Chen', role: 'CS Student', icon: '📚', quote: 'I uploaded a 200-page ML textbook and was generating flashcards and quizzes in under a minute. It feels like having a tutor that actually read the book.' },
  { name: 'Sofia Reyes', role: 'Frontend Engineer', icon: '💻', quote: 'The knowledge graph view is genius. I can see how concepts connect across papers without skimming. It is the most underrated feature.' },
  { name: 'Daniel Park', role: 'Product Designer', icon: '🎨', quote: 'Most AI tools feel like a chat box bolted onto a PDF. Lumora feels like a real workspace designed for understanding.' },
];

const FAQS = [
  { q: 'What kind of documents does Lumora support?', a: 'Lumora works with any PDF — research papers, textbooks, reports, and articles. Upload it and start asking questions immediately. The indexer handles text-based PDFs natively.' },
  { q: 'How do citations work?', a: 'Every AI response includes citation chips pointing to the exact page and paragraph. Click a citation to jump straight to that location in the document viewer — no more guessing where an answer came from.' },
  { q: 'Is my data private?', a: 'Yes. Your documents are processed privately — no sharing, no third-party indexing, no training on your content. Lumora is local-first by design.' },
  { q: 'Do I need to create an account?', a: 'No account needed. Open Lumora and start working immediately. Your workspace persists locally so you can pick up where you left off.' },
  { q: 'Can I use Lumora offline?', a: 'The core reading, search, and study features work offline. AI generation requires a connection to the model provider, but everything else stays local.' },
];

const FOOTER_LINKS = {
  Product: ['Features', 'Inside Lumora', 'How it works', 'FAQ'],
  Resources: ['Documentation', 'GitHub', 'License', 'Changelog'],
  'Built with': ['React', 'FastAPI', 'Groq', 'PostgreSQL', 'Vercel'],
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Motion variants                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Small UI atoms                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-crimson-600">
      <span className="h-1 w-1 rounded-full bg-crimson-500" />
      {children}
    </div>
  );
}

function SectionShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`section-shell relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(192,57,43,0.08),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.06),_transparent_35%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Hero — realistic product preview                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function HeroPreview() {
  const processSteps = [
    { label: 'Upload', title: 'Uploading PDF', detail: 'Deep Learning.pdf', accent: 'from-crimson-500 to-crimson-600' },
    { label: 'Read', title: 'Reading the paper', detail: 'Extracting key concepts', accent: 'from-amber-500 to-orange-500' },
    { label: 'Understand', title: 'Building context', detail: 'Finding citations and definitions', accent: 'from-emerald-500 to-emerald-600' },
    { label: 'Connect', title: 'Linking ideas', detail: 'Growing the knowledge graph', accent: 'from-slate-600 to-slate-700' },
    { label: 'Remember', title: 'Preparing study tools', detail: 'Flashcards and quizzes are ready', accent: 'from-violet-500 to-fuchsia-500' },
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [processSteps.length]);

  const currentStep = processSteps[activeStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1400 }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 6, 0, -6, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-br from-crimson-200/50 via-crimson-100/30 to-transparent blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, -4, 0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-8 top-1/4 -z-10 h-32 w-32 rounded-full bg-gradient-to-br from-crimson-400/20 to-transparent blur-2xl"
      />
      <motion.div
        animate={{ y: [0, -12, 0], x: [0, 6, 0, -4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-8 bottom-1/4 -z-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/15 to-transparent blur-2xl"
      />

      <div className="overflow-hidden rounded-[1.75rem] border-2 border-ink-200/80 bg-paper-50 shadow-paper-lg">
        <div className="flex items-center justify-between border-b border-ink-200/70 bg-gradient-to-b from-paper-100 to-paper-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-4 flex items-center gap-2 text-xs font-medium text-ink-500">
              <Logo size={16} /> Lumora Workspace
            </span>
          </div>
          <div className="rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide2 text-emerald-700">
            Live • {currentStep.label}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row" style={{ minHeight: 420 }}>
          <div className="flex-1 p-4">
            <div className="rounded-2xl border border-ink-200/60 bg-paper-100/80 p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">Active workflow</div>
                  <div className="font-serif text-lg font-semibold text-ink-800">{currentStep.title}</div>
                </div>
                <div className="rounded-full bg-paper-50 px-3 py-1 text-2xs font-medium text-ink-500">
                  {currentStep.detail}
                </div>
              </div>

              <div className="space-y-2">
                {processSteps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;
                  return (
                    <div
                      key={step.label}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all ${
                        isActive
                          ? 'border-crimson-200 bg-crimson-50 text-crimson-700'
                          : isCompleted
                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700'
                            : 'border-ink-200/60 bg-paper-50 text-ink-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`flex h-2.5 w-2.5 rounded-full ${isActive ? 'bg-crimson-500' : isCompleted ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                        <span className="font-medium">{step.label}</span>
                      </div>
                      <span className="text-2xs opacity-80">{step.detail}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-ink-200/60 bg-paper-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">Now generating</div>
                <div className="mt-1 font-serif text-base font-semibold text-ink-800">{currentStep.detail}</div>
                <div className="mt-3 h-2 rounded-full bg-ink-100">
                  <motion.div
                    key={currentStep.label}
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`h-2 rounded-full bg-gradient-to-r ${currentStep.accent}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-ink-200/60 bg-paper-100 p-4 lg:w-64 lg:border-l lg:border-t-0">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">Research canvas</div>
            <div className="space-y-2.5">
              <div className="rounded-2xl border border-crimson-200/60 bg-crimson-50/50 p-3">
                <div className="text-2xs font-semibold uppercase tracking-wide2 text-crimson-600">Citation</div>
                <div className="mt-1 text-sm font-medium text-ink-700">p.18 · gradient descent</div>
              </div>
              <div className="rounded-2xl border border-ink-200/60 bg-paper-50 p-3">
                <div className="text-2xs font-semibold uppercase tracking-wide2 text-ink-400">Summary</div>
                <div className="mt-1 text-sm font-medium text-ink-700">12 takeaways ready</div>
              </div>
              <div className="rounded-2xl border border-ink-200/60 bg-paper-50 p-3">
                <div className="text-2xs font-semibold uppercase tracking-wide2 text-ink-400">Flashcard</div>
                <div className="mt-1 text-sm font-medium text-ink-700">What is the learning rate?</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, x: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.9, type: 'spring', stiffness: 200 }}
        className="absolute -bottom-6 -left-6 hidden rounded-xl border-2 border-emerald-200/60 bg-paper-50 p-3 shadow-float lg:block"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-soft">
            <AlignLeft size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-700">Summary ready</div>
            <div className="text-2xs text-ink-500">12 key takeaways generated</div>
          </div>
          <CheckCircle2 size={16} className="ml-1 text-emerald-600 animate-scale-in" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -16, x: -12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.1, type: 'spring', stiffness: 200 }}
        className="absolute -top-4 -right-4 hidden items-center gap-2 rounded-full border-2 border-amber-200/60 bg-paper-50 px-4 py-2 shadow-float sm:flex"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <span className="text-xs font-semibold text-ink-600">Processing embeddings</span>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Feature card                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

function FeatureCard({ f, i: _i }: { f: (typeof FEATURES)[number]; i: number }) {
  const Icon = f.icon;
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group flex h-full flex-col rounded-2xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-6 shadow-soft transition-all hover:border-crimson-200 hover:shadow-card"
    >
      <motion.div
        whileHover={{ rotate: -8, scale: 1.12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-50 to-crimson-100/60 text-crimson-600 shadow-soft transition-all group-hover:shadow-glow-soft"
      >
        <Icon size={22} strokeWidth={1.8} />
      </motion.div>
      <h3 className="font-serif text-base font-semibold text-ink-800">{f.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.desc}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Inside Lumora — product screenshots                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

function ScreenMock({ id }: { id: string }) {
  const common = 'h-full w-full bg-paper-50';

  if (id === 'dashboard') {
    return (
      <div className={common}>
        <div className="flex items-center justify-between border-b border-ink-200/50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span className="text-xs font-semibold text-ink-700">Dashboard</span>
          </div>
          <div className="h-5 w-20 rounded-md bg-paper-200" />
        </div>
        <div className="p-4">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[
              { icon: FileText, label: 'Documents', val: '12' },
              { icon: Layers, label: 'Flashcards', val: '248' },
              { icon: ListChecks, label: 'Quizzes', val: '34' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border border-ink-200/50 bg-paper-100 p-2.5">
                  <Icon size={12} className="text-crimson-500" />
                  <div className="mt-1 font-serif text-lg font-semibold text-ink-800">{s.val}</div>
                  <div className="text-2xs text-ink-400">{s.label}</div>
                </div>
              );
            })}
          </div>
          <div className="space-y-1.5">
            {['Attention Is All You Need', 'Deep Learning.pdf', 'Linear Algebra Notes', 'Reinforcement Learning'].map((d, i) => (
              <div key={d} className="flex items-center gap-2 rounded-md border border-ink-200/40 bg-paper-100 px-2.5 py-1.5">
                <FileText size={11} className="text-crimson-500" />
                <span className="text-2xs font-medium text-ink-600">{d}</span>
                <span className="ml-auto text-2xs text-ink-300">{i + 1}h ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'workspace') {
    return (
      <div className={common}>
        <div className="flex items-center gap-2 border-b border-ink-200/50 px-4 py-2.5">
          <FileText size={12} className="text-crimson-600" />
          <span className="text-xs font-medium text-ink-700">Deep Learning.pdf</span>
          <span className="text-2xs text-ink-300">· p.18</span>
        </div>
        <div className="flex" style={{ height: 'calc(100% - 38px)' }}>
          <div className="flex-1 p-3">
            <div className="rounded-md border border-ink-200/50 bg-paper-100 p-3">
              <div className="mb-1.5 font-serif text-xs font-semibold text-ink-700">Chapter 4 · Gradient Descent</div>
              {[95, 88, 92, 78, 85, 70, 88, 65].map((w, i) => (
                <div key={i} className="mb-1 h-1.5 rounded bg-ink-100" style={{ width: `${w}%` }} />
              ))}
              <div className="my-1 rounded bg-crimson-100/60 px-1 py-0.5">
                <div className="h-1.5 w-full rounded bg-crimson-300/50" />
              </div>
              {[80, 92, 70].map((w, i) => (
                <div key={i} className="mb-1 h-1.5 rounded bg-ink-100" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="w-32 shrink-0 border-l border-ink-200/50 bg-paper-100 p-2.5">
            <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide2 text-crimson-600">AI Chat</div>
            <div className="mb-1.5 rounded-md rounded-tr-sm bg-crimson-700 px-2 py-1 text-2xs text-white">What is GD?</div>
            <div className="rounded-md rounded-tl-sm border border-ink-200/60 bg-paper-50 px-2 py-1.5 text-2xs leading-relaxed text-ink-500">
              Optimization by stepping in the gradient direction.
              <div className="mt-1 flex gap-0.5">
                <span className="rounded-full bg-crimson-50 px-1 text-2xs text-crimson-600">p.18</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === 'flashcards') {
    return (
      <div className={common}>
        <div className="flex items-center justify-between border-b border-ink-200/50 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Layers size={12} className="text-crimson-600" />
            <span className="text-xs font-semibold text-ink-700">Flashcards</span>
          </div>
          <span className="text-2xs text-ink-400">248 cards · 12 decks</span>
        </div>
        <div className="flex h-[calc(100%-38px)] items-center justify-center p-4">
          <div className="w-full max-w-[200px]">
            <div className="mb-2 flex justify-center gap-1">
              {[0, 1, 2, 3, 4].map((d) => (
                <span key={d} className={`h-1 w-4 rounded-full ${d === 2 ? 'bg-crimson-500' : 'bg-ink-200'}`} />
              ))}
            </div>
            <div className="rounded-xl border border-crimson-200/60 bg-crimson-50/30 p-4 text-center">
              <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide2 text-crimson-500">Question</div>
              <div className="font-serif text-sm font-medium text-ink-800">What is backpropagation?</div>
              <div className="mt-3 text-2xs text-ink-300">Click to flip</div>
            </div>
            <div className="mt-2 flex justify-between text-2xs text-ink-400">
              <span>3 / 24</span>
              <span>87% accuracy</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // graph
  return (
    <div className={common}>
      <div className="flex items-center gap-1.5 border-b border-ink-200/50 px-4 py-2.5">
        <Share2 size={12} className="text-crimson-600" />
        <span className="text-xs font-semibold text-ink-700">Knowledge Graph</span>
      </div>
      <div className="relative h-[calc(100%-38px)] w-full overflow-hidden">
        <svg className="absolute inset-0 h-full w-full">
          {[
            [50, 50, 22, 22], [50, 50, 78, 22], [50, 50, 22, 78], [50, 50, 78, 78],
            [50, 50, 50, 15], [22, 22, 78, 22], [22, 78, 78, 78],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#C9C6BF" strokeWidth={1} />
          ))}
        </svg>
        {[
          { label: 'Neural Net', x: 50, y: 50, main: true },
          { label: 'Gradient', x: 22, y: 22 },
          { label: 'Backprop', x: 78, y: 22 },
          { label: 'Loss', x: 22, y: 78 },
          { label: 'Optimizer', x: 78, y: 78 },
          { label: 'Activation', x: 50, y: 15 },
        ].map((n) => (
          <div
            key={n.label}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-2xs font-medium shadow-soft ${
              n.main ? 'border-2 border-crimson-400 bg-crimson-50 text-crimson-700' : 'border border-ink-200 bg-paper-50 text-ink-500'
            }`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenCard({ id, label, icon: Icon }: { id: string; label: string; icon: typeof BookOpen }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="group">
      <div className="mb-2.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
        <Icon size={11} className="text-crimson-500" />
        {label}
      </div>
      <div
        className="overflow-hidden rounded-xl border border-ink-200/60 bg-paper-50 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:border-crimson-200/60 group-hover:shadow-card"
        style={{ height: 200 }}
      >
        <ScreenMock id={id} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Workflow                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function WorkflowStep({ step, i, total }: { step: (typeof WORKFLOW)[number]; i: number; total: number }) {
  const Icon = step.icon;
  const isLast = i === total - 1;
  return (
    <motion.div variants={fadeUp} className="flex flex-1 items-center">
      <div className="flex flex-col items-center text-center">
        <motion.div
          whileHover={{ scale: 1.1, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-ink-200/60 bg-paper-50 text-crimson-600 shadow-soft"
        >
          <Icon size={20} strokeWidth={1.6} />
        </motion.div>
        <div className="mt-2 text-2xs font-semibold text-ink-700">{step.title}</div>
        <div className="text-2xs text-ink-400">{step.desc}</div>
      </div>
      {!isLast && (
        <div className="mx-1 mb-6 flex flex-1 items-center px-1">
          <div className="h-px flex-1 bg-gradient-to-r from-ink-200 to-ink-200/30" />
          <ArrowRight size={12} className="mx-1 text-ink-300" />
          <div className="h-px flex-1 bg-gradient-to-r from-ink-200/30 to-ink-200" />
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Cinematic story section                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function CinematicStory() {
  return (
    <section className="border-t border-ink-200/50 bg-paper-100 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-2xl">
          <motion.div variants={fadeUp}><SectionLabel>Scroll into understanding</SectionLabel></motion.div>
          <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">Reading becomes understanding in a single motion.</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-base text-ink-600">Each step feels like the workspace unfolding around the paper, turning passive reading into active comprehension.</motion.p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="rounded-[2rem] border border-ink-200/70 bg-paper-50 p-6 shadow-card"
          >
            <div className="mesh-gradient rounded-[1.5rem] border border-ink-200/60 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">Scene one</div>
                  <div className="font-serif text-2xl font-semibold text-ink-800">The page opens.</div>
                </div>
                <div className="rounded-full border border-crimson-200/60 bg-crimson-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide2 text-crimson-700">Live</div>
              </div>
                  <div className="rounded-2xl border border-ink-200/60 bg-paper-50/90 p-4 shadow-soft">
                <div className="h-2 w-24 rounded-full bg-ink-200" />
                <div className="mt-3 space-y-2">
                  {[78, 92, 68, 86].map((width, index) => (
                    <motion.div
                      key={width}
                      initial={{ width: 0, opacity: 0 }}
                      whileInView={{ width: `${width}%`, opacity: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                      className="h-2 rounded-full bg-ink-100"
                    />
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: 0.35 }}
                  className="mt-4 rounded-xl border border-crimson-200/60 bg-crimson-50/60 px-3 py-2 text-sm font-medium text-ink-700"
                >
                  Key ideas begin to appear as the paper is parsed.
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {CINEMATIC_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[1.5rem] border border-ink-200/70 bg-paper-50 p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-sm font-semibold text-crimson-700">0{index + 1}</div>
                  <div>
                    <div className="font-serif text-lg font-semibold text-ink-800">{step.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex h-full flex-col rounded-xl border border-ink-200/60 bg-paper-100 p-5"
    >
      <Quote size={18} className="mb-3 text-crimson-300" />
      <p className="flex-1 text-sm leading-relaxed text-ink-600">{t.quote}</p>
      <div className="mt-4 flex items-center gap-2.5 border-t border-ink-200/50 pt-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-200 text-sm">{t.icon}</div>
        <div>
          <div className="text-xs font-semibold text-ink-700">{t.name}</div>
          <div className="text-2xs text-ink-400">{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FAQ accordion                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

function FaqItem({ f, i, open, setOpen }: { f: (typeof FAQS)[number]; i: number; open: number | null; setOpen: (n: number | null) => void }) {
  const isOpen = open === i;
  return (
    <div className="overflow-hidden rounded-lg border border-ink-200/60 bg-paper-100">
      <button
        onClick={() => setOpen(isOpen ? null : i)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-ink-700">{f.q}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-ink-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-4 pb-4 text-sm leading-relaxed text-ink-500">{f.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Landing                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

export function Landing() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['features', 'workspace', 'how-it-works', 'faq'];
    const observers = sections.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      observer.observe(element);
      return { observer, element };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.element);
        }
      });
    };
  }, []);

  // Handle hash scroll on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(id);
        }, 150);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper-100 font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-transparent"
      >
        <motion.div
          animate={{ scaleX: scrollProgress }}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          className="h-full w-full rounded-full bg-gradient-to-r from-crimson-600 via-amber-500 to-crimson-400"
          style={{ transformOrigin: 'left center' }}
        />
      </motion.div>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-ink-200/40 bg-paper-100/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/');
                setActiveSection('');
              }
            }}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Logo size={32} />
            <span className="font-serif text-lg font-semibold tracking-tight text-ink-800">Lumora</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => {
              const id = l === 'Inside Lumora' ? 'workspace' : l.toLowerCase().replace(/ /g, '-');
              const isActive = activeSection === id;
              return (
                <a
                  key={l}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', `#${id}`);
                    setActiveSection(id);
                  }}
                  className={`relative text-sm transition-colors duration-200 ${
                    isActive ? 'text-crimson-700 font-semibold' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {l}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-crimson-600 to-crimson-400"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
            <a
              href="https://github.com/Jarjis-Alam/Lumora-AI-PDF"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
              aria-label="GitHub repository"
            >
              <Github size={15} /> GitHub
            </a>
          </nav>

          <Link
            to="/app"
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            Open Workspace <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-ink-200/70 bg-gradient-to-br from-paper-50 via-paper-100 to-paper-50 p-6 shadow-card md:p-10 lg:p-12">
          <motion.div
            animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-crimson-400/10 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
          />
          <div className="relative grid items-center gap-16 md:grid-cols-2 md:gap-20">
          {/* Left col */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-crimson-200/60 bg-gradient-to-r from-crimson-50 to-crimson-50/30 px-4 py-1.5 text-xs font-semibold text-crimson-700 shadow-glow-soft">
              <Sparkles size={13} className="animate-pulse-glow" />
              Your private research operating system
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl font-bold leading-[1.02] tracking-tight text-ink-900 md:text-6xl lg:text-7xl"
            >
              The research workspace<br />
              <span className="bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-700 bg-clip-text text-transparent">that turns reading into understanding.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg text-base leading-[1.7] text-ink-600"
            >
              Upload a paper, ask questions in natural language, and turn dense material into summaries, flashcards, quizzes, and a living knowledge graph — all grounded in citations.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-6">
              <SectionShell className="rounded-[1.5rem] border border-ink-200/70 bg-paper-50/90 p-4 shadow-soft">
                <p className="font-serif text-xl font-semibold leading-tight text-ink-800">
                  Reading gives information. Lumora creates clarity.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {EDITORIAL_POINTS.map((point) => (
                    <span key={point} className="rounded-full border border-ink-200/70 bg-paper-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide2 text-ink-500">
                      {point}
                    </span>
                  ))}
                </div>
              </SectionShell>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/app"
                className="btn-primary group flex items-center gap-2"
              >
                Open Workspace
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#canvas"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('canvas')?.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState(null, '', '#canvas');
                  setActiveSection('canvas');
                }}
                className="btn-secondary group flex items-center gap-2"
              >
                See AI in Action
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
              {TRUST_BRANDS.map((brand) => (
                <span key={brand} className="rounded-full border border-ink-200/70 bg-paper-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide2 text-ink-500">
                  {brand}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-6 text-xs text-ink-500">
              <span className="flex items-center gap-1.5 font-medium"><Lock size={13} className="text-emerald-600" /> Private by design</span>
              <span className="h-4 w-px bg-ink-200" />
              <span className="flex items-center gap-1.5 font-medium"><Zap size={13} className="text-amber-500" /> Instant indexing</span>
              <span className="h-4 w-px bg-ink-200" />
              <span className="flex items-center gap-1.5 font-medium"><Shield size={13} className="text-emerald-600" /> Cited answers</span>
            </motion.div>
          </motion.div>

          {/* Right col — realistic preview */}
          <HeroPreview />
          </div>
        </div>
      </section>

      {/* ── Canvas / Story ── */}
      <section id="canvas" className="relative border-t border-ink-200/50 bg-gradient-to-b from-paper-100 to-paper-50 py-24">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-paper-100 to-transparent" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <SectionShell className="p-4 shadow-soft md:p-6">
              <div className="rounded-[1.5rem] border border-ink-200/60 bg-gradient-to-br from-paper-100 to-paper-50 p-6 md:p-8">
                <div className="max-w-3xl text-center md:mx-auto">
                  <div className="text-[10px] font-semibold uppercase tracking-wide2 text-crimson-600">A distinct experience</div>
                  <div className="mt-2 font-serif text-2xl font-semibold text-ink-800 sm:text-3xl">Not just a dashboard. A workspace that feels alive.</div>
                </div>
              </div>
            </SectionShell>
          </div>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
              <motion.div variants={fadeUp}><SectionLabel>Research canvas</SectionLabel></motion.div>
              <motion.h2 variants={fadeUp} className="font-serif text-4xl font-bold text-ink-800">A workspace that grows with your thinking.</motion.h2>
              <motion.p variants={fadeUp} className="mt-4 max-w-xl text-base leading-[1.7] text-ink-600">
                Bring PDFs, answers, notes, and flashcards into one living surface. Lumora turns reading into a flowing research experience instead of a stack of tabs.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
                {CANVAS_ITEMS.map((item) => (
                  <span key={item} className="rounded-full border border-ink-200/70 bg-paper-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide2 text-ink-500">
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className=""
            >
              <SectionShell className="p-4 shadow-card">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-ink-200/60 bg-gradient-to-br from-paper-100 via-paper-50 to-crimson-50/30 p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(192,57,43,0.16),_transparent_38%)]" />
                  <div className="relative grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-ink-200/60 bg-paper-50/90 p-4 shadow-soft">
                      <div className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">Source</div>
                      <div className="mt-2 font-serif text-lg font-semibold text-ink-800">Deep Learning.pdf</div>
                      <div className="mt-2 text-sm text-ink-600">A dense paper becomes a set of concepts, summaries, and moments you can revisit instantly.</div>
                    </div>
                    <div className="space-y-3">
                      {['AI answer', 'Flashcards', 'Knowledge graph', 'Notes'].map((item, index) => (
                        <div key={item} className="rounded-2xl border border-ink-200/60 bg-paper-50/80 p-3 shadow-soft" style={{ transform: `translateY(${index * 2}px)` }}>
                          <div className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">{item}</div>
                          <div className="mt-1 text-sm font-medium text-ink-700">Connected to the source in one view</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionShell>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Lumora exists ── */}
      <section className="border-t border-ink-200/50 bg-paper-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
              <motion.div variants={fadeUp}><SectionLabel>Why Lumora exists</SectionLabel></motion.div>
              <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">Research should feel like discovery, not just decoding.</motion.h2>
              <motion.p variants={fadeUp} className="mt-3 max-w-xl text-base leading-[1.7] text-ink-600">
                Most tools help you read more. Lumora helps you connect the dots, revisit the right passages, and turn dense material into durable understanding.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
              className=""
            >
              <SectionShell className="p-5 shadow-card">
                <div className="rounded-[1.4rem] border border-ink-200/60 bg-gradient-to-br from-paper-100 via-paper-50 to-crimson-50/40 p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">The shift</div>
                  <div className="mt-2 font-serif text-xl font-semibold text-ink-800">From reading pages to building understanding.</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Citations', 'Every answer has a traceable path back to the source.'],
                      ['Memory tools', 'Summaries and flashcards turn the material into recall-ready study assets.'],
                      ['Graph view', 'Ideas become visible as a network rather than a wall of text.'],
                      ['Private workflow', 'Work stays local, focused, and controlled.'],
                    ].map(([title, body]) => (
                      <div key={title} className="rounded-2xl border border-ink-200/60 bg-paper-50/90 p-3">
                        <div className="text-sm font-semibold text-ink-800">{title}</div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionShell>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Premium pillars ── */}
      <section className="border-t border-ink-200/50 bg-gradient-to-b from-paper-50 to-paper-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex items-center justify-center">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
            <span className="mx-4 rounded-full border border-ink-200/70 bg-paper-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide2 text-ink-400">Built for serious reading</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
          </div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-3xl">
            <motion.div variants={fadeUp}><SectionLabel>Designed for depth</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">A research workspace that feels as thoughtful as the material you bring into it.</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-4 md:grid-cols-2"
          >
            {PREMIUM_PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar}
                variants={fadeUp}
                className="rounded-[1.5rem] border border-ink-200/70 bg-paper-50 p-5 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson-50 text-sm font-semibold text-crimson-700">
                    {index + 1}
                  </div>
                  <div className="font-serif text-lg font-semibold text-ink-800">{pillar}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-ink-200/50 bg-gradient-to-b from-paper-50 to-paper-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="mb-14 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Journey</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl font-bold text-ink-800">From upload to understanding in one motion.</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-base text-ink-600">Each step is designed to feel like part of a single research flow, not a collection of isolated features.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-5"
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} i={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="border-t border-ink-200/50 bg-paper-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Why Lumora</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">Research should feel like understanding, not just reading.</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="rounded-[1.75rem] border border-ink-200/70 bg-paper-50 p-6 shadow-soft">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide2 text-ink-400">Traditional PDF reader</div>
              <ul className="space-y-3 text-sm text-ink-600">
                {COMPARISON_ITEMS.left.map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-ink-300" />{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-crimson-200/60 bg-gradient-to-br from-crimson-50 via-paper-50 to-paper-100 p-6 shadow-card">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide2 text-crimson-600">Lumora</div>
              <ul className="space-y-3 text-sm text-ink-700">
                {COMPARISON_ITEMS.right.map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-crimson-500" />{item}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Inside Lumora — screenshots ── */}
      <section id="workspace" className="border-t border-ink-200/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-xl">
            <motion.div variants={fadeUp}><SectionLabel>Inside Lumora</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">A workspace, not a chatbot</motion.h2>
            <motion.p variants={fadeUp} className="mt-2 text-sm text-ink-500">Every view is designed to help you understand documents faster.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {SCREENS.map((s) => (
              <ScreenCard key={s.id} id={s.id} label={s.label} icon={s.icon} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works — visual workflow ── */}
      <section id="how-it-works" className="border-t border-ink-200/50 bg-paper-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-xl">
            <motion.div variants={fadeUp}><SectionLabel>How it works</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">From upload to understanding</motion.h2>
            <motion.p variants={fadeUp} className="mt-2 text-sm text-ink-500">A single workflow that turns any PDF into a study session.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="flex flex-wrap items-start justify-center gap-y-6 md:flex-nowrap"
          >
            {WORKFLOW.map((s, i) => (
              <WorkflowStep key={s.title} step={s} i={i} total={WORKFLOW.length} />
            ))}
          </motion.div>
        </div>
      </section>

      <CinematicStory />

      {/* ── Testimonials ── */}
      <section id="testimonials" className="border-t border-ink-200/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-xl">
            <motion.div variants={fadeUp}><SectionLabel>Testimonials</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">Loved by learners and researchers</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-ink-200/50 bg-paper-50 py-20">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-10">
            <motion.div variants={fadeUp}><SectionLabel>FAQ</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">Frequently asked questions</motion.h2>
          </motion.div>
          <div className="space-y-2.5">
            {FAQS.map((f, i) => (
              <FaqItem key={i} f={f} i={i} open={faqOpen} setOpen={setFaqOpen} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-ink-200/50 py-20">
        <div className="mx-auto mb-10 max-w-6xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl px-6"
        >
          <SectionShell className="rounded-[2.25rem] border border-ink-200/70 bg-gradient-to-br from-paper-50 via-paper-100 to-crimson-50/70 p-8 text-center shadow-card md:p-12">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-crimson-200/60 bg-crimson-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide2 text-crimson-700">
              <Sparkles size={12} /> The future of research starts here
            </div>
            <h2 className="font-serif text-3xl font-semibold text-ink-800 sm:text-4xl">Make your next paper feel smaller than it is.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">Open Lumora and turn the next PDF into a workspace of understanding, citations, and study-ready insight.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/app"
                className="group inline-flex items-center gap-2 rounded-lg bg-crimson-700 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-crimson-800 hover:shadow-card active:scale-[0.97]"
              >
                Open Lumora
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200/70 bg-paper-50 px-6 py-3 text-sm font-semibold text-ink-700 transition-all hover:border-crimson-200 hover:bg-paper-100"
              >
                Back to top
              </a>
            </div>
          </SectionShell>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ink-200/50 bg-gradient-to-b from-paper-50 to-paper-100 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionShell className="rounded-[2rem] border border-ink-200/70 bg-paper-50/90 p-8 shadow-soft md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="text-[10px] font-semibold uppercase tracking-wide2 text-crimson-600">The future of research</div>
                <div className="mt-2 font-serif text-3xl font-semibold text-ink-800">Built for minds that want more than a document viewer.</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="https://github.com/Jarjis-Alam/Lumora-AI-PDF" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-ink-200/70 bg-paper-100 px-4 py-2 text-sm font-semibold text-ink-700 transition-all hover:border-crimson-200 hover:bg-paper-50">
                  <Github size={14} /> GitHub
                </a>
                <Link to="/app" className="inline-flex items-center gap-2 rounded-lg bg-crimson-700 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-crimson-800">
                  Open Lumora
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </SectionShell>

          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <Link
                to="/"
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.history.pushState(null, '', '/');
                    setActiveSection('');
                  }
                }}
                className="inline-flex items-center gap-2.5 hover:opacity-85 transition-opacity"
              >
                <Logo size={24} />
                <span className="font-serif text-sm font-semibold text-ink-800">Lumora</span>
              </Link>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-400">
                AI-powered document intelligence. Understand any PDF faster.
              </p>
              <a
                href="https://github.com/Jarjis-Alam/Lumora-AI-PDF"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-500 transition-colors hover:text-ink-800"
              >
                <Github size={13} /> View on GitHub
              </a>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="mb-3 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">{heading}</h4>
                <ul className="space-y-2">
                  {links.map((l) => {
                    const classes = "text-xs text-ink-500 transition-colors hover:text-ink-800 cursor-pointer";
                    
                    if (heading === 'Product') {
                      const id = l === 'Inside Lumora' ? 'workspace' : l.toLowerCase().replace(/ /g, '-');
                      return (
                        <li key={l}>
                          <a
                            href={`#${id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                              window.history.pushState(null, '', `#${id}`);
                              setActiveSection(id);
                            }}
                            className={classes}
                          >
                            {l}
                          </a>
                        </li>
                      );
                    }

                    if (heading === 'Resources') {
                      if (l === 'GitHub') {
                        return (
                          <li key={l}>
                            <a
                              href="https://github.com/Jarjis-Alam/Lumora-AI-PDF"
                              target="_blank"
                              rel="noreferrer"
                              className={classes}
                            >
                              {l}
                            </a>
                          </li>
                        );
                      }
                      
                      const path = `/${l.toLowerCase()}`;
                      return (
                        <li key={l}>
                          <Link to={path} className={classes}>
                            {l}
                          </Link>
                        </li>
                      );
                    }

                    if (heading === 'Built with') {
                      const urls: Record<string, string> = {
                        React: 'https://react.dev',
                        FastAPI: 'https://fastapi.tiangolo.com',
                        Groq: 'https://groq.com',
                        PostgreSQL: 'https://www.postgresql.org',
                        Vercel: 'https://vercel.com',
                      };
                      return (
                        <li key={l}>
                          <a
                            href={urls[l] || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className={classes}
                          >
                            {l}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={l}>
                        <a href="#" className={classes}>{l}</a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-200/50 pt-6 sm:flex-row">
            <p className="text-2xs text-ink-400">© {new Date().getFullYear()} Lumora. All rights reserved.</p>
            <div className="flex items-center gap-3 text-2xs text-ink-400">
              <Link to="/privacy" className="transition-colors hover:text-ink-700">Privacy</Link>
              <span className="h-3 w-px bg-ink-200" />
              <Link to="/terms" className="transition-colors hover:text-ink-700">Terms</Link>
              <span className="h-3 w-px bg-ink-200" />
              <Link to="/license" className="flex items-center gap-1 transition-colors hover:text-ink-700">
                <Scale size={10} /> License
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
