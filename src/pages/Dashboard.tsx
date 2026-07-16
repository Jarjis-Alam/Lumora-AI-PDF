import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  AlignLeft,
  Layers,
  ListChecks,
  Share2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Pin,
  TrendingUp,
  Award,
  Cpu,
  FileText,
  BookOpen,
} from 'lucide-react';
import { UploadZone } from '../components/UploadZone';
import { DocumentCard } from '../components/DocumentCard';
import { useStore } from '../store';
import { timeAgo } from '../lib/utils';

const QUICK_ACTIONS = [
  { icon: AlignLeft, label: 'Summarize', desc: 'Distill findings', view: 'summary' as const, color: '#C0392B' },
  { icon: MessageSquare, label: 'AI Chat', desc: 'Ask citations', view: 'chat' as const, color: '#4A6FA5' },
  { icon: Layers, label: 'Flashcards', desc: 'Active recall', view: 'flashcards' as const, color: '#6B8E6F' },
  { icon: ListChecks, label: 'Quiz', desc: 'Test memory', view: 'quiz' as const, color: '#B8893A' },
  { icon: Share2, label: 'Concept Graph', desc: 'Map relations', view: 'graph' as const, color: '#7A5C8F' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const documents = useStore((s) => s.documents);
  const activeDocId = useStore((s) => s.activeDocId);
  const setWorkspaceTab = useStore((s) => s.setWorkspaceTab);
  const openDocument = useStore((s) => s.openDocument);

  const readyDocs = documents.filter((d) => d.status === 'ready');
  const continueReading = readyDocs
    .filter((d) => d.lastOpenedAt)
    .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
    .slice(0, 3);
  const activeDoc = documents.find((d) => d.id === activeDocId);

  // Derive stats
  const totalConcepts = readyDocs.reduce((acc, d) => acc + (d.summary?.concepts.length || 0), 0);
  const totalFlashcards = readyDocs.reduce((acc, d) => acc + d.flashcards.length, 0);
  const totalQuizzes = readyDocs.reduce((acc, d) => acc + (d.quiz.length > 0 ? 1 : 0), 0);

  // Mock pinned docs (first 2 docs or docs with bookmarks)
  const pinnedDocs = readyDocs.filter((d, i) => d.bookmarks.length > 0 || i === 0).slice(0, 2);

  // Recent AI conversations
  const recentChats = readyDocs
    .filter((d) => d.chat.length > 0)
    .map((d) => ({
      docId: d.id,
      docName: d.name,
      lastMsg: d.chat[d.chat.length - 1],
      accent: d.accent,
    }))
    .slice(0, 3);

  const handleOpenDoc = (id: string, tab: any = 'chat') => {
    openDocument(id);
    setWorkspaceTab(tab);
    navigate('/app/workspace');
  };

  return (
    <div className="h-full overflow-y-auto paper-texture">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-100/40 pb-5">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-2xl font-bold tracking-editorial text-ink-800">
              Research Workspace
            </h1>
            <p className="text-xs text-ink-400 mt-1">Upload, study, and organize your academic corpus.</p>
          </motion.div>
          
          {activeDoc && (
            <motion.button
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleOpenDoc(activeDoc.id, 'chat')}
              className="btn-primary rounded px-4 py-2 text-xs flex items-center gap-1.5 self-start shadow-soft"
            >
              <Cpu size={13} />
              <span>Resume active session</span>
              <ArrowRight size={13} />
            </motion.button>
          )}
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {[
            { label: 'Documents', value: documents.length, icon: FileText, color: '#C0392B' },
            { label: 'Flashcards', value: totalFlashcards || 324, icon: Layers, color: '#6B8E6F' },
            { label: 'Quizzes', value: totalQuizzes || 18, icon: ListChecks, color: '#B8893A' },
            { label: 'Knowledge Graphs', value: readyDocs.filter(d => d.summary).length || 12, icon: Share2, color: '#7A5C8F' },
            { label: 'Hours Saved', value: `${(documents.length * 1.5 + (totalFlashcards || 324) * 0.04 + (totalQuizzes || 18) * 0.15).toFixed(1)}`, icon: Clock, color: '#4A6FA5' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 flex flex-col justify-between bg-paper-50 shadow-soft hover:shadow-card hover:border-ink-200 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{stat.label}</span>
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${stat.color}12`, color: stat.color }}
                  >
                    <Icon size={11} strokeWidth={2.5} />
                  </span>
                </div>
                <div className="mt-2 font-serif text-xl font-bold tracking-editorial text-ink-800">
                  {stat.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Core Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left / Middle: main content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Library / Pinned Section */}
            {pinnedDocs.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                  <Pin size={12} className="text-crimson-600" />
                  <span>Pinned Documents</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pinnedDocs.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleOpenDoc(doc.id, 'chat')}
                      className="card p-4 hover:shadow-card hover:border-ink-200 transition-all cursor-pointer flex flex-col justify-between h-32 relative"
                    >
                      <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-xl" style={{ backgroundColor: doc.accent }} />
                      <div className="flex items-start justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-ink-400 shrink-0" />
                          <h3 className="text-xs font-bold text-ink-850 truncate">{doc.name}</h3>
                        </div>
                        <Pin size={11} className="text-crimson-600 shrink-0" />
                      </div>
                      <div className="flex justify-between items-end pt-2 text-[10px] text-ink-400 border-t border-ink-100/30">
                        <span>{doc.pages} pages</span>
                        <span>Opened {timeAgo(doc.uploadedAt)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Continue Reading Section */}
            {continueReading.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                  <Clock size={12} />
                  <span>Continue Reading</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {continueReading.map((doc, i) => (
                    <DocumentCard key={doc.id} doc={doc} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Conversations */}
            {recentChats.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                  <MessageSquare size={12} />
                  <span>Recent AI Discussions</span>
                </div>
                <div className="space-y-2">
                  {recentChats.map((chat) => (
                    <div
                      key={chat.docId}
                      onClick={() => handleOpenDoc(chat.docId, 'chat')}
                      className="card p-3.5 hover:shadow-card hover:border-ink-200 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-6 w-1 rounded-full shrink-0" style={{ backgroundColor: chat.accent }} />
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-ink-400 truncate">{chat.docName}</p>
                          <p className="text-xs text-ink-600 truncate mt-0.5 font-body">"{chat.lastMsg.content}"</p>
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-ink-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {readyDocs.length === 0 && (
              <div className="rounded-xl border border-dashed border-ink-200 bg-paper-50/50 p-12 text-center flex flex-col items-center justify-center space-y-4">
                <BookOpen size={32} className="text-ink-300 animate-breathe" />
                <div>
                  <h3 className="font-serif text-sm font-semibold text-ink-800">Your Library is Empty</h3>
                  <p className="text-xs text-ink-400 mt-1">Upload files on the right to build your workspace.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: Upload, Quick actions, Stats */}
          <div className="space-y-6">
            
            {/* Upload Zone */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <UploadZone />
            </motion.div>

            {/* Quick Actions */}
            <div className="card p-4 space-y-3 bg-paper-50">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-ink-800">Study Shortcuts</h3>
                {activeDoc ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-sage">
                    <CheckCircle2 size={10} /> {activeDoc.pages} p
                  </span>
                ) : (
                  <span className="text-[10px] text-ink-400">Select active doc</span>
                )}
              </div>
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  const disabled = !activeDoc;
                  return (
                    <button
                      key={a.label}
                      disabled={disabled}
                      onClick={() => handleOpenDoc(activeDoc!.id, a.view)}
                      className="group flex w-full items-center gap-3 rounded border border-ink-100/50 bg-paper-50/50 px-3 py-2 text-left transition-all hover:border-ink-200 hover:bg-paper-200/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${a.color}12`, color: a.color }}
                      >
                        <Icon size={13} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink-700 leading-none">{a.label}</p>
                        <p className="text-[10px] text-ink-400 mt-1 leading-none">{a.desc}</p>
                      </div>
                      <ArrowRight size={12} className="text-ink-300 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Study Progress Card */}
            <div className="card p-4 space-y-4 bg-paper-50">
              <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide2 text-ink-400">
                <TrendingUp size={12} className="text-crimson-600" />
                <span>Study Metrics</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-ink-100/30 pb-2">
                  <div className="flex items-center gap-2">
                    <Award size={13} className="text-crimson-600" />
                    <span className="text-xs text-ink-500">Unlocked concepts</span>
                  </div>
                  <span className="text-xs font-bold text-ink-800">{totalConcepts}</span>
                </div>
                <div className="flex items-center justify-between border-b border-ink-100/30 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-crimson-600" />
                    <span className="text-xs text-ink-500">Review flashcards</span>
                  </div>
                  <span className="text-xs font-bold text-ink-800">{totalFlashcards}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks size={13} className="text-crimson-600" />
                    <span className="text-xs text-ink-500">Completed quizzes</span>
                  </div>
                  <span className="text-xs font-bold text-ink-800">{totalQuizzes}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
