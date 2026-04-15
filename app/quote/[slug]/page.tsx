import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getQuoteBySlug, getRelatedQuotes, getQuoteSlugs } from '@/lib/data';
import TextMask from '@/components/ui/TextMask';
import QuoteCard from '@/components/cards/QuoteCard';
import MasonryGrid from '@/components/sections/MasonryGrid';
import Footer from '@/components/layout/Footer';
import ShareActions from '@/components/ui/ShareActions';
import { RevealText } from '@/components/ui/TextMask';

interface QuotePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getQuoteSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug);
  if (!quote) return { title: 'Quote Not Found' };

  const authorName = quote.author?.name || 'Unknown';
  return {
    title: `"${quote.text.slice(0, 60)}..." — ${authorName}`,
    description: `${quote.text} — ${authorName}`,
  };
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug);

  if (!quote) notFound();

  const authorName = quote.author?.name || 'Unknown';
  const relatedQuotes = await getRelatedQuotes(quote.slug, quote.category, 6);

  return (
    <>
      {/* JSON-LD for Quote */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Quotation',
            text: quote.text,
            creator: {
              '@type': 'Person',
              name: authorName,
            },
            url: `https://monolith.quotes/quote/${quote.slug}`,
          }),
        }}
      />
      {/* 1. Full-viewport quote */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-10 py-24">
        <div className="max-w-4xl text-center">
          <TextMask
            className="text-fluid-lg font-serif italic leading-tight w-full"
            delay={0.3}
            as="h1"
            centered
          >
            {quote.text}
          </TextMask>

          <RevealText delay={0.8} className="mt-10">
            <Link
              href={`/author/${quote.author?.slug || ''}`}
              className="animated-underline text-secondary text-sm font-sans"
            >
              — {authorName}
            </Link>
          </RevealText>

          <RevealText delay={1.2} className="mt-16 w-full flex justify-center">
            <ShareActions quote={quote} />
          </RevealText>
        </div>
      </section>



      {/* 3. Author mini card */}
      {quote.author && (
        <section className="px-6 md:px-10 pb-24">
          <Link href={`/author/${quote.author.slug}`} className="block">
            <div className="quote-card max-w-md group">
              <p className="text-xs uppercase tracking-[0.15em] text-secondary font-sans mb-3">
                About the Author
              </p>
              <p className="font-serif italic text-xl mb-2">
                {quote.author.name}
              </p>
              <p className="text-secondary text-sm font-sans">
                {quote.author.profession}
                {quote.author.nationality && ` · ${quote.author.nationality}`}
              </p>
              <p className="text-secondary text-xs font-sans mt-2">
                {quote.author.quote_count} quotes →
              </p>
            </div>
          </Link>
        </section>
      )}

      {/* 4. Related quotes */}
      {relatedQuotes.length > 0 && (
        <section className="px-6 md:px-10 pb-24">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans">
              Related Quotes
            </p>
          </div>
          <MasonryGrid>
            {relatedQuotes.map((q, i) => (
              <QuoteCard key={q.id} quote={q} index={i} />
            ))}
          </MasonryGrid>
        </section>
      )}

      <Footer />
    </>
  );
}
