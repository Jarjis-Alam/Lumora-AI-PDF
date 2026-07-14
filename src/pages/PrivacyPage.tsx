import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Logo } from '../components/Logo';

export function PrivacyPage() {
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
          <Shield className="text-crimson-600" size={32} />
          <h1 className="font-serif text-4xl font-semibold text-ink-900">Privacy Policy</h1>
        </div>
        <p className="text-base text-ink-500 mb-10">
          Your privacy is at the core of how we design and build Lumora.
        </p>

        <hr className="border-ink-200/50 mb-10" />

        <div className="space-y-6 text-xs leading-relaxed text-ink-650">
          <p>
            At Lumora, we believe that your documents and research are your own business. That's why we have adopted a <strong>local-first privacy model</strong>. 
          </p>
          <h2 className="font-serif text-lg font-semibold text-ink-800 mt-6">1. Data Storage</h2>
          <p>
            All document uploads, extracted text chunks, vector embeddings, summaries, and chat history are saved securely on your local device. We do not store your PDFs on our servers.
          </p>
          <h2 className="font-serif text-lg font-semibold text-ink-800 mt-6">2. Third-Party Services</h2>
          <p>
            To generate summaries, chat completions, flashcards, and quizzes, text snippets are securely transmitted to Groq APIs. These requests are encrypted in transit and subject to Groq's standard privacy policies (which do not train models on API inputs).
          </p>
          <h2 className="font-serif text-lg font-semibold text-ink-800 mt-6">3. Cookies & Tracking</h2>
          <p>
            Lumora does not use tracking cookies, analytics scripts, or behavioral tracking trackers. The app runs transparently without profiling you.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200/50 bg-paper-50 py-8 text-center text-xs text-ink-400">
        <p>© {new Date().getFullYear()} Lumora. All rights reserved.</p>
      </footer>
    </div>
  );
}
