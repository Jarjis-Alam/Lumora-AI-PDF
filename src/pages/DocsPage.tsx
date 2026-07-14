import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, MessageSquare, AlignLeft, Layers, ListChecks, Share2, Search } from 'lucide-react';
import { Logo } from '../components/Logo';

export function DocsPage() {
  return (
    <div className="min-h-screen bg-paper-100 font-sans text-ink-700">
      {/* Header */}
      <header className="border-b border-ink-200/40 bg-paper-100/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-serif text-base font-semibold text-ink-800">Lumora</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-crimson-700 hover:text-crimson-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Landing Page
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-crimson-600" size={32} />
          <h1 className="font-serif text-4xl font-semibold text-ink-900">Documentation</h1>
        </div>
        <p className="text-base text-ink-500 mb-10 leading-relaxed">
          Welcome to the Lumora user guide. Learn how to get the most out of your AI-powered document intelligence workspace.
        </p>

        <hr className="border-ink-200/50 mb-10" />

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink-800 mb-4">1. Getting Started</h2>
            <p className="leading-relaxed mb-4">
              To begin, click <strong>Open Workspace</strong> on the landing page. Drag and drop any PDF file into the upload zone, or click to browse files on your device. Lumora works entirely locally and indexes your file in seconds.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink-800 mb-4">2. Core Features</h2>
            <div className="space-y-6 mt-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/60 bg-paper-50 text-crimson-600">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 mb-1">AI Chat</h3>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Ask questions about your documents in natural language. The AI scans your PDF, generates answers, and includes citation chips that link directly to the specific page and paragraph in the document viewer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/60 bg-paper-50 text-crimson-600">
                  <AlignLeft size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 mb-1">Smart Summaries</h3>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Get an instant overview of your document with chapter-level summaries, key bullet points, and definitions of important terms extracted automatically by the AI.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/60 bg-paper-50 text-crimson-600">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 mb-1">Flashcards</h3>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Convert study materials into dynamic flashcards. Test yourself with active recall, flip the card to see the answer, and add your own custom flashcards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/60 bg-paper-50 text-crimson-600">
                  <ListChecks size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 mb-1">Interactive Quizzes</h3>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Assess your learning progress with multiple-choice, true/false, and short-answer quizzes generated dynamically based on your document's contents.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/60 bg-paper-50 text-crimson-600">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 mb-1">Knowledge Graphs</h3>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Visualize complex concepts and relationships with interactive React Flow graphs. Drag, zoom, and explore connections between key topics visually.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200/60 bg-paper-50 text-crimson-600">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 mb-1">Semantic Search</h3>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Search for ideas, meanings, and context across all your documents rather than just basic keyword matches. The system utilizes semantic embedding vectors to match intent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink-800 mb-4">3. Privacy First</h2>
            <p className="leading-relaxed">
              Lumora is designed to be local-first. Your documents are cached and processed securely on your own device. The data is stored in a local SQLite index database and is never shared, sold, or used to train public LLM models.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200/50 bg-paper-50 py-8 text-center text-xs text-ink-400">
        <p>© {new Date().getFullYear()} Lumora. All rights reserved.</p>
      </footer>
    </div>
  );
}
