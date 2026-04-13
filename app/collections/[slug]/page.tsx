import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCollectionBySlug, getCollectionQuotes, getCollectionSlugs } from '@/lib/data';
import FluidHeading from '@/components/ui/FluidHeading';
import QuoteCard from '@/components/cards/QuoteCard';
import MasonryGrid from '@/components/sections/MasonryGrid';
import Footer from '@/components/layout/Footer';
import { RevealText } from '@/components/ui/TextMask';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: 'Collection Not Found' };

  return {
    title: collection.title,
    description: collection.description || `Explore the "${collection.title}" collection.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  const quotes = await getCollectionQuotes(collection.id);

  return (
    <>
      <section className="pt-32 pb-24 px-6 md:px-10">
        <FluidHeading size="xl" className="mb-8">
          {collection.title}
        </FluidHeading>

        {collection.description && (
          <RevealText>
            <p className="text-secondary text-fluid-sm font-sans max-w-2xl mb-16 leading-relaxed">
              {collection.description}
            </p>
          </RevealText>
        )}

        <MasonryGrid>
          {quotes.map((quote, i) => (
            <QuoteCard key={quote.id} quote={quote} index={i} />
          ))}
        </MasonryGrid>

        {quotes.length === 0 && (
          <p className="text-secondary text-sm font-sans text-center py-24">
            No quotes in this collection yet.
          </p>
        )}
      </section>

      <Footer />
    </>
  );
}
