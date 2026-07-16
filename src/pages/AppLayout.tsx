import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Logo } from '../components/Logo';
import { useStore } from '../store';

export function AppLayout() {
  const isMobileMenuOpen = useStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(192,57,43,0.10),_transparent_32%),linear-gradient(135deg,_#fcfbf8_0%,_#f7f2ea_100%)] md:flex-row">
      {/* Mobile Top Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200/60 bg-paper-50/90 px-4 shadow-soft backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2">
          <Logo size={24} withWordmark />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-paper-200"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Drawer on Mobile / Fixed on Desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:block`}
      >
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="relative flex-1 overflow-hidden bg-gradient-to-br from-paper-50 via-paper-100 to-paper-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(192,57,43,0.06),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.05),_transparent_25%)]" />
        <div className="relative h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
