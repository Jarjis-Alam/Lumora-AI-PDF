import { useMemo, useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { ProcessingOverlay } from './Skeletons';
import { Share2, Search, X } from 'lucide-react';
import type { KnowledgeGraph as KG } from '../types';

const NODE_COLORS: Record<string, string> = {
  topic: '#C0392B',
  concept: '#4A6FA5',
  entity: '#6B8E6F',
};

export function KnowledgeGraphView({ docId, fullscreen = false }: { docId: string | null; fullscreen?: boolean }) {
  const documents = useStore((s) => s.documents);
  const generateGraph = useStore((s) => s.generateGraph);
  const setPdfHighlight = useStore((s) => s.setPdfHighlight);
  const setPdfPage = useStore((s) => s.setPdfPage);
  const setGraphNodeHighlight = useStore((s) => s.setGraphNodeHighlight);

  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');

  const doc = documents.find((d) => d.id === docId);
  const graph: KG | null = doc?.graph || null;

  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [] as Node[], edges: [] as Edge[] };
    const radius = 180;
    const nodes: Node[] = graph.nodes.map((n, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2;
      const isCenter = n.type === 'topic';
      return {
        id: n.id,
        data: { label: n.label, type: n.type, page: n.page, paragraph: n.paragraph },
        position: isCenter
          ? { x: 0, y: 0 }
          : { x: Math.cos(angle) * radius * (1 + (i % 2) * 0.4), y: Math.sin(angle) * radius * (1 + (i % 2) * 0.4) },
        style: {
          background: `${NODE_COLORS[n.type]}12`,
          border: `1.5px solid ${NODE_COLORS[n.type]}`,
          color: NODE_COLORS[n.type],
          borderRadius: '20px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
        },
      };
    });
    const edges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      style: { stroke: '#C9C6BF', strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fill: '#7A766C', fontFamily: 'Inter, sans-serif' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#C9C6BF', width: 14, height: 14 },
    }));
    return { nodes, edges };
  }, [graph]);

  const onNodeClick = useCallback(
    (_evt: any, node: Node) => {
      const data = node.data as any;
      setPdfPage(data.page);
      setPdfHighlight({ page: data.page, paragraph: data.paragraph });
      setGraphNodeHighlight(node.id);
    },
    [setPdfPage, setPdfHighlight, setGraphNodeHighlight]
  );

  if (!docId || !doc) {
    return (
      <EmptyState
        icon={Share2}
        title="No document selected"
        description="Select a document to explore its knowledge graph."
      />
    );
  }

  if (generating) {
    return <ProcessingOverlay label="Building knowledge graph..." />;
  }

  if (!graph) {
    return (
      <EmptyState
        icon={Share2}
        title="No graph generated"
        description="Extract concepts and relationships from your document into an interactive graph."
        action={{
          label: 'Build Knowledge Graph',
          onClick: () => {
            setGenerating(true);
            setTimeout(() => {
              generateGraph(doc.id);
              setGenerating(false);
            }, 1800);
          },
        }}
      />
    );
  }

  const filteredNodes = search
    ? nodes.filter((n) => (n.data as any).label.toLowerCase().includes(search.toLowerCase()))
    : nodes;

  return (
    <div className="relative h-full w-full bg-paper-200/30">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-paper-50 px-3 py-1.5 shadow-soft">
          <Search size={14} className="text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-32 bg-transparent text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-ink-300 hover:text-ink-500">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="absolute left-4 top-4 z-10 rounded-lg border border-ink-100 bg-paper-50/90 px-3 py-2 shadow-soft backdrop-blur-sm">
        <p className="mb-1.5 text-2xs font-medium text-ink-400">Legend</p>
        <div className="space-y-1">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-2xs text-ink-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#D8D4CB" />
        <Controls
          className="!border-ink-100 !bg-paper-50 !shadow-soft"
          showInteractive={false}
        />
        {fullscreen && <MiniMap className="!border-ink-100 !bg-paper-50" nodeColor={(n) => NODE_COLORS[(n.data as any).type] || '#C9C6BF'} />}
      </ReactFlow>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink-800/80 px-3 py-1.5 text-2xs text-paper-100 backdrop-blur-sm">
        Click a node to jump to its location in the document
      </div>
    </div>
  );
}
