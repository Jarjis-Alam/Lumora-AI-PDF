import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Logo } from '../components/Logo';
import { useStore } from '../store';

export function AppLayout() {
  const isMobileMenuOpen = useStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-paper-100">
      {/* Mobile Top Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-100/40 bg-paper-50 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Logo size={24} withWordmark />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-ink-500 hover:bg-paper-200"
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

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
