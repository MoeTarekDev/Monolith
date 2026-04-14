'use client';

import { useState } from 'react';
import type { Quote } from '@/lib/data';
import { truncate } from '@/lib/utils';

interface ShareActionsProps {
  quote: Quote;
}

import PosterLab from './PosterLab';

export default function ShareActions({ quote }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const authorName = quote.author?.name || 'Unknown';
  const fullText = `"${quote.text}" — ${authorName}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Monolith — ${authorName}`,
          text: fullText,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-stretch border border-white/10 bg-grey h-auto md:h-12 overflow-hidden">
        {/* Extract Metadata (Copy) */}
        <button
          onClick={handleCopy}
          className="flex-1 px-8 py-3 md:py-0 text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-secondary hover:text-black hover:bg-white transition-all duration-300 border-b md:border-b-0 md:border-r border-white/10 text-center"
        >
          {copied ? 'Metadata Extracted' : 'Extract Metadata'}
        </button>

        {/* Share Interaction */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleShare}
            className="flex-1 px-8 py-3 md:py-0 text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-secondary hover:text-black hover:bg-white transition-all duration-300 border-b md:border-b-0 md:border-r border-white/10 text-center"
          >
            Share Entry
          </button>
        )}

        {/* Render Poster (Download) */}
        <button
          onClick={() => setIsLabOpen(true)}
          className="flex-1 px-8 py-3 md:py-0 text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-secondary hover:text-black hover:bg-white transition-all duration-300 text-center cursor-pointer"
        >
          Render Poster
        </button>
      </div>

      <PosterLab 
        quote={quote} 
        isOpen={isLabOpen} 
        onClose={() => setIsLabOpen(false)} 
      />
    </>
  );
}


