import { ReactNode } from "react";
import { Link } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[hsl(var(--background))]">
      {/* Navbar Minimal */}
      <header className="absolute top-0 w-full z-20 py-6 px-4 sm:px-8 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-white/80 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          Campus Build Lab
        </Link>
        <Link href="/admin" className="text-xs font-medium text-white/40 hover:text-white transition-colors">
          Admin
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 pt-20">
        {children}
      </main>

      {/* Footer Minimal */}
      <footer className="z-10 py-10 text-center flex flex-col items-center gap-2">
        <div className="h-px w-16 bg-white/10 mb-4" />
        <p className="text-xs text-white/30 tracking-wide uppercase font-medium">
          Built by BCA 4th Semester
        </p>
        <p className="text-[10px] text-white/20">
          Department of Computer Applications
        </p>
      </footer>
    </div>
  );
}
