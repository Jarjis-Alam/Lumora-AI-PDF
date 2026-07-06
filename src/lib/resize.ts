import { useRef, useState, useCallback, useEffect } from 'react';

interface PanelSize {
  left: number;   // percentage
  center: number; // percentage
  right: number;  // percentage
}

const STORAGE_KEY = 'lumora-panel-sizes';
const MIN = 15;

function loadSizes(): PanelSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.left && p.center && p.right) return p;
    }
  } catch { /* ignore */ }
  return { left: 18, center: 52, right: 30 };
}

export function useResizablePanels() {
  const [sizes, setSizes] = useState<PanelSize>(loadSizes);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'left' | 'right' | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
  }, [sizes]);

  const onPointerDown = useCallback((which: 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = which;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;

    if (dragging.current === 'left') {
      const left = Math.max(MIN, Math.min(x, 100 - MIN - sizes.right));
      setSizes((s) => ({ ...s, left, center: 100 - left - s.right }));
    } else {
      const right = Math.max(MIN, Math.min(100 - x, 100 - sizes.left - MIN));
      setSizes((s) => ({ ...s, right, center: 100 - s.left - right }));
    }
  }, [sizes]);

  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  return { sizes, containerRef, onPointerDown, onPointerMove, onPointerUp };
}

interface RowSize {
  top: number;    // percentage
  bottom: number; // percentage
}

const ROW_KEY = 'lumora-row-sizes';
const ROW_MIN = 20;

function loadRowSizes(): RowSize {
  try {
    const raw = localStorage.getItem(ROW_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.top && p.bottom) return p;
    }
  } catch { /* ignore */ }
  return { top: 62, bottom: 38 };
}

export function useResizableRows() {
  const [sizes, setSizes] = useState<RowSize>(loadRowSizes);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    localStorage.setItem(ROW_KEY, JSON.stringify(sizes));
  }, [sizes]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const top = Math.max(ROW_MIN, Math.min(y, 100 - ROW_MIN));
    setSizes({ top, bottom: 100 - top });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return { sizes, containerRef, onPointerDown, onPointerMove, onPointerUp };
}
