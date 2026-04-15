'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  const [focusedIndex, setFocusedIndex] = useState<{ type: 'quote' | 'author', id: string } | null>(null);
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
      setFocusedIndex(null);
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
      // Search authors
      const { data: authorData } = await supabase
        .from('authors')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(4);

      // Search quotes
      const { data: quoteData } = await supabase
        .from('quotes')
        .select('*, author:authors(*)')
        .ilike('text', `%${searchQuery}%`)
        .limit(6);

      setAuthors(authorData || []);
      setQuotes(quoteData || []);
      
      // Auto-focus first result
      if (authorData?.[0]) setFocusedIndex({ type: 'author', id: authorData[0].id });
      else if (quoteData?.[0]) setFocusedIndex({ type: 'quote', id: quoteData[0].id });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, performSearch]);

  const focusedAuthor =
    focusedIndex?.type === 'author'
      ? authors.find((author) => author.id === focusedIndex.id) ?? null
      : null;
  const focusedQuote =
    focusedIndex?.type === 'quote'
      ? quotes.find((quote) => quote.id === focusedIndex.id) ?? null
      : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] overflow-hidden bg-black flex flex-col"
          data-lenis-prevent
        >
          {/* 1. Structural Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-8 gap-0 border-x border-white/10 mx-6 md:mx-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border-r border-white/10 h-full last:border-r-0" />
              ))}
            </div>
          </div>

          {/* 2. Top Navigation */}
          <div className="relative z-10 flex items-center justify-between px-6 md:px-10 py-10 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-white/40">
              Search Indexing Mode
            </p>
            <button
              onClick={onClose}
              className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-white hover:text-white/60 transition-colors cursor-pointer"
            >
              [ ESC ] Close
            </button>
          </div>

          {/* 3. Main Search Canvas */}
          <div className="relative z-10 flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            
            {/* Left: Input & Indices */}
            <div className="w-full md:w-1/2 flex flex-col p-6 md:p-10 border-r border-white/5 h-full">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to explore archives..."
                className="w-full bg-transparent text-fluid-md font-serif italic text-white placeholder:text-white/10 focus:outline-none mb-12"
              />

              <div className="flex-1 overflow-y-auto space-y-12 pb-24 pr-4 custom-scrollbar">
                {isLoading && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 animate-pulse">Scanning metadata...</p>
                )}

                {/* Found Authors */}
                {authors.length > 0 && (
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2 mb-6">Found Identities</p>
                    <div className="space-y-6">
                      {authors.map((author, i) => (
                        <Link
                          key={author.id}
                          href={`/author/${author.slug}`}
                          onClick={onClose}
                          onMouseEnter={() => setFocusedIndex({ type: 'author', id: author.id })}
                          className="block group"
                        >
                          <div className="flex items-baseline gap-4">
                            <span className="text-[8px] font-sans opacity-20 group-hover:opacity-100 transition-opacity">ID:0{i+1}</span>
                            <p className="font-serif text-2xl italic group-hover:translate-x-2 transition-transform duration-500">
                              {author.name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Found Quotes */}
                {quotes.length > 0 && (
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2 mb-6">Found Records</p>
                    <div className="space-y-8">
                      {quotes.map((quote, i) => (
                        <Link
                          key={quote.id}
                          href={`/quote/${quote.slug}`}
                          onClick={onClose}
                          onMouseEnter={() => setFocusedIndex({ type: 'quote', id: quote.id })}
                          className="block group max-w-md"
                        >
                          <div className="flex gap-4">
                            <span className="text-[8px] font-sans opacity-20 mt-1.5 shrink-0">REF:0{i+1}</span>
                            <div>
                              <p className="font-serif italic text-lg opacity-60 group-hover:opacity-100 transition-all duration-500 leading-tight line-clamp-2">
                                &ldquo;{quote.text}&rdquo;
                              </p>
                              <p className="text-[10px] uppercase tracking-[0.1em] text-white/30 mt-2 font-sans">{quote.author?.name}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {query && !isLoading && authors.length === 0 && quotes.length === 0 && (
                  <p className="text-fluid-sm font-serif italic text-white/20">Zero matches found in current parameters.</p>
                )}
              </div>
            </div>

            {/* Right: Architectural Preview */}
            <div className="hidden md:flex w-1/2 bg-[#050505] items-center justify-center p-20 relative overflow-hidden">
               <AnimatePresence mode="wait">
                 {focusedIndex ? (
                   <motion.div
                     key={focusedIndex.id}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.02 }}
                     transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                     className="w-full relative z-10"
                   >
                     {focusedIndex.type === 'author' ? (
                       <div className="text-center group">
                          <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-4 animate-fade-in">Identity Preview</p>
                          {focusedAuthor?.image_url && (
                             <div className="relative w-32 h-32 mx-auto mb-6 rounded-none overflow-hidden grayscale contrast-125 border border-white/10 group-hover:border-white/30 transition-colors duration-500">
                                <Image
                                   src={focusedAuthor.image_url}
                                   alt={`${focusedAuthor.name} portrait`}
                                   fill
                                   sizes="128px"
                                   className="object-cover"
                                />
                             </div>
                          )}
                          <h2 className="text-fluid-lg font-serif italic mb-2">{focusedAuthor?.name}</h2>
                          <p className="text-white/40 font-sans tracking-widest text-[10px] uppercase">{focusedAuthor?.profession}</p>
                       </div>
                     ) : (
                       <div className="max-w-md mx-auto relative p-12 border border-white/10">
                          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 blur-xl" />
                          <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-8">Record Preview</p>
                          <p className="text-fluid-sm font-serif italic leading-snug mb-8">&ldquo;{focusedQuote?.text}&rdquo;</p>
                          <p className="text-xs font-sans tracking-widest uppercase opacity-40">— {quotes.find(q => q.id === focusedIndex.id)?.author?.name}</p>
                       </div>
                     )}
                   </motion.div>
                 ) : (
                   <div className="text-[10px] uppercase tracking-[1em] text-white/5 whitespace-nowrap -rotate-90 origin-center">
                     Waiting for index selection
                   </div>
                 )}
               </AnimatePresence>
               
               {/* Ambient decorative depth */}
               <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
