'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import QuoteCard from '@/components/cards/QuoteCard';
import AuthorPoster from '@/components/cards/AuthorPoster';
import MasonryGrid from '@/components/sections/MasonryGrid';
import FluidHeading from '@/components/ui/FluidHeading';
import {
  EXPLORE_QUOTES_PAGE_SIZE,
  getExploreQuotesPage,
  type AuthorCardData,
  type ExploreSort,
  type Quote,
} from '@/lib/data';
import { formatCategory } from '@/lib/utils';

interface ExploreClientProps {
  categories: string[];
  initialAuthors: AuthorCardData[];
  initialCategory: string | null;
  initialHasMore: boolean;
  initialQuotes: Quote[];
  initialSort: ExploreSort;
  initialView: 'authors' | 'quotes';
}

const controlButtonClass =
  'text-xs uppercase tracking-[0.15em] font-sans transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black';

const pillButtonClass =
  'text-xs font-sans px-3 py-1.5 border transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black';

export default function ExploreClient({
  categories,
  initialAuthors,
  initialCategory,
  initialHasMore,
  initialQuotes,
  initialSort,
  initialView,
}: ExploreClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setQuotes(initialQuotes);
    setPage(0);
    setHasMore(initialHasMore);
    setErrorMessage(null);
  }, [initialHasMore, initialQuotes, initialCategory, initialSort, initialView]);

  const isAuthorsView = initialView === 'authors';

  const updateSearch = (updates: {
    view?: 'authors' | 'quotes';
    category?: string | null;
    sort?: ExploreSort;
  }) => {
    const nextView = updates.view ?? initialView;
    const nextCategory = updates.category !== undefined ? updates.category : initialCategory;
    const nextSort = updates.sort ?? initialSort;
    const nextParams = new URLSearchParams();

    if (nextView === 'authors') {
      nextParams.set('view', 'authors');
    }

    if (nextCategory) {
      nextParams.set('category', nextCategory);
    }

    if (nextSort !== 'popular') {
      nextParams.set('sort', nextSort);
    }

    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

    startTransition(() => {
      router.push(nextUrl);
    });
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;

    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      const nextQuotes = await getExploreQuotesPage({
        category: initialCategory,
        sortBy: initialSort,
        limit: EXPLORE_QUOTES_PAGE_SIZE,
        offset: nextPage * EXPLORE_QUOTES_PAGE_SIZE,
        throwOnError: true,
      });

      setQuotes((currentQuotes) => [...currentQuotes, ...nextQuotes]);
      setPage(nextPage);
      setHasMore(nextQuotes.length === EXPLORE_QUOTES_PAGE_SIZE);
    } catch {
      setErrorMessage('Unable to load more quotes right now. Please try again in a moment.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="pt-32 pb-16 px-6 md:px-10" aria-busy={isPending || isLoadingMore}>
      <FluidHeading size="hero" blend className="mb-16">
        {isAuthorsView ? 'Authors' : 'Explore'}
      </FluidHeading>

      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex gap-4" aria-label="View selection" role="group">
          <button
            type="button"
            aria-pressed={!isAuthorsView}
            onClick={() => updateSearch({ view: 'quotes' })}
            className={`${controlButtonClass} ${
              !isAuthorsView ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
          >
            Quotes
          </button>
          <span className="text-white/20" aria-hidden="true">
            |
          </span>
          <button
            type="button"
            aria-pressed={isAuthorsView}
            onClick={() => updateSearch({ view: 'authors' })}
            className={`${controlButtonClass} ${
              isAuthorsView ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
          >
            Authors
          </button>
        </div>

        <div className="w-px h-4 bg-white/10" aria-hidden="true" />

        <div className="flex gap-4" aria-label="Sort selection" role="group">
          {(['popular', 'newest', 'az'] as const).map((sort) => (
            <button
              key={sort}
              type="button"
              aria-pressed={initialSort === sort}
              onClick={() => updateSearch({ sort })}
              className={`${controlButtonClass} ${
                initialSort === sort ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              {sort === 'az' ? 'A-Z' : sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[1.25rem] mb-10">
        {isPending ? (
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-sans">
            Updating archive...
          </p>
        ) : isAuthorsView && initialSort === 'newest' ? (
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35 font-sans">
            Newest is a placeholder for now and currently mirrors Popular.
          </p>
        ) : null}
      </div>

      {!isAuthorsView && categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            type="button"
            aria-pressed={!initialCategory}
            onClick={() => updateSearch({ category: null })}
            className={`${pillButtonClass} ${
              !initialCategory
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-secondary hover:text-white hover:border-white/30'
            }`}
          >
            All
          </button>
          {categories.slice(0, 20).map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={initialCategory === category}
              onClick={() =>
                updateSearch({
                  category: initialCategory === category ? null : category,
                })
              }
              className={`${pillButtonClass} ${
                initialCategory === category
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-secondary hover:text-white hover:border-white/30'
              }`}
            >
              {formatCategory(category)}
            </button>
          ))}
        </div>
      )}

      {isAuthorsView ? (
        initialAuthors.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {initialAuthors.map((author, index) => (
              <AuthorPoster key={author.slug} author={author} index={index} />
            ))}
          </div>
        ) : (
          <div className="border border-white/10 px-6 py-10 text-center">
            <p className="text-sm font-sans text-white/70">No authors are available yet.</p>
          </div>
        )
      ) : quotes.length > 0 ? (
        <>
          <MasonryGrid>
            {quotes.map((quote, index) => (
              <QuoteCard key={quote.id} quote={quote} index={index} />
            ))}
          </MasonryGrid>

          {errorMessage && (
            <div className="mt-10 border border-white/10 px-5 py-4">
              <p className="text-sm font-sans text-white/70">{errorMessage}</p>
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-16">
              <motion.button
                type="button"
                onClick={handleLoadMore}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoadingMore || isPending}
                className="text-xs uppercase tracking-[0.2em] font-sans text-secondary hover:text-white transition-colors animated-underline cursor-pointer disabled:cursor-wait disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <div className="border border-white/10 px-6 py-10 text-center">
          <p className="text-sm font-sans text-white/70">
            No quotes matched the current filters.
          </p>
        </div>
      )}
    </section>
  );
}
