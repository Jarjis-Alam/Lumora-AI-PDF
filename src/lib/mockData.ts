import type {
  Document,
  DocSummary,
  Flashcard,
  QuizQuestion,
  KnowledgeGraph,
  ChatMessage,
  Citation,
} from '../types';

const ACCENTS = ['#C0392B', '#4A6FA5', '#6B8E6F', '#B8893A', '#7A5C8F', '#2C7A7B'];

const SAMPLE_TITLES = [
  'Attention Is All You Need',
  'The Pragmatic Programmer — Chapter 4',
  'Thinking, Fast and Slow',
  'Deep Learning — Goodfellow et al.',
  'Designing Data-Intensive Applications',
  'The Mythical Man-Month',
  'Clean Code — A Handbook of Agile Craft',
  'Structure and Interpretation of Computer Programs',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function uid(prefix: string, i: number): string {
  return `${prefix}-${i}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeSummary(name: string, pages: number): DocSummary {
  return {
    overall: `${name} presents a comprehensive treatment of its subject matter across ${pages} pages. The document establishes core theoretical foundations before progressing to applied techniques, balancing rigor with accessibility. Central themes include the relationship between structure and behavior, the role of abstraction in managing complexity, and the practical trade-offs that govern real-world decisions.`,
    readingTime: Math.max(5, Math.round(pages * 2.5)),
    chapters: [
      {
        heading: 'Chapter 1 — Foundations',
        body: 'Introduces the fundamental vocabulary and motivating problems. Establishes notation and reviews prior work, situating the contribution within a broader intellectual tradition. Key examples illustrate why the problem matters and what a satisfactory solution would require.',
      },
      {
        heading: 'Chapter 2 — Core Method',
        body: 'Develops the central technique step by step. Each building block is motivated before it is introduced, and the chapter culminates in a worked example that ties the pieces together. The treatment emphasizes intuition alongside formal correctness.',
      },
      {
        heading: 'Chapter 3 — Applications & Results',
        body: 'Applies the method to several representative settings and reports empirical results. Discusses where the approach excels, where it struggles, and the boundary conditions that practitioners should respect.',
      },
      {
        heading: 'Chapter 4 — Discussion',
        body: 'Reflects on limitations, open questions, and directions for future work. Connects the contribution back to the broader literature and identifies the most promising avenues for extension.',
      },
    ],
    keyTakeaways: [
      'The central insight is that structure and behavior are co-determined — changing one inevitably changes the other.',
      'Abstraction is the primary tool for managing complexity, but every abstraction leaks and the leaks must be named.',
      'Empirical results are most meaningful when compared against a strong, well-understood baseline.',
      'The method trades a small amount of generality for substantial gains in clarity and reproducibility.',
      'Open questions remain at the boundary of theory and practice; the most interesting work lies there.',
    ],
    concepts: [
      { term: 'Attention Mechanism', definition: 'A technique that lets a model focus on the most relevant parts of its input when producing each element of its output.' },
      { term: 'Embedding', definition: 'A learned mapping from discrete tokens into a continuous vector space where semantic similarity correlates with geometric proximity.' },
      { term: 'Transformer', definition: 'A neural architecture built entirely on attention, dispensing with recurrence and convolution while enabling parallel training.' },
      { term: 'Self-Attention', definition: 'Attention applied within a single sequence, allowing each position to attend to all others and capture long-range dependencies.' },
      { term: 'Positional Encoding', definition: 'A signal injected into the input to give the model information about the order of tokens, since attention itself is permutation-invariant.' },
    ],
    bulletSummary: [
      'The document argues for a paradigm shift away from sequential processing toward parallel attention-based computation.',
      'It introduces a novel architecture that achieves state-of-the-art results while being faster to train.',
      'Empirical evaluation spans translation, parsing, and language modeling tasks.',
      'The authors identify model scaling and data quality as the primary levers for further improvement.',
      'Limitations include computational cost at long sequence lengths and limited interpretability of attention weights.',
    ],
  };
}

export function makeFlashcards(seed: number): Flashcard[] {
  const base = [
    { front: 'What is the main advantage of attention over recurrence?', back: 'Attention allows parallel computation across the entire sequence, whereas recurrence forces sequential processing and cannot exploit modern hardware fully.' },
    { front: 'Define "self-attention" in one sentence.', back: 'Self-attention is an attention mechanism relating different positions of a single sequence to compute a representation of that sequence.' },
    { front: 'Why are positional encodings necessary in a Transformer?', back: 'Because attention is permutation-invariant, the model has no inherent notion of order; positional encodings inject order information.' },
    { front: 'What is multi-head attention?', back: 'Running several attention operations in parallel with different learned projections, then concatenating, lets the model attend to information from different representation subspaces.' },
    { front: 'Name the two main components of the Transformer encoder block.', back: 'A multi-head self-attention sub-layer and a position-wise feed-forward network, each followed by residual connection and layer normalization.' },
    { front: 'What trade-off does the document identify at long sequence lengths?', back: 'Attention cost grows quadratically with sequence length, which limits applicability to very long inputs despite the parallelism gains.' },
    { front: 'How does the document define "abstraction leakage"?', back: 'Every abstraction hides details that occasionally surface; a leak is when those hidden details affect observable behavior in ways the abstraction did not promise to handle.' },
    { front: 'What is the role of the feed-forward network in each block?', back: 'It applies a non-linear transformation independently to each position, increasing the model’s expressive capacity beyond linear attention.' },
  ];
  return base.slice(0, 5 + (seed % 4)).map((c, i) => ({ id: uid('fc', i), ...c }));
}

export function makeQuiz(_seed: number): QuizQuestion[] {
  return [
    {
      id: uid('q', 0),
      type: 'mcq',
      question: 'Which property of attention makes it suitable for parallel training?',
      options: ['It is sequential by nature', 'It is permutation-invariant and has no recurrence', 'It requires labeled data', 'It only works on images'],
      answer: 'It is permutation-invariant and has no recurrence',
      explanation: 'Because attention relates all positions simultaneously without a recurrent state, the computation can be parallelized across positions.',
      difficulty: 'medium',
    },
    {
      id: uid('q', 1),
      type: 'truefalse',
      question: 'Positional encodings are required because attention itself has no notion of sequence order.',
      answer: 'True',
      explanation: 'Attention is permutation-invariant, so without positional information the model could not distinguish order.',
      difficulty: 'easy',
    },
    {
      id: uid('q', 2),
      type: 'short',
      question: 'In one sentence, what does multi-head attention enable?',
      answer: 'attending to different representation subspaces in parallel',
      explanation: 'Multiple heads let the model jointly attend to information from different subspaces at different positions.',
      difficulty: 'medium',
    },
    {
      id: uid('q', 3),
      type: 'mcq',
      question: 'What is the asymptotic cost of attention with respect to sequence length n?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      answer: 'O(n²)',
      explanation: 'Every position attends to every other position, yielding quadratic cost in sequence length.',
      difficulty: 'hard',
    },
    {
      id: uid('q', 4),
      type: 'truefalse',
      question: 'The feed-forward network in a Transformer block is shared across positions.',
      answer: 'False',
      explanation: 'The same parameters are applied to each position independently, but it is a position-wise operation, not a shared state.',
      difficulty: 'medium',
    },
  ];
}

export function makeGraph(_seed: number): KnowledgeGraph {
  const nodes = [
    { id: 'n1', label: 'Transformer', type: 'topic' as const, page: 1, paragraph: 0 },
    { id: 'n2', label: 'Attention', type: 'concept' as const, page: 2, paragraph: 1 },
    { id: 'n3', label: 'Self-Attention', type: 'concept' as const, page: 3, paragraph: 0 },
    { id: 'n4', label: 'Multi-Head', type: 'concept' as const, page: 4, paragraph: 2 },
    { id: 'n5', label: 'Positional Encoding', type: 'concept' as const, page: 5, paragraph: 0 },
    { id: 'n6', label: 'Feed-Forward Net', type: 'concept' as const, page: 6, paragraph: 1 },
    { id: 'n7', label: 'Encoder', type: 'entity' as const, page: 7, paragraph: 0 },
    { id: 'n8', label: 'Decoder', type: 'entity' as const, page: 8, paragraph: 0 },
    { id: 'n9', label: 'Embedding', type: 'concept' as const, page: 2, paragraph: 0 },
    { id: 'n10', label: 'Layer Norm', type: 'concept' as const, page: 6, paragraph: 2 },
  ];
  const edges = [
    { id: 'e1', source: 'n1', target: 'n2', label: 'uses' },
    { id: 'e2', source: 'n2', target: 'n3', label: 'specializes' },
    { id: 'e3', source: 'n2', target: 'n4', label: 'extends' },
    { id: 'e4', source: 'n1', target: 'n5', label: 'requires' },
    { id: 'e5', source: 'n1', target: 'n6', label: 'contains' },
    { id: 'e6', source: 'n1', target: 'n7', label: 'has' },
    { id: 'e7', source: 'n1', target: 'n8', label: 'has' },
    { id: 'e8', source: 'n2', target: 'n9', label: 'operates on' },
    { id: 'e9', source: 'n6', target: 'n10', label: 'followed by' },
    { id: 'e10', source: 'n7', target: 'n3', label: 'applies' },
  ];
  return { nodes, edges };
}

export function makeChat(docName: string): ChatMessage[] {
  const citations: Citation[] = [
    { page: 2, paragraph: 1, text: 'The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers.' },
    { page: 3, paragraph: 0, text: 'Attention functions can be described as mapping a query and a set of key-value pairs to an output.' },
  ];
  return [
    {
      id: uid('m', 0),
      role: 'user',
      content: 'What is the main idea of this document?',
      createdAt: Date.now() - 60000,
    },
    {
      id: uid('m', 1),
      role: 'assistant',
      content: `The central idea of **${docName}** is that sequence modeling can be done with **attention alone**, without recurrence or convolution. The authors introduce the Transformer, an architecture built entirely on self-attention, which trains faster and reaches state-of-the-art results on translation tasks.\n\nKey points:\n- Self-attention relates all positions in a sequence simultaneously\n- Multi-head attention lets the model attend to different subspaces\n- Positional encodings inject order information\n- The architecture is highly parallelizable, unlike RNNs`,
      citations,
      createdAt: Date.now() - 59000,
    },
  ];
}

export function makeDocument(i: number, overrides?: Partial<Document>): Document {
  const name = pick(SAMPLE_TITLES, i);
  const pages = 8 + ((i * 7) % 22);
  const uploadedAt = Date.now() - i * 1000 * 60 * 60 * (i + 3);
  const status: Document['status'] = i < 2 ? 'ready' : i === 2 ? 'processing' : 'ready';
  return {
    id: uid('doc', i),
    name,
    uploadedAt,
    lastOpenedAt: i < 3 ? Date.now() - i * 1000 * 60 * 30 : null,
    pages,
    status,
    progress: status === 'processing' ? 35 + i * 10 : 100,
    size: 1.2 + (i % 9) * 0.7,
    summary: status === 'ready' ? makeSummary(name, pages) : null,
    flashcards: status === 'ready' ? makeFlashcards(i) : [],
    quiz: status === 'ready' ? makeQuiz(i) : [],
    graph: status === 'ready' ? makeGraph(i) : null,
    chat: status === 'ready' ? makeChat(name) : [],
    bookmarks: i === 0 ? [2, 5] : [],
    accent: pick(ACCENTS, i),
    ...overrides,
  };
}

export function seedDocuments(): Document[] {
  return [0, 1, 2, 3, 4].map((i) => makeDocument(i));
}
