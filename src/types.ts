export type DocStatus = 'processing' | 'ready' | 'error';

export interface Citation {
  page: number;
  paragraph: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt: number;
  streaming?: boolean;
}

export interface ChatThread {
  id: string;
  docId: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface SummarySection {
  heading: string;
  body: string;
}

export interface DocSummary {
  overall: string;
  readingTime: number;
  chapters: SummarySection[];
  keyTakeaways: string[];
  concepts: { term: string; definition: string }[];
  bulletSummary: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export type QuizType = 'mcq' | 'truefalse' | 'short';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'topic';
  page: number;
  paragraph: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Document {
  id: string;
  name: string;
  uploadedAt: number;
  lastOpenedAt: number | null;
  pages: number;
  status: DocStatus;
  progress: number;
  size: number;
  summary: DocSummary | null;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  graph: KnowledgeGraph | null;
  chat: ChatMessage[];
  bookmarks: number[];
  accent: string;
}
