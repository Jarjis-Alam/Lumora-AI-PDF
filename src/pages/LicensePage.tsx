import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { Logo } from '../components/Logo';

export function LicensePage() {
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
          <Scale className="text-crimson-600" size={32} />
          <h1 className="font-serif text-4xl font-semibold text-ink-900">MIT License</h1>
        </div>
        <p className="text-base text-ink-500 mb-10">
          Lumora is an open-source software project distributed under the terms of the MIT license.
        </p>

        <hr className="border-ink-200/50 mb-10" />

        <div className="rounded-xl border border-ink-200/60 bg-paper-50 p-8 shadow-soft">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-600">
{`MIT License

Copyright (c) 2026 Munshi Jarjis Alam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200/50 bg-paper-50 py-8 text-center text-xs text-ink-400">
        <p>© {new Date().getFullYear()} Lumora. All rights reserved.</p>
      </footer>
    </div>
  );
}
