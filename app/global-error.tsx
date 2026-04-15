'use client';

import FluidHeading from '@/components/ui/FluidHeading';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-8 block">
            System Failure
          </span>
          
          <FluidHeading size="lg" className="mb-8">
            A Fracture in the Monolith
          </FluidHeading>
          
          <p className="font-serif italic text-secondary mb-12">
            An unexpected error has occurred while accessing the archives. {error.digest && `(Entry digest: ${error.digest})`}
          </p>

          <button
            onClick={() => reset()}
            className="animated-underline text-xs uppercase tracking-[0.2em] font-sans text-white cursor-pointer"
          >
            Attempt Recovery →
          </button>
        </div>
      </body>
    </html>
  );
}
