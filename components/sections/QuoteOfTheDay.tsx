'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import TextMask from '@/components/ui/TextMask';
import type { Quote } from '@/lib/data';

interface QuoteOfTheDayProps {
  quote: Quote | null;
}

export default function QuoteOfTheDay({ quote }: QuoteOfTheDayProps) {
  if (!quote) return null;

  const authorName = quote.author?.name || 'Unknown';

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-10 py-24">
      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-xs uppercase tracking-[0.3em] font-sans mb-12"
      >
        Quote of the Day
      </motion.p>

      {/* Quote text */}
      <div className="max-w-5xl text-center">
        <TextMask
          className="text-fluid-lg font-serif italic leading-tight w-full"
          delay={0.2}
          as="p"
          centered
        >
          {quote.text}
        </TextMask>
      </div>

      {/* Author */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 text-center"
      >
        <Link
          href={`/author/${quote.author?.slug || ''}`}
          className="animated-underline text-secondary text-sm font-sans"
        >
          — {authorName}
        </Link>
      </motion.div>
    </section>
  );
}
