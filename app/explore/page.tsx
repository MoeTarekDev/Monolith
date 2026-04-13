'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import FluidHeading from '@/components/ui/FluidHeading';
import QuoteCard from '@/components/cards/QuoteCard';
import AuthorPoster from '@/components/cards/AuthorPoster';
import MasonryGrid from '@/components/sections/MasonryGrid';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import type { Quote, Author } from '@/lib/data';
import { formatCategory } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 18;

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const categoryParam = searchParams.get('category');

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'az'>('popular');
  const [isAuthorsView, setIsAuthorsView] = useState(viewParam === 'authors');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Sync URL params to state when navigating from layout links
  useEffect(() => {
    if (viewParam === 'authors') setIsAuthorsView(true);
    else setIsAuthorsView(false);
  }, [viewParam]);

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('quotes')
        .select('category')
        .not('category', 'is', null);
      if (data) {
        const unique = [...new Set(data.map((q) => q.category).filter(Boolean))] as string[];
        setCategories(unique.sort());
      }
    }
    fetchCategories();
  }, []);

  // Fetch quotes
  const fetchQuotes = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    let query = supabase
      .from('quotes')
      .select('*, author:authors(*)');

    if (activeCategory) {
      query = query.eq('category', activeCategory);
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'az') {
      query = query.order('text', { ascending: true });
    } else {
      query = query.order('is_featured', { ascending: false });
    }

    query = query.range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

    const { data } = await query;
    if (data) {
      if (reset) {
        setQuotes(data);
      } else {
        setQuotes((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === ITEMS_PER_PAGE);
    }
    setLoading(false);
  }, [activeCategory, sortBy]);

  // Fetch authors
  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('authors').select('*');

    if (sortBy === 'az') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('quote_count', { ascending: false });
    }

    const { data } = await query.limit(300);
    if (data) setAuthors(data);
    setLoading(false);
  }, [sortBy]);

  useEffect(() => {
    if (isAuthorsView) {
      fetchAuthors();
    } else {
      setPage(0);
      fetchQuotes(0, true);
    }
  }, [isAuthorsView, activeCategory, sortBy, fetchQuotes, fetchAuthors]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuotes(nextPage);
  };

  return (
    <>
      <section className="pt-32 pb-16 px-6 md:px-10">
        {/* Giant heading */}
        <FluidHeading size="hero" blend className="mb-16">
          {isAuthorsView ? 'Authors' : 'Explore'}
        </FluidHeading>

        {/* View toggle + filters */}
        <div className="flex flex-wrap items-center gap-6 mb-12">
          {/* View toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsAuthorsView(false)}
              className={`text-xs uppercase tracking-[0.15em] font-sans transition-opacity cursor-pointer ${
                !isAuthorsView ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              Quotes
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => setIsAuthorsView(true)}
              className={`text-xs uppercase tracking-[0.15em] font-sans transition-opacity cursor-pointer ${
                isAuthorsView ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              Authors
            </button>
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* Sort */}
          <div className="flex gap-4">
            {(['popular', 'newest', 'az'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`text-xs uppercase tracking-[0.15em] font-sans transition-opacity cursor-pointer ${
                  sortBy === sort ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                {sort === 'az' ? 'A-Z' : sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter pills (quotes view only) */}
        {!isAuthorsView && categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-12">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs font-sans px-3 py-1.5 border transition-all duration-300 cursor-pointer ${
                !activeCategory
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-secondary hover:text-white hover:border-white/30'
              }`}
            >
              All
            </button>
            {categories.slice(0, 20).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`text-xs font-sans px-3 py-1.5 border transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-secondary hover:text-white hover:border-white/30'
                }`}
              >
                {formatCategory(cat)}
              </button>
            ))}
          </div>
        )}

        {/* Content grid */}
        {loading && quotes.length === 0 && authors.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-secondary text-sm font-sans">Loading...</p>
          </div>
        ) : isAuthorsView ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {authors.map((author, i) => (
              <AuthorPoster key={author.slug} author={author} index={i} />
            ))}
          </div>
        ) : (
          <>
            <MasonryGrid>
              {quotes.map((quote, i) => (
                <QuoteCard key={quote.id} quote={quote} index={i} />
              ))}
            </MasonryGrid>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-16">
                <motion.button
                  onClick={loadMore}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs uppercase tracking-[0.2em] font-sans text-secondary hover:text-white transition-colors animated-underline cursor-pointer"
                >
                  Load More
                </motion.button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </>
  );
}
