'use client';

import { motion } from 'framer-motion';

interface FluidHeadingProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'hero' | 'xl' | 'lg' | 'md';
  blend?: boolean;
  className?: string;
  serif?: boolean;
}

export default function FluidHeading({
  children,
  as: Tag = 'h1',
  size = 'xl',
  blend = false,
  className = '',
  serif = true,
}: FluidHeadingProps) {
  const sizeClass = {
    hero: 'text-fluid-hero',
    xl: 'text-fluid-xl',
    lg: 'text-fluid-lg',
    md: 'text-fluid-md',
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={blend ? 'blend-difference' : ''}
    >
      <Tag
        className={`
          ${sizeClass}
          ${serif ? 'font-serif italic' : 'font-sans font-bold'}
          uppercase tracking-tight
          ${className}
        `}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
