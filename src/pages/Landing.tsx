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
  Search,
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
  Paperclip,
  Hash,
} from 'lucide-react';
import { Logo } from '../components/Logo';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Data                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = ['Features', 'Inside Lumora', 'How it works', 'FAQ'];

const FEATURES = [
  { icon: MessageSquare, title: 'AI Chat', desc: 'Ask questions about your documents and get cited, streaming answers in real time.' },
  { icon: AlignLeft, title: 'Smart Summaries', desc: 'Generate chapter summaries, key takeaways, and concept definitions instantly.' },
  { icon: Layers, title: 'Flashcards', desc: 'Auto-generate study cards from any document with a flip-animation study mode.' },
  { icon: ListChecks, title: 'Quizzes', desc: 'Test your understanding with MCQ, true/false, and short-answer quizzes.' },
  { icon: Share2, title: 'Knowledge Graph', desc: 'Explore concepts and their relationships in a zoomable interactive graph.' },
  { icon: Search, title: 'Semantic Search', desc: 'Search by meaning across all your documents, not just by keyword match.' },
];

const WORKFLOW = [
  { icon: Upload, title: 'Upload PDF', desc: 'Drag in any document.' },
  { icon: Cpu, title: 'AI Processing', desc: 'Indexing & embeddings.' },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Chat with citations.' },
  { icon: AlignLeft, title: 'Summary', desc: 'Chapter-level takeaways.' },
  { icon: Layers, title: 'Flashcards', desc: 'Auto-generated study cards.' },
  { icon: ListChecks, title: 'Quiz', desc: 'Test your understanding.' },
  { icon: Network, title: 'Knowledge Graph', desc: 'Explore connections.' },
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

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Hero — realistic product preview                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
      className="relative"
    >
      {/* Soft glow behind */}
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-br from-crimson-100/40 via-transparent to-transparent blur-2xl" />

      <div className="overflow-hidden rounded-xl border border-ink-200/70 bg-paper-50 shadow-[0_12px_60px_rgba(28,27,25,0.12)]">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-ink-200/60 bg-paper-100 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 flex items-center gap-1.5 text-xs text-ink-400">
            <Logo size={14} /> Lumora Workspace
          </span>
        </div>

        {/* App body */}
        <div className="flex" style={{ height: 380 }}>
          {/* Sidebar */}
          <div className="w-40 shrink-0 border-r border-ink-200/50 bg-paper-100 p-2.5">
            <div className="mb-2 px-2 text-2xs font-semibold uppercase tracking-wide2 text-ink-300">Library</div>
            {[
              { icon: FileText, label: 'Deep Learning.pdf', active: true },
              { icon: FileText, label: 'Attention Is All You Need' },
              { icon: FileText, label: 'Linear Algebra Notes' },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.label}
                  className={`mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-2xs ${
                    d.active ? 'bg-crimson-50 font-medium text-crimson-700' : 'text-ink-400'
                  }`}
                >
                  <Icon size={11} className="shrink-0" />
                  <span className="truncate">{d.label}</span>
                </div>
              );
            })}

            <div className="mb-2 mt-3 px-2 text-2xs font-semibold uppercase tracking-wide2 text-ink-300">Tools</div>
            {[
              { icon: MessageSquare, label: 'AI Chat', active: true },
              { icon: AlignLeft, label: 'Summary' },
              { icon: Layers, label: 'Flashcards' },
              { icon: ListChecks, label: 'Quiz' },
              { icon: Share2, label: 'Graph' },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className={`mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-2xs ${
                    t.active ? 'bg-crimson-50 font-medium text-crimson-700' : 'text-ink-400'
                  }`}
                >
                  <Icon size={11} className="shrink-0" />
                  {t.label}
                </div>
              );
            })}
          </div>

          {/* Main area */}
          <div className="flex flex-1 flex-col">
            {/* Document header */}
            <div className="flex items-center justify-between border-b border-ink-200/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-crimson-600" />
                <span className="text-xs font-medium text-ink-700">Deep Learning.pdf</span>
                <span className="text-2xs text-ink-300">· 312 pages</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-2xs font-medium text-sage">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Indexed
                </span>
                <span className="text-2xs text-ink-300">p.18 / 312</span>
              </div>
            </div>

            {/* Chat + PDF split */}
            <div className="flex flex-1 overflow-hidden">
              {/* Chat panel */}
              <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-3">
                {/* User msg */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg rounded-tr-sm bg-crimson-700 px-3 py-1.5 text-2xs text-white">
                    What is gradient descent?
                  </div>
                </div>

                {/* AI msg */}
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson-100 text-2xs font-bold text-crimson-700">L</div>
                  <div className="flex-1">
                    <div className="rounded-lg rounded-tl-sm border border-ink-200/60 bg-paper-50 px-3 py-2 text-2xs leading-relaxed text-ink-600">
                      Gradient descent is an optimization algorithm that iteratively adjusts
                      parameters to minimize a loss function by moving in the direction of
                      steepest descent.
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-crimson-50 px-1.5 py-0.5 text-2xs font-medium text-crimson-600">
                          <Hash size={8} /> p.18
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-crimson-50 px-1.5 py-0.5 text-2xs font-medium text-crimson-600">
                          <Hash size={8} /> p.42
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-crimson-50 px-1.5 py-0.5 text-2xs font-medium text-crimson-600">
                          <Hash size={8} /> p.67
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson-100 text-2xs font-bold text-crimson-700">L</div>
                  <div className="flex items-center gap-1 rounded-lg rounded-tl-sm border border-ink-200/60 bg-paper-50 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>

                {/* Input */}
                <div className="mt-auto flex items-center gap-2 rounded-lg border border-ink-200/70 bg-paper-100 px-3 py-2">
                  <Paperclip size={12} className="text-ink-300" />
                  <span className="text-2xs text-ink-300">Ask anything about this document…</span>
                  <div className="ml-auto flex h-5 w-5 items-center justify-center rounded bg-crimson-700 text-white">
                    <ArrowRight size={10} />
                  </div>
                </div>
              </div>

              {/* PDF + side panel */}
              <div className="flex w-44 shrink-0 flex-col border-l border-ink-200/50 bg-paper-100">
                {/* PDF page */}
                <div className="flex-1 overflow-hidden p-2.5">
                  <div className="rounded-md border border-ink-200/50 bg-paper-50 p-2.5 shadow-soft">
                    <div className="mb-1.5 text-2xs font-serif font-semibold text-ink-700">Chapter 4 · Gradient Descent</div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded bg-ink-100" />
                      <div className="h-1.5 w-4/5 rounded bg-ink-100" />
                      <div className="h-1.5 w-full rounded bg-ink-100" />
                      <div className="h-1.5 w-3/4 rounded bg-ink-100" />
                      {/* Highlighted line */}
                      <div className="my-1 rounded bg-crimson-100/60 px-1 py-0.5">
                        <div className="h-1.5 w-full rounded bg-crimson-300/50" />
                      </div>
                      <div className="h-1.5 w-5/6 rounded bg-ink-100" />
                      <div className="h-1.5 w-full rounded bg-ink-100" />
                      <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                    </div>
                  </div>
                </div>

                {/* Flashcard mini */}
                <div className="border-t border-ink-200/50 p-2.5">
                  <div className="mb-1.5 flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide2 text-crimson-600">
                    <Layers size={9} /> Flashcard
                  </div>
                  <div className="rounded-md border border-crimson-200/60 bg-crimson-50/40 p-2">
                    <div className="text-2xs font-medium text-ink-700">What is the learning rate?</div>
                    <div className="mt-1 text-2xs leading-relaxed text-ink-400">Step size taken in the parameter space per iteration.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating summary chip */}
      <motion.div
        initial={{ opacity: 0, y: 12, x: 8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute -bottom-4 -left-4 hidden rounded-lg border border-ink-200/60 bg-paper-50 p-2.5 shadow-card lg:block"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-crimson-50 text-crimson-600">
            <AlignLeft size={13} />
          </div>
          <div>
            <div className="text-2xs font-semibold text-ink-700">Summary ready</div>
            <div className="text-2xs text-ink-400">12 key takeaways generated</div>
          </div>
          <CheckCircle2 size={13} className="ml-1 text-sage" />
        </div>
      </motion.div>

      {/* Floating processing chip */}
      <motion.div
        initial={{ opacity: 0, y: -12, x: -8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute -top-3 -right-3 hidden items-center gap-1.5 rounded-full border border-ink-200/60 bg-paper-50 px-2.5 py-1 shadow-card sm:flex"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-crimson-500" />
        </span>
        <span className="text-2xs font-medium text-ink-500">Processing embeddings</span>
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
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group flex h-full flex-col rounded-xl border border-ink-200/60 bg-paper-100 p-5 transition-colors hover:border-crimson-200 hover:shadow-card"
    >
      <motion.div
        whileHover={{ rotate: -6, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-crimson-50 text-crimson-600 transition-colors group-hover:bg-crimson-100"
      >
        <Icon size={20} strokeWidth={1.6} />
      </motion.div>
      <h3 className="font-serif text-sm font-semibold text-ink-800">{f.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{f.desc}</p>
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
    <motion.div variants={fadeUp} className="group">
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
/*  Testimonial card                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

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

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-ink-200/40 bg-paper-100/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
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
            className="flex items-center gap-2.5"
          >
            <Logo size={28} />
            <span className="font-serif text-base font-semibold text-ink-800">Lumora</span>
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
                  className={`text-sm transition-colors duration-200 ${
                    isActive ? 'text-crimson-700 font-medium' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {l}
                </a>
              );
            })}
            <a
              href="https://github.com"
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
            className="flex items-center gap-1.5 rounded-lg bg-crimson-700 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-crimson-800 hover:shadow-card active:scale-[0.97]"
          >
            Open Workspace <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left col */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/60 px-3 py-1 text-xs font-medium text-crimson-700">
              <Sparkles size={11} />
              AI-powered document intelligence
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-ink-900 md:text-6xl"
            >
              Learn Faster.<br />
              <span className="text-crimson-700">Understand Deeper.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-sm text-[15px] leading-[1.65] text-ink-500"
            >
              Lumora turns your PDFs into a private research workspace. Upload a document,
              chat with it, generate summaries and flashcards, take quizzes, and explore a
              knowledge graph — all with citations you can trust.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/app"
                className="group flex items-center gap-2 rounded-lg bg-crimson-700 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-crimson-800 hover:shadow-card active:scale-[0.97]"
              >
                Start Researching
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#workspace"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState(null, '', '#workspace');
                  setActiveSection('workspace');
                }}
                className="group flex items-center gap-2 rounded-lg border border-ink-300 bg-transparent px-5 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:border-ink-400 hover:bg-paper-200 active:scale-[0.97]"
              >
                See Lumora in Action
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 text-2xs text-ink-400">
              <span className="flex items-center gap-1"><Lock size={11} className="text-sage" /> Private by design</span>
              <span className="h-3 w-px bg-ink-200" />
              <span className="flex items-center gap-1"><Zap size={11} className="text-crimson-500" /> Instant indexing</span>
              <span className="h-3 w-px bg-ink-200" />
              <span className="flex items-center gap-1"><Shield size={11} className="text-sage" /> Cited answers</span>
            </motion.div>
          </motion.div>

          {/* Right col — realistic preview */}
          <HeroPreview />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-ink-200/50 bg-paper-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-12 max-w-xl">
            <motion.div variants={fadeUp}><SectionLabel>Features</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-semibold text-ink-800">Everything you need in one place</motion.h2>
            <motion.p variants={fadeUp} className="mt-2 text-sm text-ink-500">A complete document intelligence workspace — not just a chatbot.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} i={i} />
            ))}
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

      {/* ── About the Dev ── */}
      <section id="developer" className="border-t border-ink-200/50 py-20 bg-paper-100">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 md:grid-cols-3 md:items-center">
            {/* Left col - Avatar / Logo */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-crimson-600 to-crimson-400 font-serif text-3xl font-semibold text-white shadow-soft">
                M
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper-100 bg-emerald-500 text-[10px] text-white">
                  💻
                </div>
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">Munshi Jarjis Alam</h3>
              <p className="text-2xs text-ink-400 font-medium mt-1">Creator of Lumora</p>
            </div>

            {/* Right col - Bio & Links */}
            <div className="md:col-span-2 space-y-4">
              <SectionLabel>About the Developer</SectionLabel>
              <h2 className="font-serif text-3xl font-semibold text-ink-800">Building local-first AI workspace tooling</h2>
              <p className="text-sm text-ink-500 leading-relaxed">
                Munshi Jarjis Alam is a software engineer and AI builder dedicated to crafting performant web systems and local-first document intelligence workflows. Lumora was designed as a modern study workspace to help researchers and students parse and comprehend dense PDF textbooks and papers using Groq and lightweight, responsive UI layers.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a
                  href="https://github.com/Jarjis-Alam"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ink-500 transition-colors hover:text-ink-800"
                >
                  <Github size={13} /> GitHub Profile
                </a>
              </div>
            </div>
          </div>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl px-6 text-center"
        >
          <h2 className="font-serif text-3xl font-semibold text-ink-800">Ready to learn faster?</h2>
          <p className="mt-3 text-sm text-ink-500">Upload your first PDF and start asking questions.</p>
          <Link
            to="/app"
            className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-crimson-700 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-crimson-800 hover:shadow-card active:scale-[0.97]"
          >
            Open Workspace
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ink-200/50 bg-paper-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
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
