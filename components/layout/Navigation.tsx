'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SearchOverlay from './SearchOverlay';

const navLinks = [
  { href: '/explore', label: 'Quotes' },
  { href: '/explore?view=authors', label: 'Authors' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const router = useRouter();

  // Global Keyboard Shortcuts
  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !isSearchOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      
      if (e.key.toLowerCase() === 'r' && !isSearchOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        
        if (!isRandomLoading) {
          setIsRandomLoading(true);
          try {
            // Count quotes and pick random offset
            const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
            if (count) {
              const randomOffset = Math.floor(Math.random() * count);
              const { data } = await supabase.from('quotes').select('slug').range(randomOffset, randomOffset).single();
              if (data) {
                router.push(`/quote/${data.slug}`);
              }
            }
          } catch (err) {
            console.error('Error fetching random quote:', err);
          } finally {
            setIsRandomLoading(false);
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isRandomLoading, router]);

  return (
    <>
      <nav className="nav-fixed">
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          {/* Logo */}
          <Link href="/" className="font-sans text-sm tracking-[0.3em] uppercase font-bold">
            Monolith
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="animated-underline text-xs tracking-[0.15em] uppercase font-sans opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-xs tracking-[0.15em] uppercase font-sans opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              aria-label="Open search"
            >
              Search
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 cursor-pointer"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-px bg-white"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-px bg-white"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-px bg-white"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden bg-black/95 border-t border-white/10"
            >
              <div className="flex flex-col px-6 py-8 gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl font-serif italic"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="text-2xl font-serif italic text-left cursor-pointer"
                >
                  Search
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
