import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { Citation } from '../types';
import { useStore } from '../store';

export function CitationChip({ citation, index }: { citation: Citation; index: number }) {
  const setPdfHighlight = useStore((s) => s.setPdfHighlight);
  const setPdfPage = useStore((s) => s.setPdfPage);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => {
        setPdfPage(citation.page);
        setPdfHighlight({ page: citation.page, paragraph: citation.paragraph });
      }}
      className="group inline-flex items-center gap-1.5 rounded-md border border-crimson-200 bg-crimson-50/60 px-2 py-0.5 text-2xs font-medium text-crimson-700 transition-colors hover:bg-crimson-100"
      title={citation.text}
    >
      <BookOpen size={11} />
      p.{citation.page}¶{citation.paragraph + 1}
    </motion.button>
  );
}
