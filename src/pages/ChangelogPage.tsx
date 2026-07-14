import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Logo } from '../components/Logo';

export function ChangelogPage() {
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
          <Clock className="text-crimson-600" size={32} />
          <h1 className="font-serif text-4xl font-semibold text-ink-900">Changelog</h1>
        </div>
        <p className="text-base text-ink-500 mb-10">
          Stay up to date with the latest features, improvements, and releases for Lumora.
        </p>

        <hr className="border-ink-200/50 mb-10" />

        <div className="relative border-l border-ink-200/70 pl-8 ml-4 space-y-12">
          {/* Release 1 */}
          <div className="relative">
            {/* Timeline dot */}
            <span className="absolute -left-[41px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 bg-paper-100 text-crimson-600 text-xs font-semibold shadow-soft">
              •
            </span>
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <h2 className="font-serif text-2xl font-semibold text-ink-800">v1.0.0 — Initial Release</h2>
              <span className="text-2xs font-semibold uppercase bg-crimson-550/10 text-crimson-700 px-2 py-0.5 rounded-full">
                July 2026
              </span>
            </div>
            <p className="text-sm text-ink-500 mb-4 leading-relaxed">
              We are excited to launch the first production-ready release of Lumora. This version introduces all core features for document intelligence:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-ink-600 leading-relaxed ml-2">
              <li><strong>Interactive AI Chat:</strong> Ask questions and get cited streaming answers in real time.</li>
              <li><strong>Smart Summary View:</strong> Chapter-level summaries, key bullet points, and auto-generated concept terms.</li>
              <li><strong>Study Flashcards:</strong> Passive study conversion with interactive flip animations.</li>
              <li><strong>Interactive Quizzes:</strong> Auto-generated MCQ, short answer, and true/false testing.</li>
              <li><strong>Zoomable Knowledge Graph:</strong> Interactive React Flow graphs maps links between concepts.</li>
              <li><strong>Semantic Search:</strong> Vector-based semantic searching across all document contents.</li>
              <li><strong>Local Database Sync:</strong> Secure PostgreSQL / SQLite database integration with PGVector compatibility.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200/50 bg-paper-50 py-8 text-center text-xs text-ink-400">
        <p>© {new Date().getFullYear()} Lumora. All rights reserved.</p>
      </footer>
    </div>
  );
}
