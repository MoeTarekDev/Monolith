'use client';

import Link from 'next/link';

interface AnimatedUnderlineProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export default function AnimatedUnderline({
  href,
  children,
  className = '',
  external = false,
}: AnimatedUnderlineProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`animated-underline ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`animated-underline ${className}`}>
      {children}
    </Link>
  );
}
