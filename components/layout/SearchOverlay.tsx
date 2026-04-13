'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Quote, Author } from '@/lib/data';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setQuotes([]);
      setAuthors([]);
    }
  }, [isOpen]);



  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setQuotes([]);
      setAuthors([]);
      return;
    }

    setIsLoading(true);

    try {
      // Search authors by name
      const { data: authorData } = await supabase
        .from('authors')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      // Search quotes by text
      const { data: quoteData } = await supabase
        .from('quotes')
        .select('*, author:authors(*)')
        .ilike('text', `%${searchQuery}%`)
        .limit(8);

      setAuthors(authorData || []);
      setQuotes(quoteData || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col items-center overlay-blur bg-black/80"
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 md:right-10 text-xs tracking-[0.15em] uppercase font-sans opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
            Close
          </button>

          {/* Search input */}
          <div className="w-full max-w-3xl px-6 mt-[30vh]">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quotes, authors..."
                className="w-full bg-transparent border-b border-white/20 pb-4 text-fluid-md font-serif italic text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
              />
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 max-h-[40vh] overflow-y-auto"
            >
              {isLoading && (
                <p className="text-secondary text-sm font-sans">Searching...</p>
              )}

              {/* Authors */}
              {authors.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans mb-4">
                    Authors
                  </p>
                  <div className="space-y-3">
                    {authors.map((author) => (
                      <Link
                        key={author.id}
                        href={`/author/${author.slug}`}
                        onClick={onClose}
                        className="block group"
                      >
                        <p className="font-serif text-lg italic group-hover:opacity-100 opacity-80 transition-opacity">
                          {author.name}
                        </p>
                        <p className="text-xs text-secondary font-sans">
                          {author.profession} · {author.quote_count} quotes
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes */}
              {quotes.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans mb-4">
                    Quotes
                  </p>
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <Link
                        key={quote.id}
                        href={`/quote/${quote.slug}`}
                        onClick={onClose}
                        className="block group"
                      >
                        <p className="font-serif italic opacity-80 group-hover:opacity-100 transition-opacity line-clamp-2">
                          &ldquo;{quote.text}&rdquo;
                        </p>
                        <p className="text-xs text-secondary font-sans mt-1">
                          {quote.author?.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && query && authors.length === 0 && quotes.length === 0 && (
                <p className="text-secondary text-sm font-sans">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
