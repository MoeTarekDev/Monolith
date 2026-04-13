'use client';

import { useState } from 'react';
import type { Quote } from '@/lib/data';
import { truncate } from '@/lib/utils';

interface ShareActionsProps {
  quote: Quote;
}

export default function ShareActions({ quote }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const authorName = quote.author?.name || 'Unknown';
  const fullText = `"${quote.text}" — ${authorName}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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
          title: `Quote by ${authorName}`,
          text: fullText,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleDownload = async () => {
    // Create a simple text image for wallpaper
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1000, 1840);

    // Quote text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 42px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap
    const words = truncate(quote.text, 300).split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = 900;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 60;
    const startY = 960 - (lines.length * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(`"${i === 0 ? '' : ''}${line}${i === lines.length - 1 ? '"' : ''}`, 540, startY + i * lineHeight);
    });

    // Author name
    ctx.font = '24px sans-serif';
    ctx.globalAlpha = 0.5;
    ctx.fillText(`— ${authorName}`, 540, startY + lines.length * lineHeight + 60);

    // Download
    const link = document.createElement('a');
    link.download = `monolith-${quote.slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex items-center justify-center gap-8">
      <button
        onClick={handleCopy}
        className="animated-underline text-xs uppercase tracking-[0.15em] font-sans text-secondary hover:text-white transition-colors cursor-pointer"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleShare}
          className="animated-underline text-xs uppercase tracking-[0.15em] font-sans text-secondary hover:text-white transition-colors cursor-pointer"
        >
          Share
        </button>
      )}

      <button
        onClick={handleDownload}
        className="animated-underline text-xs uppercase tracking-[0.15em] font-sans text-secondary hover:text-white transition-colors cursor-pointer"
      >
        Download
      </button>
    </div>
  );
}
