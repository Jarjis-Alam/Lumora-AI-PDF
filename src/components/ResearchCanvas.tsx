import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  'You upload',
  'Lumora reads',
  'Lumora understands',
  'Lumora connects ideas',
  'Lumora teaches you',
  'You remember',
];

export default function ResearchCanvas() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let timers: number[] = [];
    if (playing) {
      const durations = [1000, 1100, 1400, 1600, 1200, 1000];
      let time = 0;
      durations.forEach((d, i) => {
        time += d;
        timers.push(window.setTimeout(() => setPhase(i + 1), time));
      });
      // loop back after full demo
      timers.push(window.setTimeout(() => {
        setPhase(0);
        setPlaying(false);
      }, time + 500));
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [playing]);

  const nodes = [
    { id: 'pdf', label: 'PDF', x: 20, y: 50 },
    { id: 'summary', label: 'Summary', x: 45, y: 30 },
    { id: 'graph', label: 'Graph', x: 70, y: 50 },
    { id: 'flash', label: 'Flashcards', x: 60, y: 75 },
    { id: 'notes', label: 'Notes', x: 35, y: 75 },
  ];

  const edges = [
    ['pdf', 'summary'],
    ['summary', 'graph'],
    ['graph', 'flash'],
    ['graph', 'notes'],
  ];

  return (
    <section id="research-canvas" className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wide2 text-crimson-600">Research Canvas</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-ink-800">A single surface where PDFs become connected knowledge.</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.5fr] lg:items-start">
          <div className="relative rounded-[1.2rem] border border-ink-200/60 bg-paper-50 p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-ink-700">Live demo</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setPlaying(true); setPhase(0); }}
                  className="rounded-full bg-crimson-600 px-3 py-1 text-sm font-semibold text-white"
                >
                  Play demo
                </button>
                <button
                  onClick={() => { setPlaying(false); setPhase(0); }}
                  className="rounded-full bg-paper-100 px-3 py-1 text-sm font-semibold text-ink-700 border"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="relative mt-2 h-[320px] md:h-[440px] w-full overflow-hidden rounded-lg bg-gradient-to-br from-paper-100 to-paper-50 p-6">
              {/* svg canvas */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                {/* edges */}
                {edges.map(([a, b], i) => {
                  const na = nodes.find((n) => n.id === a)!;
                  const nb = nodes.find((n) => n.id === b)!;
                  const showEdge = phase >= 3 || (a === 'pdf' && phase >= 1);
                  const x1 = na.x;
                  const y1 = na.y;
                  const x2 = nb.x;
                  const y2 = nb.y;
                  const length = Math.hypot(x2 - x1, y2 - y1);
                  const dash = showEdge ? 0 : length * 1.2;

                    return (
                      <motion.line
                        key={i}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#C9C6BF"
                        strokeWidth={0.8}
                        strokeDasharray={length}
                        strokeDashoffset={dash}
                        animate={{ strokeDashoffset: showEdge ? 0 : dash }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                      />
                    );
                })}

                {/* nodes */}
                {nodes.map((n) => {
                  const active = (
                    (n.id === 'pdf' && phase >= 1) ||
                    (n.id === 'summary' && phase >= 2) ||
                    (n.id === 'graph' && phase >= 3) ||
                    ((n.id === 'flash' || n.id === 'notes') && phase >= 4)
                  );

                  const colorMap: Record<string, { fill: string; stroke: string }> = {
                    pdf: { fill: '#F59E0B', stroke: '#F59E0B' }, // amber
                    summary: { fill: '#4A6FA5', stroke: '#4A6FA5' }, // indigo
                    graph: { fill: '#10B981', stroke: '#10B981' }, // emerald
                    flash: { fill: '#CD7F32', stroke: '#CD7F32' }, // copper
                    notes: { fill: '#CD7F32', stroke: '#CD7F32' },
                  };

                  const col = colorMap[n.id] || { fill: '#E6E2DA', stroke: '#C9C6BF' };

                  return (
                    <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                      <motion.circle
                        cx="0"
                        cy="0"
                        r={active ? 5 : 3.8}
                        fill={active ? col.fill : '#E6E2DA'}
                        stroke={active ? col.stroke : '#C9C6BF'}
                        strokeWidth={active ? 0.9 : 0.6}
                        animate={{ r: active ? 5.8 : 3.8, opacity: active ? 1 : 0.92 }}
                        transition={{ duration: 0.8 }}
                      />
                      <text x={8} y={2.5} fontSize={3.6} fill="#333" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{n.label}</text>
                    </g>
                  );
                })}
              </svg>

              {/* status / micro animations */}
              <div className="pointer-events-none absolute left-6 top-6 w-56">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="rounded-xl border border-ink-200/60 bg-paper-50 p-3 shadow-soft">
                  <div className="text-2xs font-semibold text-ink-500">Status</div>
                  <div className="mt-1 text-sm font-medium text-ink-800">{STEPS[Math.min(phase, STEPS.length - 1)]}</div>
                  <div className="mt-2 h-2 rounded-full bg-ink-100">
                    <motion.div animate={{ width: `${Math.min((phase / STEPS.length) * 100, 100)}%` }} className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" transition={{ duration: 0.9 }} />
                  </div>
                </motion.div>
              </div>

              <div className="pointer-events-none absolute right-6 bottom-6 w-52 text-right">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.98 }} transition={{ duration: 0.5 }} className="rounded-xl border border-ink-200/60 bg-paper-50 p-3 shadow-soft">
                  <div className="text-2xs font-semibold text-ink-500">Now</div>
                  <div className="mt-1 text-sm font-medium text-ink-800">{phase === 0 ? 'Waiting for upload' : STEPS[Math.min(phase - 1, STEPS.length - 1)]}</div>
                </motion.div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-[1.2rem] border border-ink-200/60 bg-paper-50 p-5 shadow-soft">
              <div className="mb-4 text-sm font-semibold text-ink-700">Research Canvas — signature feature</div>
              <p className="text-sm text-ink-600">This interactive demo shows the flow from upload to connected knowledge: summaries, graph expansion, flashcards, and notes. The demo is linear for clarity but reflects the live workspace behavior.</p>

              <div className="mt-4 space-y-3">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-3 rounded-lg p-2 ${i < phase ? 'bg-emerald-50 border border-emerald-200' : 'bg-paper-100 border border-ink-200/50'}`}>
                    <div className={`h-8 w-8 flex-shrink-0 rounded-md ${i < phase ? 'bg-emerald-500 text-white' : 'bg-ink-100 text-ink-500'} flex items-center justify-center font-semibold`}>{i + 1}</div>
                    <div>
                      <div className="text-sm font-medium text-ink-800">{s}</div>
                      <div className="text-2xs text-ink-500">{i === 0 ? 'Drop PDF' : i === 1 ? 'Parsing & OCR' : i === 2 ? 'Concept extraction' : i === 3 ? 'Graphs & links' : i === 4 ? 'Study tools' : 'Retention'}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => { setPlaying(true); setPhase(0); }} className="btn-primary">Play demo</button>
                <button onClick={() => { setPlaying(false); setPhase(0); }} className="btn-secondary">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
