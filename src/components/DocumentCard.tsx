import { motion } from 'framer-motion';
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
        <span className="chip bg-amber-50 text-amber-700">
          <span className="processing-dot" style={{ animationDelay: '0ms' }} />
          <span className="processing-dot" style={{ animationDelay: '200ms' }} />
          <span className="processing-dot" style={{ animationDelay: '400ms' }} />
          Processing {Math.round(doc.progress)}%
        </span>
      );
    if (doc.status === 'error') return <span className="chip bg-red-50 text-red-700">Error</span>;
    return <span className="chip bg-emerald-50 text-emerald-700">Ready</span>;
  };

  const features = [
    { icon: AlignLeft, available: !!doc.summary, label: 'Summary' },
    { icon: Layers, available: doc.flashcards.length > 0, label: `${doc.flashcards.length} cards` },
    { icon: ListChecks, available: doc.quiz.length > 0, label: `${doc.quiz.length} Q` },
    { icon: Share2, available: !!doc.graph, label: 'Graph' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="card group relative cursor-pointer p-4 transition-shadow hover:shadow-card"
      onClick={() => {
        if (doc.status !== 'ready') return;
        openDocument(doc.id);
        navigate('/app/workspace');
      }}
    >
      {/* Accent stripe at top */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl opacity-60"
        style={{ backgroundColor: doc.accent }}
      />
      <div className="flex items-start gap-3">
        {/* Mock PDF page cover thumbnail */}
        <div
          className="relative flex h-14 w-11 shrink-0 flex-col justify-between rounded border border-ink-200/60 bg-white p-1.5 shadow-soft group-hover:shadow-card transition-all"
        >
          {/* Header lines */}
          <div className="space-y-0.5">
            <div className="h-[2px] w-5/6 rounded bg-ink-200" />
            <div className="h-[2px] w-full rounded bg-ink-100" />
            <div className="h-[2px] w-2/3 rounded bg-ink-100" />
          </div>
          {/* Graphic marker block */}
          <div
            className="h-3 w-full rounded-sm opacity-20"
            style={{ backgroundColor: doc.accent }}
          />
          {/* Footer lines */}
          <div className="flex justify-between items-center text-[6px] text-ink-300">
            <span>PDF</span>
            <span>{doc.pages}p</span>
          </div>
          {/* Corner folded badge */}
          <div
            className="absolute top-0 right-0 h-1.5 w-1.5 rounded-bl-sm opacity-80"
            style={{ backgroundColor: doc.accent }}
          />
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
                if (e.key === 'Escape') {
                  setName(doc.name);
                  setEditing(false);
                }
              }}
              className="w-full rounded border border-crimson-300 px-1.5 py-0.5 text-sm font-semibold text-ink-800 focus:outline-none"
            />
          ) : (
            <h3 className="truncate text-sm font-semibold text-ink-800">{doc.name}</h3>
          )}
          <p className="mt-0.5 text-2xs text-ink-400">
            {formatBytes(doc.size)} · {timeAgo(doc.uploadedAt)}
          </p>

          {doc.status === 'ready' && (
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="h-1 flex-1 rounded-full bg-ink-100/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-crimson-600/70"
                  style={{ width: `${doc.id === useStore.getState().activeDocId ? 45 : 15}%` }}
                />
              </div>
              <span className="text-[9px] font-semibold text-ink-400">
                {doc.id === useStore.getState().activeDocId ? '45%' : '15%'} read
              </span>
            </div>
          )}
        </div>
        <div ref={menuRef} className="relative">
          <Tooltip label="More options" position="left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded p-1 text-ink-300 opacity-0 transition-opacity hover:bg-paper-200 hover:text-ink-600 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
          </Tooltip>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-ink-100 bg-paper-50 py-1 shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-ink-600 hover:bg-paper-200"
              >
                <Pencil size={13} /> Rename
              </button>
              <button
                onClick={() => {
                  removeDocument(doc.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature availability row */}
      {doc.status === 'ready' && (
        <div className="mt-3 flex items-center gap-1.5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <span
                key={i}
                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs ${
                  f.available
                    ? 'bg-paper-200/70 text-ink-500'
                    : 'bg-paper-200/30 text-ink-300'
                }`}
                title={f.label}
              >
                <Icon size={10} />
                {f.label}
              </span>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        {statusBadge()}
        <div className="flex items-center gap-3 text-2xs text-ink-400">
          {editing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              className="text-crimson-600"
            >
              <Check size={13} />
            </button>
          )}
        </div>
      </div>

      {doc.status === 'processing' && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-100">
          <motion.div
            className="h-full rounded-full bg-crimson-500"
            initial={{ width: 0 }}
            animate={{ width: `${doc.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
}
