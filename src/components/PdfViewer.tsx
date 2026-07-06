import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Search,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store';
import { classNames } from '../lib/utils';

const API_BASE = 'http://localhost:8000/api';

export function PdfViewer() {
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const pdfPage = useStore((s) => s.pdfPage);
  const pdfZoom = useStore((s) => s.pdfZoom);
  const pdfHighlight = useStore((s) => s.pdfHighlight);
  const setPdfPage = useStore((s) => s.setPdfPage);
  const setPdfZoom = useStore((s) => s.setPdfZoom);
  const setPdfHighlight = useStore((s) => s.setPdfHighlight);

  const doc = documents.find((d) => d.id === activeDocId);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [readingMode, setReadingMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [chunks, setChunks] = useState<{ page: number; paragraph: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDocId) return;
    setLoading(true);
    fetch(`${API_BASE}/documents/${activeDocId}/chunks`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch chunks');
      })
      .then((data) => {
        setChunks(data);
      })
      .catch((err) => {
        console.error(err);
        setChunks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeDocId, doc?.status]);

  const totalPages = doc?.pages || 1;
  const pageChunks = chunks
    .filter((c) => c.page === pdfPage)
    .sort((a, b) => a.paragraph - b.paragraph);
  const pageContent = pageChunks.map((c) => c.text);

  useEffect(() => {
    if (pdfHighlight && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-paragraph="${pdfHighlight.paragraph}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setPdfHighlight(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [pdfHighlight, setPdfHighlight]);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-400">
        Select a document to view
      </div>
    );
  }

  const isHighlighted = (paraIndex: number) =>
    pdfHighlight && pdfHighlight.page === pdfPage && pdfHighlight.paragraph === paraIndex;

  return (
    <div className="flex h-full flex-col bg-paper-200/40">
      {/* Toolbar */}
      <div className="flex h-11 items-center gap-1 border-b border-ink-100/80 bg-paper-50/80 px-2 backdrop-blur-sm">
        <button onClick={() => setPdfZoom(Math.max(0.6, pdfZoom - 0.15))} className="btn-ghost btn-sm" title="Zoom out">
          <ZoomOut size={15} />
        </button>
        <span className="w-10 text-center text-2xs text-ink-400">{Math.round(pdfZoom * 100)}%</span>
        <button onClick={() => setPdfZoom(Math.min(2, pdfZoom + 0.15))} className="btn-ghost btn-sm" title="Zoom in">
          <ZoomIn size={15} />
        </button>
        <div className="mx-1 h-5 w-px bg-ink-100" />
        <button onClick={() => setSearchOpen((v) => !v)} className="btn-ghost btn-sm" title="Search">
          <Search size={15} />
        </button>
        <button
          onClick={() => setPdfPage(pdfPage)}
          className={classNames('btn-ghost btn-sm', doc.bookmarks.includes(pdfPage) && 'text-crimson-600')}
          title="Bookmark page"
        >
          <Bookmark size={15} fill={doc.bookmarks.includes(pdfPage) ? 'currentColor' : 'none'} />
        </button>
        <button onClick={() => setReadingMode((v) => !v)} className="btn-ghost btn-sm" title="Reading mode">
          <Maximize2 size={15} />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}
            disabled={pdfPage <= 1}
            className="btn-ghost btn-sm"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-2xs text-ink-400">
            {pdfPage} / {totalPages}
          </span>
          <button
            onClick={() => setPdfPage(Math.min(totalPages, pdfPage + 1))}
            disabled={pdfPage >= totalPages}
            className="btn-ghost btn-sm"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-ink-100/80 bg-paper-50 px-3"
          >
            <div className="flex items-center gap-2 py-2">
              <Search size={14} className="text-ink-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="flex-1 bg-transparent text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-ink-400 hover:text-ink-600">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto" style={{ maxWidth: `${620 * pdfZoom}px` }}>
          <motion.div
            key={pdfPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-lg bg-paper-50 px-12 py-14 shadow-card"
            style={{ transform: `scale(${pdfZoom})`, transformOrigin: 'top center' }}
          >
            {/* Page number watermark */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xs text-ink-300">
              — {pdfPage} —
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-ink-400 gap-2">
                <Loader2 className="animate-spin text-crimson-500" size={24} />
                <span className="text-xs">Loading page content...</span>
              </div>
            ) : pageContent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-ink-400 px-6">
                <AlertCircle className="text-amber-500 mb-2" size={28} />
                <h4 className="text-sm font-semibold text-ink-700">No Selectable Text</h4>
                <p className="text-xs mt-1 max-w-xs leading-relaxed">
                  This page does not contain any digital text. It might be a scanned document or image-only PDF.
                </p>
              </div>
            ) : (
              pageContent.map((para, i) => {
                const isHeading = i === 0 || para.match(/^\d+\s/) || para === 'Abstract';
                const isAuthor = i === 1 && pdfPage === 1;
                const highlighted = isHighlighted(i);
                return (
                  <p
                    key={i}
                    data-paragraph={i}
                    className={classNames(
                      'mb-4 transition-all duration-500',
                      isHeading && 'font-serif text-xl font-semibold text-ink-800',
                      isAuthor && 'text-sm text-ink-400',
                      !isHeading && !isAuthor && 'text-[15px] leading-[1.8] text-ink-600',
                      highlighted && 'rounded-md bg-crimson-100/60 px-2 py-1 ring-2 ring-crimson-300'
                    )}
                  >
                    {para}
                  </p>
                );
              })
            )}
          </motion.div>

          {/* Thumbnails */}
          {!readingMode && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPdfPage(i + 1)}
                  className={classNames(
                    'flex h-20 w-14 flex-col items-center justify-center rounded border text-2xs transition-all',
                    pdfPage === i + 1
                      ? 'border-crimson-400 bg-crimson-50 text-crimson-700 shadow-soft'
                      : 'border-ink-100 bg-paper-50 text-ink-400 hover:border-ink-200'
                  )}
                >
                  <div className="mb-1 h-1 w-8 rounded bg-ink-200" />
                  <div className="mb-0.5 h-1 w-10 rounded bg-ink-100" />
                  <div className="mb-0.5 h-1 w-9 rounded bg-ink-100" />
                  <div className="h-1 w-7 rounded bg-ink-100" />
                  <span className="mt-1">{i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
