import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { useStore } from '../store';

export function UploadZone({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const addDocument = useStore((s) => s.addDocument);
  const openDocument = useStore((s) => s.openDocument);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      // Client-side file type check
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Invalid file type. Only PDF files are allowed.');
        return;
      }

      // Client-side file size check (25MB limit)
      const maxLimit = 25 * 1024 * 1024;
      if (file.size > maxLimit) {
        alert('File is too large. Maximum allowed size is 25MB.');
        return;
      }

      setUploading(true);
      const sizeMB = file.size / (1024 * 1024) || 2.4;
      setTimeout(() => {
        const id = addDocument(file.name.replace(/\.pdf$/i, ''), sizeMB, file);
        setUploading(false);
        setTimeout(() => {
          openDocument(id);
          navigate('/app/workspace');
        }, 600);
      }, 800);
    },
    [addDocument, openDocument, navigate]
  );


  if (compact) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-ink-200 px-3 py-2 text-xs text-ink-400 transition-colors hover:border-crimson-300 hover:text-crimson-600"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
        {uploading ? 'Uploading...' : 'Upload PDF'}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`
        relative flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed
        transition-all duration-300
        ${dragging ? 'border-crimson-400 bg-crimson-50/50 scale-[1.01]' : 'border-ink-200 bg-paper-50/50'}
        ${compact ? 'p-6' : 'p-12'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <Loader2 size={36} className="animate-spin text-crimson-500" />
            <p className="text-sm font-medium text-ink-600">Uploading your document...</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <motion.div
              animate={dragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600"
            >
              <UploadCloud size={30} strokeWidth={1.5} />
            </motion.div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink-800">
                Upload your first PDF
              </h3>
              <p className="mt-1 text-sm text-ink-400">
                Drag and drop a document, or browse your files
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="btn-primary"
              >
                <FileText size={16} /> Browse Files
              </button>
            </div>
            <p className="text-2xs text-ink-300">PDF up to ~50 MB · Processed locally</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
