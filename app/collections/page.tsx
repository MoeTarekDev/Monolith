import Link from 'next/link';
import { getAllCollections } from '@/lib/data';
import FluidHeading from '@/components/ui/FluidHeading';
import Footer from '@/components/layout/Footer';
import { RevealText } from '@/components/ui/TextMask';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Curated collections of quotes for every mood — from hustle and grind to quotes for bad days.',
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <>
      <section className="pt-32 pb-24 px-6 md:px-10">
        <FluidHeading size="hero" blend className="mb-16">
          Collections
        </FluidHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection, i) => (
            <RevealText key={collection.id} delay={i * 0.05}>
              <Link href={`/collections/${collection.slug}`} className="block">
                <article className="quote-card group h-full">
                  <p className="font-serif italic text-xl md:text-2xl mb-4">
                    {collection.title}
                  </p>
                  {collection.description && (
                    <p className="text-secondary text-sm font-sans leading-relaxed mb-6">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 group-hover:border-black/10 transition-colors duration-500">
                    <span className="text-xs font-sans uppercase tracking-[0.15em] text-secondary">
                      View Collection
                    </span>
                    <span className="text-xs font-sans text-white/30 group-hover:text-black/60 transition-colors duration-500">
                      {collection.quote_count} {collection.quote_count === 1 ? 'quote' : 'quotes'}
                    </span>
                  </div>
                </article>
              </Link>
            </RevealText>
          ))}
        </div>

        {collections.length === 0 && (
          <div className="text-center py-24">
            <p className="text-secondary text-sm font-sans">
              Collections coming soon...
            </p>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
