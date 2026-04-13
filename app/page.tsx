import HeroSection from '@/components/sections/HeroSection';
import HorizontalScroll from '@/components/sections/HorizontalScroll';
import QuoteOfTheDay from '@/components/sections/QuoteOfTheDay';
import MasonryGrid from '@/components/sections/MasonryGrid';
import QuoteCard from '@/components/cards/QuoteCard';
import Footer from '@/components/layout/Footer';
import AnimatedUnderline from '@/components/ui/AnimatedUnderline';
import { getFeaturedAuthors, getFeaturedQuotes, getQuoteOfTheDay, getAllQuotes } from '@/lib/data';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const [featuredAuthors, featuredQuotes, quoteOfDay, trendingQuotes] = await Promise.all([
    getFeaturedAuthors(10),
    getFeaturedQuotes(6),
    getQuoteOfTheDay(),
    getAllQuotes(12),
  ]);

  // Use trending or featured quotes for the masonry grid
  const gridQuotes = featuredQuotes.length > 0 ? featuredQuotes : trendingQuotes.slice(0, 9);

  return (
    <>
      {/* 1. Cinematic Hero */}
      <HeroSection />

      {/* 2. Horizontal scroll — Featured Authors */}
      {featuredAuthors.length > 0 && (
        <HorizontalScroll authors={featuredAuthors} title="Featured Authors" />
      )}

      {/* 3. Quote of the Day */}
      <QuoteOfTheDay quote={quoteOfDay} />

      {/* 4. Trending quotes masonry grid */}
      <section className="px-6 md:px-10 py-24">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans">
            Trending Quotes
          </p>
        </div>

        <MasonryGrid>
          {gridQuotes.map((quote, i) => (
            <QuoteCard key={quote.id} quote={quote} index={i} />
          ))}
        </MasonryGrid>

        {/* Explore CTA */}
        <div className="text-center mt-16">
          <AnimatedUnderline
            href="/explore"
            className="text-sm uppercase tracking-[0.2em] font-sans text-secondary hover:text-white transition-colors"
          >
            Explore All Quotes →
          </AnimatedUnderline>
        </div>
      </section>

      <Footer />
    </>
  );
}
