'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Author } from '@/lib/data';

interface AuthorPosterProps {
  author: Author;
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
      <Link href={`/author/${author.slug}`} className="block">
        <div className="author-poster group">
          {/* Author image */}
          {author.image_url ? (
            <Image
              src={author.image_url}
              alt={author.name}
              fill
              sizes="(max-width: 768px) 80vw, 350px"
              className="object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-600"
            />
          ) : (
            <div className="w-full h-full bg-grey-light flex items-center justify-center">
              <span className="text-fluid-lg font-serif italic text-white/10">
                {author.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="poster-overlay">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="transform transition-all duration-500"
            >
              <p className="font-serif italic text-lg md:text-xl text-white">
                {author.name}
              </p>
              <p className="text-xs text-secondary font-sans mt-1">
                {author.quote_count} quotes
              </p>
            </motion.div>
          </div>

          {/* Always-visible name at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="font-serif italic text-white text-sm md:text-base blend-difference">
              {author.name}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
