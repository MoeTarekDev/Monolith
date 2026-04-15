'use client';

import Link from 'next/link';
import FluidHeading from '@/components/ui/FluidHeading';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col pt-32">
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-8 block">
          Error 404 — Entry Missing
        </span>
        
        <FluidHeading size="hero" blend className="mb-12">
          Lost in the Archives
        </FluidHeading>
        
        <p className="max-w-md font-serif italic text-fluid-sm text-secondary mb-12">
          The page you are looking for has been moved, removed, or never existed in this collection.
        </p>

        <Link
          href="/"
          className="animated-underline text-xs uppercase tracking-[0.2em] font-sans text-white"
        >
          Return to Library Index →
        </Link>
      </main>
      <Footer />
    </div>
  );
}
