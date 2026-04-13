'use client';

import { motion } from 'framer-motion';
import TextMask from '@/components/ui/TextMask';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 md:py-24">
      {/* Blurred background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl">
        <TextMask
          className="text-fluid-hero font-serif italic uppercase tracking-tight leading-[0.85] w-full"
          delay={0.3}
          centered
        >
          Words That Moved The World
        </TextMask>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-secondary text-sm md:text-base font-sans tracking-wide max-w-md mx-auto"
        >
          A cinematic collection of timeless quotes from history&apos;s greatest minds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-12"
        >
          <a
            href="/explore"
            className="animated-underline text-xs uppercase tracking-[0.2em] font-sans text-secondary hover:text-white transition-colors duration-300"
          >
            Explore Collection →
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-12 bg-white/30"
        />
      </motion.div>
    </section>
  );
}
