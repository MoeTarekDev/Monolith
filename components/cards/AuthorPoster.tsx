'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { AuthorCardData } from '@/lib/data';

interface AuthorPosterProps {
  author: AuthorCardData;
  index?: number;
}

export default function AuthorPoster({ author, index = 0 }: AuthorPosterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/author/${author.slug}`}
        aria-label={`View ${author.name}`}
        className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      >
        <div className="author-poster">
          {/* Author image */}
          {author.image_url ? (
            <Image
              src={author.image_url}
              alt={author.name}
              fill
              sizes="(max-width: 768px) 80vw, 350px"
              className="object-cover grayscale contrast-125"
            />
          ) : (
            <div className="w-full h-full bg-grey-light flex items-center justify-center">
              <span className="text-fluid-lg font-serif italic text-white/10">
                {author.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/55 to-transparent">
            <p className="font-serif italic text-white text-sm md:text-base blend-difference">
              {author.name}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/60 font-sans">
              {author.quote_count} quotes
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
