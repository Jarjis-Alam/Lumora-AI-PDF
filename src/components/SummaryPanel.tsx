import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  Clock,
  BookOpen,
  Lightbulb,
  List,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { SkeletonSummary } from './Skeletons';
import { Tooltip } from './Tooltip';

export function SummaryPanel({ docId }: { docId: string | null }) {
  const documents = useStore((s) => s.documents);
  const generateSummary = useStore((s) => s.generateSummary);
  const [generating, setGenerating] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const doc = documents.find((d) => d.id === docId);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const totalHeight = el.scrollHeight - el.clientHeight;
    if (totalHeight <= 0) {
      setScrollProgress(0);
      return;
    }
    const scrolled = (el.scrollTop / totalHeight) * 100;
    setScrollProgress(scrolled);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [doc?.summary, generating]);

  if (!docId || !doc) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No document selected"
        description="Select a document to generate and view its summary."
      />
    );
  }

  if (generating) {
    return <SkeletonSummary />;
  }

  if (!doc.summary) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No summary yet"
        description="Generate a comprehensive summary with key takeaways, concepts, and chapter breakdowns."
        action={{
          label: 'Generate Summary',
          onClick: async () => {
            setGenerating(true);
            try {
              await generateSummary(doc.id);
            } finally {
              setGenerating(false);
            }
          },
        }}
      />
    );
  }

  const s = doc.summary;

  const exportSummary = () => {
    const text = [
      `# ${doc.name} — Summary`,
      `\nReading time: ${s.readingTime} min\n`,
      '## Overall Summary',
      s.overall,
      '\n## Chapter Summaries',
      ...s.chapters.map((c) => `### ${c.heading}\n${c.body}`),
      '\n## Key Takeaways',
      ...s.keyTakeaways.map((t, i) => `${i + 1}. ${t}`),
      '\n## Important Concepts',
      ...s.concepts.map((c) => `- **${c.term}**: ${c.definition}`),
      '\n## Bullet Summary',
      ...s.bulletSummary.map((b) => `- ${b}`),
    ].join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto relative bg-paper-50/30">
      {/* Scroll reading progress bar */}
      <div className="sticky top-0 z-20 h-[3px] w-full bg-ink-100/30">
        <div
          className="h-full bg-crimson-500 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6 space-y-5">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink-800 tracking-editorial">Document Summary</h2>
            <div className="mt-1 flex items-center gap-3 text-[10px] font-semibold text-ink-400 uppercase tracking-wide2">
              <span className="flex items-center gap-1"><Clock size={11} /> {s.readingTime} min read</span>
              <span>·</span>
              <span className="flex items-center gap-1"><BookOpen size={11} /> {doc.pages} pages</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip label="Regenerate summary">
              <button
                onClick={async () => {
                  setGenerating(true);
                  try {
                    await generateSummary(doc.id);
                  } finally {
                    setGenerating(false);
                  }
                }}
                className="btn-secondary btn-sm rounded px-2.5 py-1.5"
              >
                <RefreshCw size={12} />
              </button>
            </Tooltip>
            <Tooltip label="Export markdown file">
              <button onClick={exportSummary} className="btn-secondary btn-sm rounded px-2.5 py-1.5">
                <Download size={12} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-3">
          <Section icon={BookOpen} title="Overall Summary">
            <p className="prose-editorial text-sm leading-relaxed text-ink-600 font-body">{s.overall}</p>
          </Section>

          <Section icon={List} title="Chapter Summaries">
            <div className="space-y-3">
              {s.chapters.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-ink-100 bg-paper-50 p-4 shadow-soft hover:shadow-card transition-shadow"
                >
                  <h4 className="mb-1 font-serif text-sm font-semibold text-ink-800">{c.heading}</h4>
                  <p className="text-xs leading-relaxed text-ink-500 font-body">{c.body}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          <Section icon={CheckCircle2} title="Key Takeaways">
            <ul className="space-y-2">
              {s.keyTakeaways.map((t, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-[10px] font-bold text-crimson-700">
                    {i + 1}
                  </span>
                  <span className="text-xs leading-relaxed text-ink-600 font-body">{t}</span>
                </motion.li>
              ))}
            </ul>
          </Section>

          <Section icon={Lightbulb} title="Important Concepts">
            <div className="grid gap-3 sm:grid-cols-2">
              {s.concepts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-lg border border-ink-100 bg-paper-50 p-3.5 shadow-soft hover:shadow-card transition-shadow"
                >
                  <p className="font-serif text-sm font-semibold text-crimson-800">{c.term}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500 font-body">{c.definition}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          <Section icon={List} title="Bullet Summary">
            <ul className="space-y-2">
              {s.bulletSummary.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-ink-600 font-body">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-crimson-400 animate-pulse-soft" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-ink-100/60 bg-paper-50 p-4 shadow-soft"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between font-serif text-base font-bold text-ink-800"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-crimson-600" />
          <span>{title}</span>
        </div>
        {collapsed ? (
          <ChevronDown size={14} className="text-ink-400" />
        ) : (
          <ChevronUp size={14} className="text-ink-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 border-t border-ink-100/30 pt-3.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
