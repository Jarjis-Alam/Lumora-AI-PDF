import { useMemo, useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { SkeletonGraph } from './Skeletons';
import { Share2, Search, X, ZoomIn, ZoomOut, Maximize2, Filter, Eye, EyeOff, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KnowledgeGraph as KG } from '../types';

const NODE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  topic: { 
    bg: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)', 
    border: '#C0392B',
    glow: 'rgba(192, 57, 43, 0.3)'
  },
  concept: { 
    bg: 'linear-gradient(135deg, #2C3E50 0%, #4A6FA5 100%)', 
    border: '#4A6FA5',
    glow: 'rgba(74, 111, 165, 0.3)'
  },
  entity: { 
    bg: 'linear-gradient(135deg, #27AE60 0%, #6B8E6F 100%)', 
    border: '#6B8E6F',
    glow: 'rgba(107, 142, 111, 0.3)'
  },
};

export function KnowledgeGraphView({ docId, fullscreen = false }: { docId: string | null; fullscreen?: boolean }) {
  const documents = useStore((s) => s.documents);
  const generateGraph = useStore((s) => s.generateGraph);
  const setPdfHighlight = useStore((s) => s.setPdfHighlight);
  const setPdfPage = useStore((s) => s.setPdfPage);
  const graphNodeHighlight = useStore((s) => s.graphNodeHighlight);
  const setGraphNodeHighlight = useStore((s) => s.setGraphNodeHighlight);

  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleTypes, setVisibleTypes] = useState<string[]>(['topic', 'concept', 'entity']);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const doc = documents.find((d) => d.id === docId);
  const graph: KG | null = doc?.graph || null;

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!graph) return { initialNodes: [] as Node[], initialEdges: [] as Edge[] };
    
    const radius = 250;
    const initialNodes: Node[] = graph.nodes.map((n, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2;
      const isCenter = n.type === 'topic';
      const colorConfig = NODE_COLORS[n.type];
      
      return {
        id: n.id,
        data: { label: n.label, type: n.type, page: n.page, paragraph: n.paragraph },
        position: isCenter
          ? { x: 0, y: 0 }
          : { 
              x: Math.cos(angle) * radius * (1 + (i % 3) * 0.3), 
              y: Math.sin(angle) * radius * (1 + (i % 3) * 0.3) 
            },
        style: {
          background: colorConfig.bg,
          border: `2px solid ${colorConfig.border}`,
          color: '#FFFFFF',
          borderRadius: isCenter ? '24px' : '16px',
          padding: isCenter ? '12px 24px' : '8px 16px',
          fontSize: isCenter ? '14px' : '12px',
          fontWeight: isCenter ? 600 : 500,
          fontFamily: 'Inter, sans-serif',
          boxShadow: `0 4px 12px ${colorConfig.glow}, 0 0 0 0 ${colorConfig.glow}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        },
        draggable: true,
      };
    });
    
    const initialEdges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#C9C6BF', 
        strokeWidth: 2,
      },
      labelStyle: { 
        fontSize: 11, 
        fill: '#7A766C', 
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        background: '#F8F6F3',
        padding: '4px 8px',
        borderRadius: '6px',
      },
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: '#C9C6BF', 
        width: 18, 
        height: 18 
      },
    }));
    
    return { initialNodes, initialEdges };
  }, [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when graph changes
  useMemo(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_evt: any, node: Node) => {
      const data = node.data as any;
      setPdfPage(data.page);
      setPdfHighlight({ page: data.page, paragraph: data.paragraph });
      setGraphNodeHighlight(node.id);
    },
    [setPdfPage, setPdfHighlight, setGraphNodeHighlight]
  );

  const onNodeMouseEnter = useCallback((_evt: any, node: Node) => {
    setHoveredNode(node.id);
    
    // Highlight connected edges
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          return {
            ...edge,
            animated: true,
            style: { ...edge.style, stroke: '#E74C3C', strokeWidth: 3 },
          };
        }
        return edge;
      })
    );

    // Dim unconnected nodes
    setNodes((nds) =>
      nds.map((n) => {
        const isConnected = edges.some(
          (e) => 
            (e.source === node.id && e.target === n.id) ||
            (e.target === node.id && e.source === n.id)
        );
        
        if (n.id === node.id) {
          const colorConfig = NODE_COLORS[(n.data as any).type];
          return {
            ...n,
            style: {
              ...n.style,
              transform: 'scale(1.1)',
              boxShadow: `0 8px 24px ${colorConfig.glow}, 0 0 32px ${colorConfig.glow}`,
              zIndex: 1000,
            },
          };
        }
        
        if (!isConnected) {
          return {
            ...n,
            style: { ...n.style, opacity: 0.3 },
          };
        }
        
        return n;
      })
    );
  }, [setEdges, setNodes, edges]);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    
    // Reset edges
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: false,
        style: { stroke: '#C9C6BF', strokeWidth: 2 },
      }))
    );

    // Reset nodes
    setNodes((nds) =>
      nds.map((n) => {
        const colorConfig = NODE_COLORS[(n.data as any).type];
        return {
          ...n,
          style: {
            ...n.style,
            opacity: 1,
            transform: 'scale(1)',
            boxShadow: `0 4px 12px ${colorConfig.glow}, 0 0 0 0 ${colorConfig.glow}`,
            zIndex: 1,
          },
        };
      })
    );
  }, [setEdges, setNodes]);

  if (!docId || !doc) {
    return (
      <EmptyState
        icon={Share2}
        title="No document selected"
        description="Select a document from the sidebar to explore its knowledge graph."
        tips={[
          'The graph visualizes relationships between concepts',
          'Hover over nodes to see their connections',
          'Click nodes to jump to their location in the document'
        ]}
        accent="#8B5CF6"
      />
    );
  }

  if (generating) {
    return <SkeletonGraph />;
  }

  if (!graph) {
    return (
      <EmptyState
        icon={Share2}
        title="No graph generated"
        description="Extract concepts and relationships from your document into an interactive graph."
        action={{
          label: 'Build Knowledge Graph',
          onClick: async () => {
            setGenerating(true);
            try {
              await generateGraph(doc.id);
            } finally {
              setGenerating(false);
            }
          },
        }}
        tips={[
          'Nodes represent topics, concepts, and entities',
          'Drag nodes to rearrange the layout',
          'Use filters to focus on specific node types'
        ]}
        accent="#8B5CF6"
      />
    );
  }

  const toggleType = useCallback((type: string) => {
    setVisibleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const filteredNodes = useMemo(() => {
    let result = nodes.filter((n) => visibleTypes.includes((n.data as any).type));
    if (search) {
      result = result.filter((n) => (n.data as any).label.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [nodes, search, visibleTypes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(
      (e) =>
        filteredNodes.some((n) => n.id === e.source) &&
        filteredNodes.some((n) => n.id === e.target)
    );
  }, [edges, filteredNodes]);

  const highlightedNode = graph?.nodes.find((n) => n.id === graphNodeHighlight);
  const matchingConcept = doc?.summary?.concepts.find(
    (c) => c.term.toLowerCase() === highlightedNode?.label.toLowerCase()
  );

  const nodeCount = { topic: 0, concept: 0, entity: 0 };
  graph?.nodes.forEach((n) => {
    nodeCount[n.type as keyof typeof nodeCount]++;
  });

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-paper-50 to-paper-200">
      {/* Enhanced Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-6 top-6 z-10 flex items-center gap-3"
      >
        <div className="flex items-center gap-2 rounded-xl border-2 border-ink-200/60 bg-paper-50/95 px-4 py-2.5 shadow-paper backdrop-blur-lg">
          <Search size={16} className="text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-40 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setSearch('')}
                className="rounded-full p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-xl border-2 p-2.5 shadow-soft transition-all ${
            showFilters
              ? 'border-crimson-400 bg-crimson-50 text-crimson-600'
              : 'border-ink-200/60 bg-paper-50/95 text-ink-600 hover:border-ink-300'
          }`}
        >
          <Filter size={16} />
        </button>
      </motion.div>

      {/* Enhanced Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.95 }}
            className="absolute left-6 top-6 z-10 w-56 rounded-xl border-2 border-ink-200/60 bg-paper-50/95 p-4 shadow-paper backdrop-blur-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-bold text-ink-700">
                <Sparkles size={14} className="text-crimson-600" />
                Node Types
              </h4>
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(NODE_COLORS).map(([type, colorConfig]) => {
                const isVisible = visibleTypes.includes(type);
                const count = nodeCount[type as keyof typeof nodeCount];
                
                return (
                  <motion.button
                    key={type}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleType(type)}
                    className={`flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 text-left transition-all ${
                      isVisible
                        ? 'border-ink-200 bg-paper-100 shadow-soft'
                        : 'border-ink-100 bg-transparent opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-3 w-3 rounded-full shadow-soft"
                        style={{ background: colorConfig.bg }}
                      />
                      <span className="text-xs font-semibold capitalize text-ink-800">
                        {type}s
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-500">{count}</span>
                      {isVisible ? (
                        <Eye size={14} className="text-crimson-600" />
                      ) : (
                        <EyeOff size={14} className="text-ink-400" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg border border-ink-200/60 bg-gradient-to-br from-paper-100 to-paper-50 p-2.5">
              <p className="text-2xs text-ink-600 leading-relaxed">
                <span className="font-bold">Tip:</span> Hover over nodes to see connections. Click to jump to the source.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ReactFlow Canvas */}
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        minZoom={0.2}
        maxZoom={2}
        connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#D8D4CB" 
          className="opacity-60"
        />
        <Controls
          className="!rounded-xl !border-2 !border-ink-200/60 !bg-paper-50/95 !shadow-paper !backdrop-blur-lg"
          showInteractive={false}
        />
        {fullscreen && (
          <MiniMap
            className="!rounded-xl !border-2 !border-ink-200/60 !bg-paper-50/95 !shadow-paper"
            nodeColor={(n) => {
              const type = (n.data as any).type;
              return NODE_COLORS[type]?.border || '#C9C6BF';
            }}
            maskColor="rgba(248, 246, 243, 0.8)"
          />
        )}
      </ReactFlow>

      {/* Enhanced Node Detail Panel */}
      <AnimatePresence>
        {highlightedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-6 right-6 z-10 w-80 rounded-2xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-5 shadow-paper-lg backdrop-blur-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shadow-soft"
                    style={{ background: NODE_COLORS[highlightedNode.type].bg }}
                  />
                  <span
                    className="chip text-2xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${NODE_COLORS[highlightedNode.type].border}15`,
                      color: NODE_COLORS[highlightedNode.type].border,
                    }}
                  >
                    {highlightedNode.type}
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-ink-900 leading-tight">
                  {highlightedNode.label}
                </h4>
              </div>
              <button
                onClick={() => setGraphNodeHighlight(null)}
                className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-ink-700">
                {matchingConcept?.definition || 
                  `Concept mentioned in ${doc?.name} on page ${highlightedNode.page}.`}
              </p>

              <div className="flex items-center gap-2 rounded-lg border border-ink-200/60 bg-paper-100 px-3 py-2">
                <div className="flex-1 text-xs font-semibold text-ink-600">
                  Page {highlightedNode.page} · Paragraph {highlightedNode.paragraph + 1}
                </div>
                <button
                  onClick={() => {
                    setPdfPage(highlightedNode.page);
                    setPdfHighlight({ page: highlightedNode.page, paragraph: highlightedNode.paragraph });
                  }}
                  className="btn-primary btn-xs gap-1.5"
                >
                  Jump to Source
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* Connected nodes preview */}
              {graph && (
                <div className="rounded-lg border border-ink-200/60 bg-gradient-to-br from-paper-100 to-paper-50 p-3">
                  <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-ink-500">
                    Connected To
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {graph.edges
                      .filter((e) => e.source === highlightedNode.id || e.target === highlightedNode.id)
                      .slice(0, 6)
                      .map((e) => {
                        const targetNode = graph.nodes.find(
                          (n) => n.id === (e.source === highlightedNode.id ? e.target : e.source)
                        );
                        if (!targetNode) return null;
                        return (
                          <span
                            key={e.id}
                            className="chip text-2xs"
                            style={{
                              backgroundColor: `${NODE_COLORS[targetNode.type].border}15`,
                              color: NODE_COLORS[targetNode.type].border,
                            }}
                          >
                            {targetNode.label}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Tooltip */}
      {!highlightedNode && !hoveredNode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-ink-700/20 bg-ink-800/90 px-4 py-2 text-xs text-paper-50 backdrop-blur-sm shadow-float"
        >
          💡 Hover over nodes to see connections · Click to view details
        </motion.div>
      )}
    </div>
  );
}
