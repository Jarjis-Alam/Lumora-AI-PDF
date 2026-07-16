import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Filter,
  FileSearch,
  Layers,
  ListChecks,
  AlignLeft,
} from 'lucide-react';
import { useStore } from '../store';
import { EmptyState } from '../components/EmptyState';

interface SearchResult {
  docId: string;
  docName: string;
  page: number;
  paragraph: number;
  text: string;
  score: number;
  accent: string;
}

const SAMPLE_TEXTS: { text: string; page: number; paragraph: number }[] = [
  { text: 'The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.', page: 2, paragraph: 1 },
  { text: 'Attention functions can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors.', page: 3, paragraph: 0 },
  { text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.', page: 4, paragraph: 2 },
  { text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.', page: 1, paragraph: 2 },
  { text: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.', page: 1, paragraph: 3 },
  { text: 'In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64.', page: 5, paragraph: 1 },
  { text: 'The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S.', page: 3, paragraph: 1 },
  { text: 'On the WMT 2014 English-to-German translation task, the big transformer model outperforms the best previously reported models by more than 2.0 BLEU.', page: 8, paragraph: 0 },
];

const FILTERS = [
  { id: 'all', label: 'All Documents', icon: FileSearch },
  { id: 'current', label: 'Current Document', icon: FileText },
  { id: 'summaries', label: 'Summaries', icon: AlignLeft },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz Content', icon: ListChecks },
] as const;

const RECENT_SEARCHES = [
  'How does attention work?',
  'What is multi-head attention?',
  'Positional encoding',
  'Transformer architecture',
];

const TRENDING_SEARCHES = [
  'Gradient descent',
  'Backpropagation',
  'Loss function',
  'Encoder-decoder',
  'Self-attention mechanism',
  'Layer normalization',
];

import { useEffect } from 'react';

export function SearchPage() {
  const documents = useStore((s) => s.documents);
  const activeDocId = useStore((s) => s.activeDocId);
  const setPdfPage = useStore((s) => s.setPdfPage);
  const setPdfHighlight = useStore((s) => s.setPdfHighlight);
  const openDocument = useStore((s) => s.openDocument);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const doc = documents.find((d) => d.id === activeDocId);

  useEffect(() => {
    if (doc) {
      setWorkspaceTab('search');
      navigate('/app/workspace', { replace: true });
    }
  }, [doc, navigate, setWorkspaceTab]);

  if (doc) return null;

  const readyDocs = useMemo(() => documents.filter((d) => d.status === 'ready'), [documents]);

  const search = async () => {
    if (!query.trim() || readyDocs.length === 0) return;
    setSearching(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 900));

    const qLower = query.toLowerCase();
    const qWords = qLower.split(/\s+/).filter((w) => w.length > 2);
    const scored: SearchResult[] = [];
    const docsToSearch = filter === 'current' && activeDocId
      ? readyDocs.filter((d) => d.id === activeDocId)
      : readyDocs;

    docsToSearch.forEach((doc) => {
      SAMPLE_TEXTS.forEach((t) => {
        const textLower = t.text.toLowerCase();
        const overlap = qWords.filter((w) => textLower.includes(w)).length;
        const score = Math.min(0.98, 0.55 + (overlap / Math.max(qWords.length, 1)) * 0.4 + Math.random() * 0.1);
        if (overlap > 0 || score > 0.7) {
          scored.push({
            docId: doc.id,
            docName: doc.name,
            page: t.page,
            paragraph: t.paragraph,
            text: t.text,
            score,
            accent: doc.accent,
          });
        }
      });
    });
    scored.sort((a, b) => b.score - a.score);
    setResults(scored.slice(0, 8));
    setSearching(false);
  };

  const openResult = (r: SearchResult) => {
    openDocument(r.docId);
    setPdfPage(r.page);
    setPdfHighlight({ page: r.page, paragraph: r.paragraph });
    navigate('/app/workspace');
  };

  if (readyDocs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={Search}
          title="No documents to search"
          description="Upload a document first, then search across all your documents by meaning."
          tips={[
            'Semantic search finds answers based on meaning, not just keywords',
            'Search across multiple documents simultaneously',
            'Results show exact page and paragraph references'
          ]}
          prompts={[
            'What are the main findings?',
            'How does X relate to Y?',
            'Explain the methodology'
          ]}
          accent="#C0392B"
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto paper-texture">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
            <Search size={26} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink-800">Semantic Search</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Search across {readyDocs.length} document{readyDocs.length > 1 ? 's' : ''} by meaning, not keywords.
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2 rounded-xl2 border border-ink-200 bg-paper-50 p-2 shadow-soft transition-colors focus-within:border-crimson-300">
            <Search size={18} className="ml-2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search by meaning... e.g. How does attention work?"
              className="flex-1 bg-transparent px-2 py-2 text-base text-ink-700 placeholder:text-ink-300 focus:outline-none"
              autoFocus
            />
            <button
              onClick={search}
              disabled={!query.trim() || searching}
              className="btn-primary"
            >
              {searching ? (
                <span className="flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-paper-50 animate-pulse-soft" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-paper-50 animate-pulse-soft" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-paper-50 animate-pulse-soft" style={{ animationDelay: '300ms' }} />
                </span>
              ) : <Sparkles size={15} />}
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
            <Filter size={11} /> Filters
          </span>
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.id;
            const disabled = f.id === 'current' && !activeDocId;
            return (
              <button
                key={f.id}
                disabled={disabled}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                  active
                    ? 'border-crimson-300 bg-crimson-50 text-crimson-700'
                    : 'border-ink-200 bg-paper-50 text-ink-500 hover:border-ink-300'
                }`}
              >
                <Icon size={12} />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {searching && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card p-4">
                <div className="skeleton mb-2 h-4 w-1/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton mt-1 h-3 w-5/6" />
              </div>
            ))}
          </div>
        )}

        {results && results.length === 0 && !searching && (
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try rephrasing your query or using different terms."
            tips={[
              'Use natural language instead of keywords',
              'Ask questions like you would to a person',
              'Try broader or more specific queries'
            ]}
            prompts={[
              'Summarize the key points',
              'What are the limitations?',
              'How does this compare to X?'
            ]}
            accent="#C0392B"
          />
        )}

        {results && results.length > 0 && (
          <div>
            <p className="mb-3 text-2xs text-ink-400">{results.length} results · sorted by similarity</p>
            <div className="space-y-3">
              {results.map((r, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openResult(r)}
                  className="card group block w-full p-4 text-left transition-shadow hover:shadow-card"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-1 w-6 rounded-full" style={{ backgroundColor: r.accent }} />
                    <FileText size={13} className="text-ink-400" />
                    <span className="text-xs font-medium text-ink-600">{r.docName}</span>
                    <span className="text-2xs text-ink-300">· p.{r.page}¶{r.paragraph + 1}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                          <div
                            className="h-full rounded-full bg-crimson-500"
                            style={{ width: `${r.score * 100}%` }}
                          />
                        </div>
                        <span className="text-2xs font-medium text-crimson-600">{(r.score * 100).toFixed(0)}%</span>
                      </div>
                      <ArrowRight size={14} className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500" />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-600">{r.text}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Recent + Trending when no results */}
        {!results && !searching && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                <Clock size={11} /> Recent Searches
              </p>
              <div className="space-y-1.5">
                {RECENT_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-500 transition-colors hover:bg-paper-200/50 hover:text-ink-700"
                  >
                    <Clock size={13} className="text-ink-300" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                <TrendingUp size={11} /> Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                    }}
                    className="chip border border-ink-200 bg-paper-50 text-ink-500 hover:border-crimson-200 hover:text-crimson-600"
                  >
                    <TrendingUp size={10} className="text-crimson-400" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
