import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, RefreshCw, Trash2, Sparkles, User, Check, Zap, BookOpen, Brain, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { Markdown } from './Markdown';
import { EmptyState } from './EmptyState';
import { Tooltip } from './Tooltip';
import { streamResponse, makeAssistantMessageId } from '../lib/ai';
import { uid } from '../lib/utils';
import type { ChatMessage } from '../types';

const SUGGESTED_PROMPTS = [
  { icon: '📝', text: 'Summarize this document', color: 'crimson' },
  { icon: '💡', text: 'Explain the key concepts', color: 'amber' },
  { icon: '🎯', text: 'What are the main takeaways?', color: 'emerald' },
  { icon: '🗂️', text: 'Generate flashcards', color: 'violet' },
  { icon: '📊', text: 'Create a quiz', color: 'blue' },
];

function getFollowUps(lastMsgContent: string): string[] {
  const content = lastMsgContent.toLowerCase();
  if (content.includes('attention') || content.includes('transformer')) {
    return [
      'Explain multi-head attention in detail.',
      'How do self-attention and recurrence compare?',
      'Generate a quiz on transformer architecture.',
    ];
  }
  if (content.includes('summary') || content.includes('overview')) {
    return [
      'What are the key takeaways of this chapter?',
      'Define the primary terms used here.',
      'Generate flashcards for this summary.',
    ];
  }
  return [
    'Can you explain this with a real-world example?',
    'What are the main limitations or assumptions here?',
    'Generate study flashcards for this explanation.',
  ];
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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
        description="Select a document from the sidebar to start an AI-powered conversation."
        tips={[
          'Chat responses are always grounded in your document with citations',
          'Ask follow-up questions to dive deeper into specific topics',
          'Use the citation chips to jump to the exact source paragraph'
        ]}
        accent="#C0392B"
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

  const stopGeneration = () => {
    if (cancelRef.current) {
      cancelRef.current.cancelled = true;
      setStreaming(false);
      const lastMsg = [...doc.chat].reverse().find((m) => m.role === 'assistant');
      if (lastMsg) {
        updateChatMessage(doc.id, lastMsg.id, { streaming: false });
      }
    }
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
    <div className="flex h-full flex-col bg-gradient-to-b from-paper-50 to-paper-100">
      {/* Enhanced Header */}
      <div className="flex h-14 items-center justify-between border-b border-ink-100/80 bg-paper-50/95 px-4 backdrop-blur-lg shadow-soft">
        <div className="flex items-center gap-2.5">
          <motion.div 
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-600 to-crimson-500 text-paper-50 shadow-soft"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Sparkles size={16} />
          </motion.div>
          <div>
            <span className="text-sm font-semibold text-ink-800">AI Chat</span>
            <p className="text-2xs text-ink-400">{doc.chat.length} messages</p>
          </div>
        </div>
        {doc.chat.length > 0 && (
          <Tooltip label="Clear conversation" position="bottom">
            <button
              onClick={() => clearChat(doc.id)}
              className="btn-icon border border-ink-200/50 bg-paper-100 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {doc.chat.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-50 to-crimson-100/50 text-crimson-600 shadow-soft"
            >
              <Sparkles size={32} strokeWidth={1.5} className="animate-pulse-glow" />
            </motion.div>
            <motion.h3
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-xl font-bold text-ink-800"
            >
              Ask me anything about this document
            </motion.h3>
            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-2 max-w-md text-sm leading-relaxed text-ink-500"
            >
              I can summarize, explain concepts, generate study materials, and answer questions from <span className="font-semibold text-ink-700">{doc.name}</span>.
            </motion.p>
            
            {/* Enhanced Suggested Prompts */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 w-full max-w-lg space-y-2"
            >
              <p className="mb-3 text-2xs font-bold uppercase tracking-wider text-ink-400">Suggested prompts</p>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <motion.button
                  key={p.text}
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  onClick={() => send(p.text)}
                  className="group flex w-full items-center gap-3 rounded-xl border-2 border-ink-200/60 bg-paper-50 px-4 py-3 text-left transition-all hover:border-crimson-300 hover:bg-crimson-50/30 hover:shadow-soft"
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="flex-1 text-sm font-medium text-ink-700 group-hover:text-crimson-800">{p.text}</span>
                  <Sparkles size={14} className="text-ink-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-crimson-500" />
                </motion.button>
              ))}
            </motion.div>

            {/* Features highlight */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex items-center gap-6 text-2xs text-ink-400"
            >
              <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-500" /> Instant responses</span>
              <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-emerald-600" /> Cited answers</span>
              <span className="flex items-center gap-1.5"><Brain size={12} className="text-violet-600" /> Context aware</span>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            <AnimatePresence initial={false}>
              {doc.chat.map((msg, index) => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  index={index}
                  onRegenerate={regenerate}
                  onNavigate={(v) => { setView(v); navigate(`/app/${v}`); }}
                  streaming={streaming && index === doc.chat.length - 1}
                />
              ))}
            </AnimatePresence>

            {/* Enhanced Suggested Follow-Ups */}
            {!streaming && doc.chat.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 space-y-2 rounded-xl border border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp size={12} className="text-crimson-600" />
                  <span className="text-2xs font-bold uppercase tracking-wider text-ink-500">Continue the conversation</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getFollowUps(doc.chat[doc.chat.length - 1].content).map((prompt) => (
                    <motion.button
                      key={prompt}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => send(prompt)}
                      className="chip chip-secondary hover:chip-primary cursor-pointer transition-all"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Input */}
      <div className="border-t border-ink-100/80 bg-paper-50/95 p-4 backdrop-blur-lg">
        <div className="relative flex items-end gap-3 rounded-2xl border-2 border-ink-200/80 bg-paper-100 p-3 shadow-soft transition-all focus-within:border-crimson-400 focus-within:shadow-card">
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
            className="max-h-32 flex-1 resize-none bg-transparent px-1 py-1 text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
            style={{ minHeight: '32px' }}
          />
          {streaming ? (
            <Tooltip label="Stop generating" position="top">
              <motion.button
                onClick={stopGeneration}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-900 text-paper-50 shadow-soft transition-all hover:shadow-card"
              >
                <motion.div
                  animate={{ scale: [1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-3 w-3 rounded-sm bg-white"
                />
              </motion.button>
            </Tooltip>
          ) : (
            <Tooltip label="Send message (Enter)" position="top">
              <motion.button
                onClick={() => send(input)}
                disabled={!input.trim()}
                whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                className="btn-primary h-10 w-10 shrink-0 rounded-xl p-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </motion.button>
            </Tooltip>
          )}
        </div>
        <p className="mt-2 text-center text-2xs text-ink-400">
          <kbd className="rounded bg-paper-200 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to send · 
          <kbd className="ml-1 rounded bg-paper-200 px-1.5 py-0.5 font-mono text-[10px]">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

function ChatBubble({
  msg,
  index,
  onRegenerate,
  onNavigate,
  streaming = false,
}: {
  msg: ChatMessage;
  index: number;
  onRegenerate: () => void;
  onNavigate: (v: 'flashcards' | 'quiz') => void;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={isUser ? 'flex justify-end' : 'flex justify-start'}
    >
      <div className={isUser ? 'max-w-[80%]' : 'max-w-[90%] w-full'}>
        <div className="mb-2 flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.1, type: 'spring', stiffness: 500 }}
            className={classNames(
              'flex h-7 w-7 items-center justify-center rounded-lg shadow-soft',
              isUser 
                ? 'bg-gradient-to-br from-ink-200 to-ink-300 text-ink-700' 
                : 'bg-gradient-to-br from-crimson-600 to-crimson-500 text-paper-50'
            )}
          >
            {isUser ? <User size={14} /> : <Sparkles size={14} />}
          </motion.div>
          <span className="text-xs font-semibold text-ink-700">
            {isUser ? 'You' : 'Lumora AI'}
          </span>
          <span className="text-2xs text-ink-400">
            {formatTime(msg.createdAt)}
          </span>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.15 }}
          className={classNames(
            'shadow-soft',
            isUser
              ? 'rounded-2xl rounded-tr-md bg-gradient-to-br from-crimson-600 to-crimson-500 px-4 py-3 text-sm text-paper-50'
              : 'rounded-2xl rounded-tl-md border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 px-5 py-4'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          ) : msg.content ? (
            <div className="prose-editorial">
              <Markdown content={msg.content} citations={msg.citations} />
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-crimson-400"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink-500">
                {streaming ? 'Searching through document...' : 'Thinking...'}
              </span>
            </div>
          )}
          {msg.streaming && msg.content && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="ml-1 inline-block h-5 w-0.5 bg-crimson-500 align-middle"
            />
          )}
        </motion.div>
        
        {!isUser && msg.content && !msg.streaming && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 flex flex-wrap items-center gap-1.5"
          >
            <Tooltip label={copied ? 'Copied!' : 'Copy response'} position="top">
              <button 
                onClick={copy} 
                className="btn-icon btn-xs border border-ink-200/50 bg-paper-100"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            </Tooltip>
            <Tooltip label="Regenerate response" position="top">
              <button 
                onClick={onRegenerate} 
                className="btn-icon btn-xs border border-ink-200/50 bg-paper-100"
              >
                <RefreshCw size={12} />
              </button>
            </Tooltip>
            {msg.content.toLowerCase().includes('flashcard') && (
              <button 
                onClick={() => onNavigate('flashcards')} 
                className="chip chip-primary cursor-pointer"
              >
                View Flashcards →
              </button>
            )}
            {msg.content.toLowerCase().includes('quiz') && (
              <button 
                onClick={() => onNavigate('quiz')} 
                className="chip chip-primary cursor-pointer"
              >
                View Quiz →
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
