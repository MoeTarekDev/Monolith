'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/lib/data';
import { truncate } from '@/lib/utils';

interface PosterLabProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

type Template = 'ARCHITECTURAL' | 'MINIMALIST' | 'BRUTALIST';
type Theme = 'OBSIDIAN' | 'PAPER';

const COLORS = {
  OBSIDIAN: { bg: '#08080a', fg: '#fcfcfd', border: '#2a2a2e' },
  PAPER: { bg: '#f4f4f2', fg: '#1a1a1c', border: '#d1d1cf' }
};

export default function PosterLab({ quote, isOpen, onClose }: PosterLabProps) {
  const [template, setTemplate] = useState<Template>('ARCHITECTURAL');
  const [theme, setTheme] = useState<Theme>('OBSIDIAN');
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWrappedText = useCallback((
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: 'center' | 'left' = 'center'
  ) => {
    const words = truncate(text, 400).split(' ');
    const lines: string[] = [];
    let currentLine = '';

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

    const startY = align === 'center' ? y - (lines.length * lineHeight) / 2 : y;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });
  }, []);

  const renderToCanvas = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isHighRes: boolean,
    activeTemplate: Template,
    activeTheme: Theme
  ) => {
    const scale = width / 1080;
    const authorName = quote.author?.name || 'Unknown';
    const activeColors = COLORS[activeTheme];

    // Reset all canvas state to prevent leaking between template switches
    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0px';

    // 1. Clear and fill background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = activeColors.bg;
    ctx.fillRect(0, 0, width, height);

    if (activeTemplate === 'ARCHITECTURAL') {
      // Frame
      ctx.strokeStyle = activeColors.border;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(60 * scale, 60 * scale, width - 120 * scale, height - 120 * scale);
      
      // Grid lines
      ctx.beginPath();
      ctx.moveTo(width / 2, 60 * scale);
      ctx.lineTo(width / 2, 120 * scale);
      ctx.moveTo(width / 2, height - 120 * scale);
      ctx.lineTo(width / 2, height - 60 * scale);
      ctx.stroke();

      // Branding
      ctx.fillStyle = activeColors.fg;
      ctx.font = `bold ${24 * scale}px sans-serif`;
      ctx.letterSpacing = '0.3em';
      ctx.textAlign = 'center';
      ctx.fillText('MONOLITH', width / 2, 140 * scale);

      // Quote text
      ctx.letterSpacing = '0px';
      ctx.font = `italic ${56 * scale}px serif`;
      drawWrappedText(ctx, quote.text, width / 2, height / 2, 800 * scale, 80 * scale);

      // Metadata
      ctx.font = `${24 * scale}px sans-serif`;
      ctx.letterSpacing = '0.1em';
      ctx.globalAlpha = 0.5;
      ctx.fillText(authorName.toUpperCase(), width / 2, height - 200 * scale);
      ctx.fillText(`INDEX N°${quote.id.slice(0, 4)}`, width / 2, height - 140 * scale);
    } 
    
    else if (activeTemplate === 'MINIMALIST') {
      ctx.fillStyle = activeColors.fg;
      ctx.textAlign = 'center';
      ctx.font = `italic ${72 * scale}px serif`;
      drawWrappedText(ctx, quote.text, width / 2, height * 0.45, 850 * scale, 100 * scale);

      ctx.font = `${28 * scale}px sans-serif`;
      ctx.letterSpacing = '0.2em';
      ctx.globalAlpha = 0.4;
      ctx.fillText(`— ${authorName}`, width / 2, height * 0.45 + 200 * scale);
    }

    else if (activeTemplate === 'BRUTALIST') {
      ctx.strokeStyle = activeColors.fg;
      ctx.lineWidth = 20 * scale;
      ctx.strokeRect(40 * scale, 40 * scale, width - 80 * scale, height - 80 * scale);

      ctx.fillStyle = activeColors.fg;
      ctx.font = `bold ${80 * scale}px sans-serif`;
      ctx.textAlign = 'left';
      drawWrappedText(ctx, quote.text.toUpperCase(), 120 * scale, 300 * scale, 840 * scale, 90 * scale, 'left');

      ctx.font = `bold ${40 * scale}px sans-serif`;
      ctx.fillText(authorName.toUpperCase(), 120 * scale, height - 150 * scale);
    }

    // Restore canvas state so nothing leaks to the next render
    ctx.restore();
  }, [quote, drawWrappedText]);

  const handleExport = useCallback(async () => {
    setIsRendering(true);
    const canvas = document.createElement('canvas');
    canvas.width = 2160; // 4K resolution
    canvas.height = 3840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pass current template and theme explicitly to avoid stale closures
    renderToCanvas(ctx, canvas.width, canvas.height, true, template, theme);

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsRendering(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `monolith-poster-${quote.slug}-${template.toLowerCase()}.png`;
      link.href = url;
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsRendering(false);
      }, 100);
    }, 'image/png', 1.0);
  }, [renderToCanvas, template, theme, quote.slug]);

  // Live preview effect
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) renderToCanvas(ctx, 1080, 1920, false, template, theme);
    }
  }, [isOpen, template, theme, quote, renderToCanvas]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex flex-col md:flex-row items-stretch"
        >
          {/* Controls Panel */}
          <div className="w-full md:w-80 border-r border-white/10 flex flex-col p-8 z-10 bg-black">
             <div className="mb-12">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 block mb-2">Facility</span>
                <h2 className="text-xl font-serif italic">Poster Laboratory</h2>
             </div>

             <div className="space-y-10 flex-1">
                {/* Template Selection */}
                <div>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-sans">Layout Template</p>
                   <div className="flex flex-col gap-2">
                      {(['ARCHITECTURAL', 'MINIMALIST', 'BRUTALIST'] as Template[]).map(t => (
                        <button 
                            key={t}
                            onClick={() => setTemplate(t)}
                            className={`text-left px-4 py-3 text-[10px] uppercase tracking-widest transition-all ${template === t ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
                        >
                           {t}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Theme Selection */}
                <div>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-sans">Palette Toning</p>
                   <div className="flex gap-2">
                      {(['OBSIDIAN', 'PAPER'] as Theme[]).map(th => (
                        <button 
                            key={th}
                            onClick={() => setTheme(th)}
                            className={`flex-1 py-3 text-[10px] uppercase tracking-widest transition-all border ${theme === th ? 'border-white bg-white text-black' : 'border-white/10 text-white/60'}`}
                        >
                           {th}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
                <button 
                    onClick={handleExport}
                    disabled={isRendering}
                    className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                   {isRendering ? 'Rendering 4K...' : 'Generate 4K Poster'}
                </button>
                <button 
                    onClick={onClose}
                    className="w-full py-4 border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-colors"
                >
                   Exit Lab
                </button>
             </div>
          </div>

          {/* Preview Canvas Panel */}
          <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#050505]">
             {/* Background Grid */}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="grid grid-cols-12 h-full gap-0">
                   {[...Array(12)].map((_, i) => <div key={i} className="border-r border-white/5 h-full" />)}
                </div>
             </div>

             <motion.div 
                layout
                className="relative aspect-[9/16] h-full max-h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-black"
                style={{ background: COLORS[theme].bg }}
             >
                <canvas 
                    ref={canvasRef} 
                    width={1080} 
                    height={1920}
                    className="w-full h-full"
                />
             </motion.div>

             <div className="absolute bottom-8 right-10 text-[10px] uppercase tracking-[0.5em] text-white/20 vertical-text hidden md:block">
                MONOLITH LAB — EXPERIMENTAL BUILD
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
