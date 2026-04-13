import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthorBySlug, getQuotesByAuthor, getRelatedAuthors, getAuthorSlugs } from '@/lib/data';
import FluidHeading from '@/components/ui/FluidHeading';
import QuoteCard from '@/components/cards/QuoteCard';
import MasonryGrid from '@/components/sections/MasonryGrid';
import HorizontalScroll from '@/components/sections/HorizontalScroll';
import Footer from '@/components/layout/Footer';
import { RevealText } from '@/components/ui/TextMask';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: 'Author Not Found' };

  return {
    title: `${author.name} Quotes`,
    description: author.bio || `Discover the most inspiring quotes by ${author.name}.`,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const [quotes, relatedAuthors] = await Promise.all([
    getQuotesByAuthor(author.id),
    getRelatedAuthors(author.slug, 8),
  ]);

  const facts = [
    author.born && { label: 'Born', value: author.born },
    author.died && { label: 'Died', value: author.died },
    author.profession && { label: 'Profession', value: author.profession },
    author.nationality && { label: 'Nationality', value: author.nationality },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {/* 1. Full-bleed portrait hero */}
      <section className="relative h-[70vh] overflow-hidden">
        {author.cover_image_url ? (
          <Image
            src={author.cover_image_url}
            alt={author.name}
            fill
            priority
            className="object-cover grayscale contrast-125"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-grey-light" />
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Name overlay */}
        <div className="absolute bottom-8 left-0 right-0 px-6 md:px-10">
          <div className="blend-difference">
            <FluidHeading size="xl" className="text-white">
              {author.name}
            </FluidHeading>
          </div>
          <p className="text-secondary text-sm font-sans mt-4">
            {author.quote_count} quotes
          </p>
        </div>
      </section>

      {/* 2. Bio + facts */}
      <section className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-3xl">
          {/* Bio */}
          {author.bio && (
            <RevealText>
              <p className="font-serif italic text-fluid-sm leading-relaxed text-white/80">
                {author.bio}
              </p>
            </RevealText>
          )}

          {/* Fact row */}
          {facts.length > 0 && (
            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-white/10">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <p className="text-xs uppercase tracking-[0.15em] text-secondary font-sans mb-1">
                    {fact.label}
                  </p>
                  <p className="text-sm font-sans">{fact.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Quotes masonry grid */}
      <section className="px-6 md:px-10 pb-24">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans">
            Quotes by {author.name}
          </p>
        </div>

        <MasonryGrid>
          {quotes.map((quote, i) => (
            <QuoteCard key={quote.id} quote={quote} index={i} />
          ))}
        </MasonryGrid>
      </section>

      {/* 4. Related authors */}
      {relatedAuthors.length > 0 && (
        <HorizontalScroll authors={relatedAuthors} title="Related Authors" />
      )}

      <Footer />
    </>
  );
}
