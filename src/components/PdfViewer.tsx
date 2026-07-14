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
  AlertCircle,
} from 'lucide-react';
import { useStore, getCachedChunks, setCachedChunks } from '../store';
import { classNames } from '../lib/utils';
import { SkeletonPdfPage } from './Skeletons';
import { Tooltip } from './Tooltip';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
  const [fetchAttempt, setFetchAttempt] = useState(0);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!activeDocId) return;

    // Don't fetch with temporary frontend IDs — wait for real backend ID
    if (activeDocId.startsWith('temp-')) {
      setChunks([]);
      setLoading(false);
      return;
    }

    // Only use cache if it has actual data
    const cached = getCachedChunks(activeDocId);
    if (cached && cached.length > 0) {
      setChunks(cached);
      setLoading(false);
      return;
    }

    // Don't fetch chunks while document is still processing
    if (doc?.status === 'processing') {
      setChunks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(false);

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const doFetch = (attempt: number) => {
      fetch(`${API_BASE}/documents/${activeDocId}/chunks`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch chunks');
        })
        .then((data) => {
          if (cancelled) return;
          if (data.length > 0) {
            setChunks(data);
            setCachedChunks(activeDocId, data);
            setLoading(false);
          } else if (attempt < 10) {
            // Backend may still be processing — auto-retry in 3s
            retryTimer = setTimeout(() => doFetch(attempt + 1), 3000);
          } else {
            setChunks([]);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          console.error(err);
          if (attempt < 5) {
            // Network error — retry in 3s (backend might be cold-starting)
            retryTimer = setTimeout(() => doFetch(attempt + 1), 3000);
          } else {
            setChunks([]);
            setFetchError(true);
            setLoading(false);
          }
        });
    };

    doFetch(0);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [activeDocId, doc?.status, fetchAttempt]);

  const totalPages = doc?.pages || 1;
  const pageChunks = chunks
    .filter((c) => c.page === pdfPage)
    .sort((a, b) => a.paragraph - b.paragraph);
  const pageContent = pageChunks.map((c) => c.text);

  useEffect(() => {
    if (pdfHighlight && scrollRef.current) {
      const timerScroll = setTimeout(() => {
        const el = scrollRef.current?.querySelector(`[data-paragraph="${pdfHighlight.paragraph}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      const timerHighlight = setTimeout(() => setPdfHighlight(null), 3000);
      return () => {
        clearTimeout(timerScroll);
        clearTimeout(timerHighlight);
      };
    }
  }, [pdfHighlight, pdfPage, setPdfHighlight]);

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
        <Tooltip label="Zoom out" position="bottom">
          <button onClick={() => setPdfZoom(Math.max(0.6, pdfZoom - 0.15))} className="btn-ghost btn-sm">
            <ZoomOut size={15} />
          </button>
        </Tooltip>
        <span className="w-10 text-center text-2xs text-ink-400">{Math.round(pdfZoom * 100)}%</span>
        <Tooltip label="Zoom in" position="bottom">
          <button onClick={() => setPdfZoom(Math.min(2, pdfZoom + 0.15))} className="btn-ghost btn-sm">
            <ZoomIn size={15} />
          </button>
        </Tooltip>
        <div className="mx-1 h-5 w-px bg-ink-100" />
        <Tooltip label="Search in document" position="bottom">
          <button onClick={() => setSearchOpen((v) => !v)} className="btn-ghost btn-sm">
            <Search size={15} />
          </button>
        </Tooltip>
        <Tooltip label={doc.bookmarks.includes(pdfPage) ? 'Remove bookmark' : 'Bookmark page'} position="bottom">
          <button
            onClick={() => setPdfPage(pdfPage)}
            className={classNames('btn-ghost btn-sm', doc.bookmarks.includes(pdfPage) && 'text-crimson-600')}
          >
            <Bookmark size={15} fill={doc.bookmarks.includes(pdfPage) ? 'currentColor' : 'none'} />
          </button>
        </Tooltip>
        <Tooltip label={readingMode ? 'Exit reading mode' : 'Reading mode'} position="bottom">
          <button onClick={() => setReadingMode((v) => !v)} className="btn-ghost btn-sm">
            <Maximize2 size={15} />
          </button>
        </Tooltip>
        <div className="ml-auto flex items-center gap-1">
          <Tooltip label="Previous page" position="bottom">
            <button
              onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}
              disabled={pdfPage <= 1}
              className="btn-ghost btn-sm"
            >
              <ChevronLeft size={15} />
            </button>
          </Tooltip>
          <span className="text-2xs text-ink-400">
            {pdfPage} / {totalPages}
          </span>
          <Tooltip label="Next page" position="bottom">
            <button
              onClick={() => setPdfPage(Math.min(totalPages, pdfPage + 1))}
              disabled={pdfPage >= totalPages}
              className="btn-ghost btn-sm"
            >
              <ChevronRight size={15} />
            </button>
          </Tooltip>
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

            {doc.status === 'processing' ? (
              <div className="py-8">
                <div className="mb-4 text-center">
                  <h4 className="text-sm font-semibold text-ink-700">Processing "{doc.name}"</h4>
                  <p className="text-xs mt-1 text-ink-400 max-w-xs mx-auto leading-relaxed">
                    Analyzing pages and preparing AI workspace features...
                  </p>
                </div>
                <SkeletonPdfPage />
                <div className="mt-6 w-full max-w-xs mx-auto">
                  <div className="bg-ink-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-crimson-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="mt-2 text-center text-2xs text-sage font-semibold uppercase tracking-wider">
                    {Math.round(doc.progress)}% Complete
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div>
                <SkeletonPdfPage />
                <p className="mt-4 text-center text-2xs text-ink-400 font-medium animate-pulse">
                  Loading document content...
                </p>
              </div>
            ) : pageContent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-ink-400 px-6">
                {chunks.length === 0 ? (
                  fetchError ? (
                    <>
                      <AlertCircle className="text-red-400 mb-2" size={28} />
                      <h4 className="text-sm font-semibold text-ink-700">Unable to Connect</h4>
                      <p className="text-xs mt-1 max-w-xs leading-relaxed">
                        Could not reach the server. The backend may be starting up — this can take up to 60 seconds on the free tier.
                      </p>
                      <button
                        onClick={() => setFetchAttempt((n) => n + 1)}
                        className="mt-4 btn-primary btn-sm rounded px-4 py-2 text-xs cursor-pointer"
                      >
                        Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-amber-500 mb-2" size={28} />
                      <h4 className="text-sm font-semibold text-ink-700">Content Loading</h4>
                      <p className="text-xs mt-1 max-w-xs leading-relaxed">
                        Document text is still being processed. This may take a moment for scanned or large PDFs.
                      </p>
                      <button
                        onClick={() => setFetchAttempt((n) => n + 1)}
                        className="mt-4 btn-secondary btn-sm rounded px-3 py-1.5 text-xs cursor-pointer"
                      >
                        Retry Loading
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <AlertCircle className="text-amber-500 mb-2" size={28} />
                    <h4 className="text-sm font-semibold text-ink-700">No Text on This Page</h4>
                    <p className="text-xs mt-1 max-w-xs leading-relaxed">
                      Page {pdfPage} does not contain selectable text. It may be an image, figure, or blank page.
                    </p>
                  </>
                )}
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
