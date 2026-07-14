import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Logo } from '../components/Logo';

export function TermsPage() {
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
          <FileText className="text-crimson-600" size={32} />
          <h1 className="font-serif text-4xl font-semibold text-ink-900">Terms of Service</h1>
        </div>
        <p className="text-base text-ink-500 mb-10">
          Please read these terms carefully before using Lumora.
        </p>

        <hr className="border-ink-200/50 mb-10" />

        <div className="space-y-6 text-xs leading-relaxed text-ink-650">
          <h2 className="font-serif text-lg font-semibold text-ink-800">1. Acceptance of Terms</h2>
          <p>
            By using Lumora, you agree to these Terms of Service. If you do not agree, do not use the application.
          </p>
          <h2 className="font-serif text-lg font-semibold text-ink-800 mt-6">2. Use License</h2>
          <p>
            Lumora is open-source under the MIT License. You are permitted to modify, distribute, compile, and run the software in accordance with the license conditions.
          </p>
          <h2 className="font-serif text-lg font-semibold text-ink-800 mt-6">3. Disclaimer of Warranties</h2>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
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
