'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Quote } from '@/lib/data';
import { formatCategory, truncate } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
  index?: number;
}

export default function QuoteCard({ quote, index = 0 }: QuoteCardProps) {
  const authorName = quote.author?.name || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/quote/${quote.slug}`} className="block">
        <article className="quote-card group">
          {/* Quote text */}
          <p className="font-serif italic text-lg md:text-xl leading-relaxed mb-6">
            &ldquo;{truncate(quote.text, 200)}&rdquo;
          </p>

          {/* Category + year */}
          {quote.category && (
            <p className="text-secondary text-xs font-sans font-bold italic tracking-wide mb-3">
              {formatCategory(quote.category)}
            </p>
          )}

          {/* Author */}
          <p className="text-secondary text-sm font-sans">
            {authorName}
          </p>

          {/* Read more arrow */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 group-hover:border-black/10 transition-colors duration-500">
            <span className="text-xs font-sans uppercase tracking-[0.15em] text-secondary">
              Read more
            </span>
            <span className="card-arrow text-secondary transition-transform duration-300">
              →
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
