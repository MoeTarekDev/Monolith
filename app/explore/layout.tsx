import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Quotes & Authors',
  description: 'Browse our curated collection of timeless quotes from history\'s greatest minds. Filter by category, sort by popularity, and discover new favorites.',
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
