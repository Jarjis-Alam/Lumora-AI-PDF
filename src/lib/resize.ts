import { useRef, useState, useCallback, useEffect } from 'react';

interface PanelSize {
  center: number; // percentage
  right: number;  // percentage
}

const STORAGE_KEY = 'lumora-panel-sizes-2';
const MIN = 20;

function loadSizes(): PanelSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.center && p.right) return p;
    }
  } catch { /* ignore */ }
  return { center: 70, right: 30 };
}

export function useResizablePanels() {
  const [sizes, setSizes] = useState<PanelSize>(loadSizes);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
  }, [sizes]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const center = Math.max(MIN, Math.min(x, 100 - MIN));
    setSizes({ center, right: 100 - center });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
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
