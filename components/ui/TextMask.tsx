'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface TextMaskProps {
  children: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  centered?: boolean;
}

export default function TextMask({
  children,
  className = '',
  delay = 0,
  as: Tag = 'h1',
  centered = false,
}: TextMaskProps) {
  const words = children.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariant: Variants = {
    hidden: {
      y: '100%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // The Variants type will handle the ease array correctly
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      <Tag className={`flex flex-wrap ${centered ? 'justify-center text-center' : ''}`}>
        {words.map((word, i) => (
          <span key={i} className="overflow-hidden inline-block mr-[0.15em] pr-[0.15em] pb-[0.1em]">
            <motion.span variants={wordVariant} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </Tag>
    </motion.div>
  );
}

/* Simpler variant for single-line reveals */
export function RevealText({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
