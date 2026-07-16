import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  MoreVertical,
  Trash2,
  Pencil,
  Check,
  AlignLeft,
  Layers,
  ListChecks,
  Share2,
  ExternalLink,
  Clock,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../types';
import { useStore } from '../store';
import { timeAgo, formatBytes } from '../lib/utils';
import { Tooltip } from './Tooltip';

export function DocumentCard({ doc, index = 0 }: { doc: Document; index?: number }) {
  const navigate = useNavigate();
  const openDocument = useStore((s) => s.openDocument);
  const removeDocument = useStore((s) => s.removeDocument);
  const renameDocument = useStore((s) => s.renameDocument);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(doc.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleRename = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Name is required.");
      setName(doc.name);
      setEditing(false);
      return;
    }
    if (trimmed.length > 100) {
      alert("Name cannot exceed 100 characters.");
      return;
    }
    const cleanName = trimmed.replace(/<[^>]*>/g, '');
    if (!cleanName) {
      alert("Invalid characters in name.");
      setName(doc.name);
      setEditing(false);
      return;
    }
    const finalName = cleanName.toLowerCase().endsWith('.pdf') ? cleanName : `${cleanName}.pdf`;
    renameDocument(doc.id, finalName);
    setEditing(false);
  };

  const statusBadge = () => {
    if (doc.status === 'processing')
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="chip border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 font-semibold"
        >
          <span className="processing-dot" style={{ animationDelay: '0ms' }} />
          <span className="processing-dot" style={{ animationDelay: '200ms' }} />
          <span className="processing-dot" style={{ animationDelay: '400ms' }} />
          Processing {Math.round(doc.progress)}%
        </motion.span>
      );
    if (doc.status === 'error') 
      return (
        <span className="chip border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 text-red-800 font-semibold">
          Error
        </span>
      );
    return (
      <span className="chip border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-800 font-semibold">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Ready
      </span>
    );
  };

  const features = [
    { icon: AlignLeft, available: !!doc.summary, label: 'Summary' },
    { icon: Layers, available: doc.flashcards.length > 0, label: `${doc.flashcards.length} cards` },
    { icon: ListChecks, available: doc.quiz.length > 0, label: `${doc.quiz.length} Q` },
    { icon: Share2, available: !!doc.graph, label: 'Graph' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
        doc.status === 'ready'
          ? 'border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 hover:border-ink-300 hover:shadow-paper'
          : 'border-ink-100/60 bg-paper-100/50'
      }`}
      onClick={() => {
        if (doc.status !== 'ready') return;
        openDocument(doc.id);
        navigate('/app/workspace');
      }}
    >
      {/* Gradient accent bar at top */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-all group-hover:h-1.5"
        style={{
          background: `linear-gradient(90deg, ${doc.accent}E6 0%, ${doc.accent} 100%)`,
        }}
      />

      {/* Card content */}
      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Enhanced PDF thumbnail */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="relative flex h-16 w-14 shrink-0 flex-col justify-between rounded-lg border-2 border-ink-200/60 bg-white p-2 shadow-soft transition-all group-hover:shadow-card"
          >
            {/* Header lines */}
            <div className="space-y-1">
              <div className="h-[3px] w-5/6 rounded-full bg-ink-200" />
              <div className="h-[2px] w-full rounded-full bg-ink-100" />
              <div className="h-[2px] w-3/4 rounded-full bg-ink-100" />
            </div>
            {/* Graphic marker block */}
            <div
              className="h-4 w-full rounded opacity-20"
              style={{ backgroundColor: doc.accent }}
            />
            {/* Footer */}
            <div className="flex justify-between items-center text-[7px] font-bold text-ink-400">
              <span>PDF</span>
              <span>{doc.pages}p</span>
            </div>
            {/* Corner badge */}
            <div
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full border-2 border-white shadow-soft flex items-center justify-center text-white text-[8px] font-bold"
              style={{ backgroundColor: doc.accent }}
            >
              {doc.pages}
            </div>
          </motion.div>

          {/* Document info */}
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') {
                      setName(doc.name);
                      setEditing(false);
                    }
                  }}
                  className="flex-1 rounded-lg border-2 border-crimson-400 px-3 py-1.5 text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
                />
                <button
                  onClick={handleRename}
                  className="rounded-lg bg-emerald-500 p-1.5 text-white hover:bg-emerald-600"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setName(doc.name);
                    setEditing(false);
                  }}
                  className="rounded-lg bg-ink-200 p-1.5 text-ink-600 hover:bg-ink-300"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h3 className="truncate text-base font-bold text-ink-900 group-hover:text-crimson-700 transition-colors">
                {doc.name}
              </h3>
            )}
            
            {/* Metadata row */}
            <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {timeAgo(doc.uploadedAt)}
              </span>
              <span className="h-1 w-1 rounded-full bg-ink-300" />
              <span className="font-semibold">{formatBytes(doc.size)}</span>
            </div>

            {/* Progress bar for ready documents */}
            {doc.status === 'ready' && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-semibold text-ink-600">Reading Progress</span>
                  <span className="flex items-center gap-1 font-bold text-crimson-600">
                    <TrendingUp size={10} />
                    {doc.id === useStore.getState().activeDocId ? '45' : '15'}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 overflow-hidden shadow-inset">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${doc.id === useStore.getState().activeDocId ? 45 : 15}%` 
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-crimson-500 to-crimson-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Context menu */}
          <div ref={menuRef} className="relative">
            <Tooltip label="More options" position="left">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="rounded-lg p-2 text-ink-400 opacity-0 transition-all hover:bg-ink-100 hover:text-ink-700 group-hover:opacity-100"
              >
                <MoreVertical size={18} />
              </button>
            </Tooltip>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 w-44 rounded-xl border-2 border-ink-200/60 bg-paper-50 py-2 shadow-paper"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      openDocument(doc.id);
                      navigate('/app/workspace');
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-crimson-50 hover:text-crimson-700"
                  >
                    <ExternalLink size={16} /> Open
                  </button>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Pencil size={16} /> Rename
                  </button>
                  <div className="my-1 h-px bg-ink-100" />
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${doc.name}"? This cannot be undone.`)) {
                        removeDocument(doc.id);
                        setMenuOpen(false);
                      }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Feature availability indicators */}
        {doc.status === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex items-center gap-2"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    f.available
                      ? 'border border-ink-200/60 bg-gradient-to-br from-paper-100 to-paper-50 text-ink-700 shadow-soft'
                      : 'border border-ink-100/60 bg-paper-100/30 text-ink-400'
                  }`}
                  title={f.label}
                >
                  <Icon size={12} className={f.available ? 'text-crimson-600' : ''} />
                  <span>{f.label}</span>
                </motion.span>
              );
            })}
          </motion.div>
        )}

        {/* Status badge row */}
        <div className="mt-4 flex items-center justify-between">
          {statusBadge()}
          {doc.status === 'ready' && (
            <span className="flex items-center gap-1.5 text-xs text-ink-500">
              <Clock size={12} />
              <span className="font-semibold">{doc.pages * 2} min read</span>
            </span>
          )}
        </div>

        {/* Processing progress bar */}
        {doc.status === 'processing' && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-800">Processing pipeline...</span>
              <span className="font-bold text-amber-700">{Math.round(doc.progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-amber-100 shadow-inset">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${doc.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-crimson-500/0 to-crimson-500/0 opacity-0 transition-opacity group-hover:from-crimson-500/5 group-hover:to-crimson-500/10 group-hover:opacity-100" />
    </motion.div>
  );
}
