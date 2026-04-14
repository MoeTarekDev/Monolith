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
    author.profession && { label: 'Identity', value: author.profession },
    author.nationality && { label: 'Origin', value: author.nationality },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <main className="min-h-screen bg-black">
        {/* 1. Asymmetrical Editorial Hero */}
        <section className="relative min-h-[90vh] flex flex-col md:flex-row items-stretch pt-24">
          {/* Portrait Column */}
          <div className="w-full md:w-5/12 relative min-h-[60vh] md:min-h-0 order-2 md:order-1">
            <div className="absolute inset-x-6 md:inset-x-10 inset-y-0 overflow-hidden border border-white/10">
              {author.cover_image_url ? (
                <Image
                  src={author.cover_image_url}
                  alt={author.name}
                  fill
                  priority
                  className="object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-[2000ms]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="w-full h-full bg-grey" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>

          {/* Name & Title Column */}
          <div className="w-full md:w-7/12 flex flex-col justify-end p-6 md:p-20 order-1 md:order-2">
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 block mb-6 animate-slide-up">
                Record Entry: {author.slug.toUpperCase()}
              </span>
              <FluidHeading size="xl" className="font-serif italic leading-[0.85] text-white mb-6">
                {author.name}
              </FluidHeading>
              <div className="h-px w-24 bg-white/20 mb-8" />
              <p className="max-w-md font-serif italic text-fluid-sm text-secondary leading-relaxed">
                {author.bio?.split('.')[0]}.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Structured Narrative Section */}
        <section className="px-6 md:px-10 py-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/5 bg-grey/30">
          <div className="md:col-span-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-12">Historical Narrative</p>
            <div className="space-y-8 max-w-2xl">
              {author.bio ? (
                author.bio.split('. ').map((para, i) => (
                  <p key={i} className="font-serif italic text-xl md:text-2xl text-white/80 leading-relaxed indent-8 first:indent-0">
                    {para}.
                  </p>
                ))
              ) : (
                <p className="font-serif italic text-xl text-white/40">No biographical record found for this entry.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-5">
             <div className="sticky top-32">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-8 px-6">Identity Parameters</p>
                {/* Architectural Fact Grid */}
                <div className="grid grid-cols-2 border border-white/10">
                   {facts.map((fact, i) => (
                     <div 
                       key={fact.label} 
                       className={`p-6 border-white/10 ${i % 2 === 0 ? 'border-r' : ''} ${i < facts.length - 2 ? 'border-b' : ''}`}
                     >
                       <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 block mb-2">{fact.label}</span>
                       <span className="text-sm font-sans font-bold tracking-wider">{fact.value}</span>
                     </div>
                   ))}
                   {/* Empty spots to fill grid if needed */}
                   {[...Array(facts.length % 2 === 0 ? 0 : 1)].map((_, i) => (
                     <div key={i} className="p-6 border-white/10" />
                   ))}
                </div>
                
                <div className="mt-12 p-10 border border-white/5 bg-white/[0.02]">
                   <p className="text-[8px] uppercase tracking-[0.5em] text-white/30 mb-4 text-center">Cataloged Influence</p>
                   <div className="text-center">
                      <span className="text-fluid-md font-serif italic">{author.quote_count}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-3">Recorded Indices</span>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* 3. Archives Masonry */}
        <section className="px-6 md:px-10 pb-32">
          <div className="py-12 border-b border-white/5 mb-20 flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">Accessed Archives</p>
              <h3 className="font-serif italic text-fluid-sm text-white">Curated Collection</h3>
            </div>
          </div>

          <div className="masonry-grid">
            {quotes.map((quote, i) => (
              <QuoteCard key={quote.id} quote={quote} index={i} />
            ))}
          </div>
        </section>

        {/* 4. Cross-Reference (Related Authors) */}
        {relatedAuthors.length > 0 && (
          <div className="border-t border-white/5">
            <HorizontalScroll authors={relatedAuthors} title="Cross-References" />
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

