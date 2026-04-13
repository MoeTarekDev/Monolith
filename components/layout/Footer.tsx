import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-40">
      <div className="px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <p className="font-sans text-sm tracking-[0.3em] uppercase font-bold mb-4">
              Monolith
            </p>
            <p className="text-secondary text-sm font-sans max-w-xs leading-relaxed">
              A cinematic collection of words that inspire, provoke, and endure.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans mb-2">
              Navigate
            </p>
            <Link href="/explore" className="animated-underline text-sm font-sans opacity-70 hover:opacity-100 transition-opacity w-fit">
              Explore Quotes
            </Link>
            <Link href="/explore?view=authors" className="animated-underline text-sm font-sans opacity-70 hover:opacity-100 transition-opacity w-fit">
              Browse Authors
            </Link>
            <Link href="/collections" className="animated-underline text-sm font-sans opacity-70 hover:opacity-100 transition-opacity w-fit">
              Collections
            </Link>
            <Link href="/about" className="animated-underline text-sm font-sans opacity-70 hover:opacity-100 transition-opacity w-fit">
              About
            </Link>
          </div>

          {/* Daily Quote Email */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans mb-4">
              Daily Dose
            </p>
            <p className="text-sm text-secondary font-sans mb-4 leading-relaxed">
              One quote, every morning. No spam.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-transparent border-b border-white/20 pb-3 pr-8 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
              />
              <span className="absolute right-0 bottom-3 text-sm text-secondary">→</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-tertiary font-sans">
            © {new Date().getFullYear()} Monolith. Words that moved the world.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-tertiary font-sans">
              Press <kbd className="border border-white/20 px-1.5 py-0.5 rounded text-[10px]">/</kbd> to search
            </span>
            <span className="text-xs text-tertiary font-sans">
              Press <kbd className="border border-white/20 px-1.5 py-0.5 rounded text-[10px]">R</kbd> for random
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
