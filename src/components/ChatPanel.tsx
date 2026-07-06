import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Copy, RefreshCw, Trash2, Sparkles, User, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { Markdown } from './Markdown';
import { EmptyState } from './EmptyState';
import { streamResponse, makeAssistantMessageId } from '../lib/ai';
import { uid } from '../lib/utils';
import type { ChatMessage } from '../types';

const SUGGESTED_PROMPTS = [
  'Summarize this document',
  'Explain this section',
  'What are the key ideas?',
  'Generate flashcards',
  'Create a quiz',
];

export function ChatPanel() {
  const activeDocId = useStore((s) => s.activeDocId);
  const documents = useStore((s) => s.documents);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const updateChatMessage = useStore((s) => s.updateChatMessage);
  const clearChat = useStore((s) => s.clearChat);
  const setView = useStore((s) => s.setView);
  const navigate = useNavigate();

  const doc = documents.find((d) => d.id === activeDocId);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<{ cancelled: boolean } | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [doc?.chat]);

  if (!doc) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No document selected"
        description="Select a document from the sidebar to start chatting with it."
      />
    );
  }

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: uid('m'),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };
    addChatMessage(doc.id, userMsg);
    setInput('');
    setStreaming(true);

    const assistantId = makeAssistantMessageId();
    addChatMessage(doc.id, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      streaming: true,
    });

    cancelRef.current = { cancelled: false };
    await streamResponse(
      text,
      (full) => updateChatMessage(doc.id, assistantId, { content: full }),
      (citations) => updateChatMessage(doc.id, assistantId, { citations, streaming: false }),
      cancelRef.current
    );
    setStreaming(false);
  };

  const regenerate = async () => {
    const lastUser = [...doc.chat].reverse().find((m) => m.role === 'user');
    if (!lastUser || streaming) return;
    // Remove last assistant message
    const lastAssistant = [...doc.chat].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      // We can't remove directly, so we'll just send a new response
    }
    send(lastUser.content);
  };

  return (
    <div className="flex h-full flex-col bg-paper-50">
      {/* Header */}
      <div className="flex h-11 items-center justify-between border-b border-ink-100/80 px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-crimson-600 text-paper-50">
            <Sparkles size={13} />
          </div>
          <span className="text-sm font-medium text-ink-700">AI Chat</span>
        </div>
        {doc.chat.length > 0 && (
          <button
            onClick={() => clearChat(doc.id)}
            className="btn-ghost btn-sm text-ink-400"
            title="Clear chat"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {doc.chat.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
              <Sparkles size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink-700">Ask about this document</h3>
            <p className="mt-1.5 max-w-xs text-sm text-ink-400">
              I can summarize, explain, and generate study materials from {doc.name}.
            </p>
            <div className="mt-6 w-full max-w-sm space-y-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="flex w-full items-center gap-2 rounded-lg border border-ink-100 px-3 py-2.5 text-left text-sm text-ink-600 transition-all hover:border-crimson-200 hover:bg-crimson-50/30"
                >
                  <Sparkles size={13} className="text-crimson-400" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {doc.chat.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                onRegenerate={regenerate}
                onNavigate={(v) => { setView(v); navigate(`/app/${v}`); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-ink-100/80 p-3">
        <div className="relative flex items-end gap-2 rounded-xl border border-ink-200 bg-paper-100 p-2 transition-colors focus-within:border-crimson-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask anything about this document..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none"
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-crimson-600 text-paper-50 transition-all hover:bg-crimson-700 disabled:opacity-40"
          >
            {streaming ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="mt-1.5 text-center text-2xs text-ink-300">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function ChatBubble({
  msg,
  onRegenerate,
  onNavigate,
}: {
  msg: ChatMessage;
  onRegenerate: () => void;
  onNavigate: (v: 'flashcards' | 'quiz') => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={isUser ? 'flex justify-end' : 'flex justify-start'}
    >
      <div className={isUser ? 'max-w-[85%]' : 'max-w-[90%] w-full'}>
        <div className="mb-1 flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isUser ? 'bg-ink-200 text-ink-600' : 'bg-crimson-600 text-paper-50'
            }`}
          >
            {isUser ? <User size={12} /> : <Sparkles size={12} />}
          </div>
          <span className="text-2xs font-medium text-ink-400">
            {isUser ? 'You' : 'Lumora AI'}
          </span>
        </div>
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-crimson-600 px-4 py-2.5 text-sm text-paper-50'
              : 'rounded-2xl rounded-tl-sm border border-ink-100 bg-paper-50 px-4 py-3'
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : msg.content ? (
            <Markdown content={msg.content} citations={msg.citations} />
          ) : (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-crimson-400" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-crimson-400" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-crimson-400" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          {msg.streaming && msg.content && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-blink-caret bg-crimson-500 align-middle" />
          )}
        </div>
        {!isUser && msg.content && !msg.streaming && (
          <div className="mt-1.5 flex items-center gap-1">
            <button onClick={copy} className="flex items-center gap-1 rounded px-1.5 py-1 text-2xs text-ink-400 hover:bg-paper-200 hover:text-ink-600">
              {copied ? 'Copied' : <><Copy size={11} /> Copy</>}
            </button>
            <button onClick={onRegenerate} className="flex items-center gap-1 rounded px-1.5 py-1 text-2xs text-ink-400 hover:bg-paper-200 hover:text-ink-600">
              <RefreshCw size={11} /> Regenerate
            </button>
            {msg.content.toLowerCase().includes('flashcard') && (
              <button onClick={() => onNavigate('flashcards')} className="flex items-center gap-1 rounded px-1.5 py-1 text-2xs text-crimson-600 hover:bg-crimson-50">
                View Flashcards →
              </button>
            )}
            {msg.content.toLowerCase().includes('quiz') && (
              <button onClick={() => onNavigate('quiz')} className="flex items-center gap-1 rounded px-1.5 py-1 text-2xs text-crimson-600 hover:bg-crimson-50">
                View Quiz →
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
