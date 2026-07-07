import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Clock, BookOpen, Lightbulb, List, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { ProcessingOverlay } from './Skeletons';

export function SummaryPanel({ docId }: { docId: string | null }) {
  const documents = useStore((s) => s.documents);
  const generateSummary = useStore((s) => s.generateSummary);
  const [generating, setGenerating] = useState(false);

  const doc = documents.find((d) => d.id === docId);

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
    return <ProcessingOverlay label="Generating summary..." />;
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
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink-800">Document Summary</h2>
            <div className="mt-2 flex items-center gap-4 text-2xs text-ink-400">
              <span className="flex items-center gap-1"><Clock size={12} /> {s.readingTime} min read</span>
              <span className="flex items-center gap-1"><BookOpen size={12} /> {doc.pages} pages</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setGenerating(true);
                try {
                  await generateSummary(doc.id);
                } finally {
                  setGenerating(false);
                }
              }}
              className="btn-secondary btn-sm"
            >
              <RefreshCw size={13} /> Regenerate
            </button>
            <button onClick={exportSummary} className="btn-secondary btn-sm">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <Section icon={BookOpen} title="Overall Summary">
          <p className="prose-editorial">{s.overall}</p>
        </Section>

        <Section icon={List} title="Chapter Summaries">
          <div className="space-y-4">
            {s.chapters.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-ink-100 bg-paper-100/50 p-4"
              >
                <h4 className="mb-1.5 font-serif text-sm font-semibold text-ink-800">{c.heading}</h4>
                <p className="text-sm leading-relaxed text-ink-500">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section icon={CheckCircle2} title="Key Takeaways">
          <ul className="space-y-2.5">
            {s.keyTakeaways.map((t, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-2xs font-bold text-crimson-600">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-ink-600">{t}</span>
              </motion.li>
            ))}
          </ul>
        </Section>

        <Section icon={Lightbulb} title="Important Concepts">
          <div className="grid gap-3 sm:grid-cols-2">
            {s.concepts.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg border border-ink-100 bg-paper-100/50 p-3"
              >
                <p className="font-serif text-sm font-semibold text-crimson-700">{c.term}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{c.definition}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section icon={List} title="Bullet Summary">
          <ul className="space-y-2">
            {s.bulletSummary.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-600">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-crimson-400" />
                {b}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="text-crimson-500" />
        <h3 className="font-serif text-lg font-semibold text-ink-800">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}
