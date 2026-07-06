import type { Citation } from '../types';
import { uid } from './utils';

const RESPONSES: Record<string, string> = {
  summarize:
    'Here is a concise summary of the document:\n\nThe paper introduces the **Transformer**, a neural architecture that relies entirely on **self-attention** to model sequences, dispensing with recurrence and convolution. This enables significantly more parallelization during training.\n\n| Component | Role |\n|---|---|\n| Self-Attention | Relates all positions in the sequence |\n| Multi-Head | Attends to different representation subspaces |\n| Positional Encoding | Injects order information |\n| Feed-Forward | Non-linear per-position transformation |\n\nThe model achieves state-of-the-art results on English-to-German and English-to-French translation while training in a fraction of the time required by prior approaches.',
  explain:
    'The key section explains how **attention** works:\n\n1. Each position computes three vectors: a **query**, a **key**, and a **value**.\n2. The query is matched against all keys via dot product to produce attention scores.\n3. Scores are scaled and normalized with softmax to get weights.\n4. The output is a weighted sum of the values.\n\n```python\nscores = queries @ keys.T / sqrt(d_k)\nweights = softmax(scores)\noutput = weights @ values\n```\n\nThis lets every position gather information from every other position in parallel.',
  ideas:
    'The key ideas of this document are:\n\n- **Attention is sufficient** — recurrence is not necessary for strong sequence modeling.\n- **Parallelism** — attention enables full parallel training, unlike RNNs.\n- **Multi-head attention** — multiple attention heads capture different relationship types simultaneously.\n- **Positional encodings** — order is injected additively rather than structurally.\n- **Scalability** — the architecture scales well with model size and data.',
  flashcards:
    'I have generated a set of flashcards from this document. You can find them in the **Flashcards** tab below, or click the Flashcards icon in the sidebar. Each card covers a core concept with a question and answer pair.',
  quiz:
    'A quiz has been generated from this document. Open the **Quiz** tab below to begin. It includes multiple choice, true/false, and short answer questions with explanations for each answer.',
  default:
    'Based on the document, here is what I found:\n\nThe document develops a **self-attention-based architecture** that processes sequences in parallel. Unlike recurrent networks, the Transformer computes representations for all positions simultaneously, which makes it highly efficient on modern hardware.\n\nThe authors demonstrate that this approach not only trains faster but also achieves better results on translation benchmarks. The trade-off is that attention cost grows **quadratically** with sequence length, which can be a limitation for very long inputs.',
};

export function matchPrompt(prompt: string): keyof typeof RESPONSES {
  const p = prompt.toLowerCase();
  if (p.includes('summar')) return 'summarize';
  if (p.includes('explain')) return 'explain';
  if (p.includes('key idea') || p.includes('main idea')) return 'ideas';
  if (p.includes('flashcard')) return 'flashcards';
  if (p.includes('quiz')) return 'quiz';
  return 'default';
}

const SAMPLE_CITATIONS: Citation[] = [
  { page: 2, paragraph: 1, text: 'The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers.' },
  { page: 3, paragraph: 0, text: 'Attention functions can be described as mapping a query and a set of key-value pairs to an output.' },
  { page: 4, paragraph: 2, text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces.' },
];

export async function streamResponse(
  prompt: string,
  onToken: (full: string) => void,
  onCitations: (c: Citation[]) => void,
  signal?: { cancelled: boolean }
): Promise<void> {
  const key = matchPrompt(prompt);
  const text = RESPONSES[key];
  const tokens = text.split(/(\s+)/);
  let acc = '';
  for (let i = 0; i < tokens.length; i++) {
    if (signal?.cancelled) return;
    acc += tokens[i];
    onToken(acc);
    await new Promise((r) => setTimeout(r, 12 + Math.random() * 28));
  }
  onCitations(SAMPLE_CITATIONS.slice(0, 2 + (Math.floor(Math.random() * 2))));
}

export function makeAssistantMessageId(): string {
  return uid('m');
}
