import { CitationChip } from './CitationChip';
import type { Citation } from '../types';

// Minimal, safe markdown renderer — handles headings, bold, italic, code,
// tables, lists, and paragraphs. No external dependency.
export function Markdown({ content, citations }: { content: string; citations?: Citation[] }) {
  const blocks = parseBlocks(content);
  return (
    <div className="prose-editorial">
      {blocks.map((block, i) => renderBlock(block, i))}
      {citations && citations.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-ink-100 pt-3">
          <span className="text-2xs font-medium text-ink-400">Citations:</span>
          {citations.map((c, ci) => (
            <CitationChip key={ci} citation={c} index={ci} />
          ))}
        </div>
      )}
    </div>
  );
}

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'quote'; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) });
      i++;
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) });
      i++;
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) });
      i++;
    } else if (line.startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', text: code.join('\n') });
    } else if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.map((l) =>
        l.split('|').slice(1, -1).map((c) => c.trim())
      );
      if (rows.length >= 2) {
        blocks.push({
          type: 'table',
          header: rows[0],
          rows: rows.slice(2),
        });
      }
    } else if (line.startsWith('> ')) {
      const quote: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) {
        quote.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'quote', text: quote.join('\n') });
    } else if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'ul', items });
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
    } else {
      blocks.push({ type: 'p', text: line });
      i++;
    }
  }
  return blocks;
}

function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={key++} className="font-semibold text-ink-800">{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={key++}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={key++}>{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderBlock(block: Block, i: number): JSX.Element {
  switch (block.type) {
    case 'h1': return <h1 key={i}>{renderInline(block.text)}</h1>;
    case 'h2': return <h2 key={i}>{renderInline(block.text)}</h2>;
    case 'h3': return <h3 key={i}>{renderInline(block.text)}</h3>;
    case 'p': return <p key={i}>{renderInline(block.text)}</p>;
    case 'ul': return <ul key={i}>{block.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
    case 'ol': return <ol key={i}>{block.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
    case 'code': return <pre key={i}><code>{block.text}</code></pre>;
    case 'quote': return <blockquote key={i}>{block.text}</blockquote>;
    case 'table':
      return (
        <div key={i} className="overflow-x-auto">
          <table>
            <thead>
              <tr>{block.header.map((h, j) => <th key={j}>{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j}>{row.map((c, k) => <td key={k}>{renderInline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
