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
  Copy,
  MessageSquare,
  Lightbulb,
  Languages,
  RotateCw,
  BookmarkCheck,
  Grid3x3,
} from 'lucide-react';
import { useStore, getCachedChunks, setCachedChunks } from '../store';
import { classNames } from '../lib/utils';
import { SkeletonPdfPage } from './Skeletons';
import { Tooltip } from './Tooltip';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; paragraph: number } | null>(null);
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

    // Don't fetch if document metadata is not loaded in store yet
    if (!doc) {
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

  const handleParagraphDoubleClick = (e: React.MouseEvent, paraIndex: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, paragraph: paraIndex });
    setSelectedParagraph(paraIndex);
  };

  const handleCopyParagraph = () => {
    if (selectedParagraph !== null && pageContent[selectedParagraph]) {
      navigator.clipboard.writeText(pageContent[selectedParagraph]);
      setContextMenu(null);
    }
  };

  const handleExplainParagraph = () => {
    // This would integrate with chat panel
    setContextMenu(null);
  };

  // Calculate reading progress
  const readingProgress = totalPages > 0 ? (pdfPage / totalPages) * 100 : 0;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-paper-100 to-paper-200/60">
      {/* Enhanced Toolbar */}
      <div className="flex h-14 items-center gap-2 border-b border-ink-100/80 bg-paper-50/95 px-4 backdrop-blur-lg shadow-soft">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 rounded-lg border border-ink-200/60 bg-paper-100 px-2 py-1">
          <Tooltip label="Zoom out" position="bottom">
            <button 
              onClick={() => setPdfZoom(Math.max(0.6, pdfZoom - 0.15))} 
              className="btn-icon btn-xs"
              disabled={pdfZoom <= 0.6}
            >
              <ZoomOut size={14} />
            </button>
          </Tooltip>
          <span className="w-12 text-center text-xs font-semibold text-ink-600">{Math.round(pdfZoom * 100)}%</span>
          <Tooltip label="Zoom in" position="bottom">
            <button 
              onClick={() => setPdfZoom(Math.min(2, pdfZoom + 0.15))} 
              className="btn-icon btn-xs"
              disabled={pdfZoom >= 2}
            >
              <ZoomIn size={14} />
            </button>
          </Tooltip>
        </div>

        <div className="divider-vertical h-6" />

        {/* Tools */}
        <Tooltip label="Search in document" position="bottom">
          <button 
            onClick={() => setSearchOpen((v) => !v)} 
            className={classNames(
              'btn-icon',
              searchOpen ? 'bg-crimson-50 text-crimson-600' : ''
            )}
          >
            <Search size={16} />
          </button>
        </Tooltip>
        
        <Tooltip label={doc?.bookmarks.includes(pdfPage) ? 'Remove bookmark' : 'Bookmark page'} position="bottom">
          <button
            onClick={() => setPdfPage(pdfPage)}
            className={classNames(
              'btn-icon',
              doc?.bookmarks.includes(pdfPage) && 'bg-amber-50 text-amber-600'
            )}
          >
            {doc?.bookmarks.includes(pdfPage) ? (
              <BookmarkCheck size={16} fill="currentColor" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </Tooltip>
        
        <Tooltip label="Page thumbnails" position="bottom">
          <button 
            onClick={() => setThumbnailsOpen((v) => !v)} 
            className={classNames(
              'btn-icon',
              thumbnailsOpen && 'bg-crimson-50 text-crimson-600'
            )}
          >
            <Grid3x3 size={16} />
          </button>
        </Tooltip>
        
        <Tooltip label={readingMode ? 'Exit reading mode' : 'Reading mode'} position="bottom">
          <button 
            onClick={() => setReadingMode((v) => !v)} 
            className={classNames(
              'btn-icon',
              readingMode && 'bg-crimson-50 text-crimson-600'
            )}
          >
            <Maximize2 size={16} />
          </button>
        </Tooltip>

        {/* Page navigation */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-ink-200/60 bg-paper-100 px-3 py-1.5">
            <Tooltip label="Previous page (←)" position="bottom">
              <button
                onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}
                disabled={pdfPage <= 1}
                className="btn-icon btn-xs"
              >
                <ChevronLeft size={14} />
              </button>
            </Tooltip>
            <span className="text-xs font-semibold text-ink-700">
              {pdfPage}
            </span>
            <span className="text-xs text-ink-400">/ {totalPages}</span>
            <Tooltip label="Next page (→)" position="bottom">
              <button
                onClick={() => setPdfPage(Math.min(totalPages, pdfPage + 1))}
                disabled={pdfPage >= totalPages}
                className="btn-icon btn-xs"
              >
                <ChevronRight size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Reading Progress Bar */}
      <div className="h-1 bg-paper-100">
        <motion.div 
          className="h-full bg-gradient-to-r from-crimson-500 to-crimson-400"
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Enhanced Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-ink-100/80 bg-gradient-to-r from-paper-50 to-paper-100 shadow-soft"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search size={16} className="text-crimson-600" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="input input-sm flex-1 border-ink-200"
              />
              <button 
                onClick={() => setSearchOpen(false)} 
                className="btn-icon btn-sm"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page area with enhanced paper effect */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto" style={{ maxWidth: `${680 * pdfZoom}px` }}>
          <motion.div
            key={pdfPage}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl bg-paper-50 shadow-paper-lg"
            style={{ transformOrigin: 'top center' }}
          >
            {/* Paper texture overlay */}
            <div className="absolute inset-0 rounded-2xl paper-texture-faint pointer-events-none" />
            
            {/* Content area */}
            <div className="relative px-16 py-16" style={{ transform: `scale(${pdfZoom})`, transformOrigin: 'top center' }}>
              {/* Page number watermark */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-ink-300 font-serif">
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
                  <motion.p
                    key={i}
                    data-paragraph={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    onDoubleClick={(e) => handleParagraphDoubleClick(e, i)}
                    className={classNames(
                      'mb-4 transition-all duration-300 cursor-text group relative',
                      isHeading && 'font-serif text-2xl font-bold text-ink-900 mb-6',
                      isAuthor && 'text-sm text-ink-500 italic',
                      !isHeading && !isAuthor && 'text-base leading-[1.8] text-ink-700',
                      highlighted && 'rounded-xl bg-gradient-to-r from-crimson-100/80 to-crimson-50/60 px-4 py-3 ring-2 ring-crimson-300 shadow-soft animate-pulse-glow',
                      selectedParagraph === i && 'bg-amber-50/40 rounded-lg px-2 py-1'
                    )}
                  >
                    {para}
                    {/* Hover indicator */}
                    {!isHeading && !isAuthor && (
                      <span className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageSquare size={12} className="text-crimson-400" />
                      </span>
                    )}
                  </motion.p>
                );
              })
            )}
            </div>
          </motion.div>

          {/* Context Menu for Paragraph Actions */}
          <AnimatePresence>
            {contextMenu && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setContextMenu(null)}
                  className="fixed inset-0 z-40"
                />
                
                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'fixed',
                    left: contextMenu.x,
                    top: contextMenu.y,
                    zIndex: 50,
                  }}
                  className="rounded-xl border-2 border-ink-200/80 bg-paper-50 shadow-float min-w-[180px]"
                >
                  <div className="p-1.5">
                    <button
                      onClick={handleCopyParagraph}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-crimson-50 hover:text-crimson-700"
                    >
                      <Copy size={14} />
                      Copy Text
                    </button>
                    <button
                      onClick={handleExplainParagraph}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-crimson-50 hover:text-crimson-700"
                    >
                      <Lightbulb size={14} />
                      Explain This
                    </button>
                    <button
                      onClick={() => setContextMenu(null)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-crimson-50 hover:text-crimson-700"
                    >
                      <MessageSquare size={14} />
                      Ask About This
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Enhanced Thumbnails */}
          <AnimatePresence>
            {thumbnailsOpen && !readingMode && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
                className="mt-8 rounded-2xl border border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-4 shadow-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                    <Grid3x3 size={14} className="text-crimson-600" />
                    Page Navigator
                  </h3>
                  <button
                    onClick={() => setThumbnailsOpen(false)}
                    className="btn-icon btn-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {Array.from({ length: Math.min(totalPages, 24) }).map((_, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setPdfPage(i + 1);
                        setThumbnailsOpen(false);
                      }}
                      className={classNames(
                        'group flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all',
                        pdfPage === i + 1
                          ? 'border-crimson-400 bg-gradient-to-br from-crimson-50 to-crimson-100/50 shadow-soft'
                          : 'border-ink-200/60 bg-paper-50 hover:border-crimson-300 hover:shadow-soft'
                      )}
                    >
                      {/* Mini page preview */}
                      <div className="mb-2 flex w-full flex-col gap-1">
                        <div className={classNames(
                          'h-1 rounded-full transition-colors',
                          pdfPage === i + 1 ? 'bg-crimson-400' : 'bg-ink-200 group-hover:bg-ink-300'
                        )} style={{ width: '90%' }} />
                        <div className={classNames(
                          'h-0.5 rounded-full transition-colors',
                          pdfPage === i + 1 ? 'bg-crimson-300' : 'bg-ink-100 group-hover:bg-ink-200'
                        )} style={{ width: '100%' }} />
                        <div className={classNames(
                          'h-0.5 rounded-full transition-colors',
                          pdfPage === i + 1 ? 'bg-crimson-300' : 'bg-ink-100 group-hover:bg-ink-200'
                        )} style={{ width: '85%' }} />
                        <div className={classNames(
                          'h-0.5 rounded-full transition-colors',
                          pdfPage === i + 1 ? 'bg-crimson-300' : 'bg-ink-100 group-hover:bg-ink-200'
                        )} style={{ width: '70%' }} />
                      </div>
                      <span className={classNames(
                        'text-xs font-semibold transition-colors',
                        pdfPage === i + 1 ? 'text-crimson-700' : 'text-ink-500 group-hover:text-ink-700'
                      )}>
                        {i + 1}
                      </span>
                      {doc?.bookmarks.includes(i + 1) && (
                        <BookmarkCheck size={10} className="absolute -right-1 -top-1 text-amber-600" fill="currentColor" />
                      )}
                    </motion.button>
                  ))}
                </div>
                {totalPages > 24 && (
                  <p className="mt-3 text-center text-2xs text-ink-400">
                    Showing first 24 pages of {totalPages}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
