'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AuthorPoster from '@/components/cards/AuthorPoster';
import type { Author } from '@/lib/data';

interface HorizontalScrollProps {
  authors: Author[];
  title?: string;
}

export default function HorizontalScroll({ authors, title = 'Featured Authors' }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);

  return (
    <section ref={containerRef} className="py-24 md:py-32 overflow-hidden">
      {/* Section title */}
      <div className="px-6 md:px-10 mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans">
          {title}
        </p>
      </div>

      {/* Horizontal scroll track */}
      <motion.div
        style={{ x }}
        className="flex gap-4 md:gap-6 px-6 md:px-10"
      >
        {authors.map((author, i) => (
          <div
            key={author.slug}
            className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[350px]"
          >
            <AuthorPoster author={author} index={i} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
