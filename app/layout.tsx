import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import LenisProvider from '@/components/providers/LenisProvider';
import ScrollToTop from '@/components/providers/ScrollToTop';
import Navigation from '@/components/layout/Navigation';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Monolith — Words That Moved The World',
    template: '%s — Monolith',
  },
  description:
    'Discover timeless quotes from history\'s greatest minds. A cinematic, beautifully curated collection of words that inspire, provoke, and endure.',
  keywords: ['quotes', 'famous quotes', 'inspirational quotes', 'authors', 'literature'],
  openGraph: {
    title: 'Monolith — Words That Moved The World',
    description:
      'Discover timeless quotes from history\'s greatest minds.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monolith',
    description:
      'Discover timeless quotes from history\'s greatest minds.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable}`}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,400i,700i&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <LenisProvider>
          <ScrollToTop />
          <Navigation />
          <main>{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
