import type { Metadata } from 'next';
import FluidHeading from '@/components/ui/FluidHeading';
import Footer from '@/components/layout/Footer';
import { RevealText } from '@/components/ui/TextMask';

export const metadata: Metadata = {
  title: 'About',
  description: 'Monolith is a cinematic collection of timeless quotes. Beautiful, fast, and shareable.',
};

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
        <FluidHeading size="hero" blend className="mb-24">
          About
        </FluidHeading>

        <div className="max-w-2xl">
          <RevealText>
            <p className="font-serif italic text-fluid-md leading-relaxed mb-8">
              Monolith is a monument to the power of words.
            </p>
          </RevealText>

          <RevealText delay={0.1}>
            <p className="text-secondary font-sans leading-relaxed mb-6">
              We believe the right words at the right moment can change everything — a
              perspective, a day, a life. Yet the web&apos;s largest quote collections are buried
              under ads, pop-ups, and visual noise.
            </p>
          </RevealText>

          <RevealText delay={0.2}>
            <p className="text-secondary font-sans leading-relaxed mb-6">
              Monolith strips all that away. Pure monochrome. Cinematic typography. No
              distractions. Just words — curated, beautifully presented, and designed to be
              shared.
            </p>
          </RevealText>

          <RevealText delay={0.3}>
            <p className="text-secondary font-sans leading-relaxed mb-6">
              Every author has a portrait page. Every quote can be saved as a wallpaper or
              shared as a card. The entire experience is keyboard-navigable and built for speed.
            </p>
          </RevealText>

          <RevealText delay={0.4}>
            <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans mb-6">
                Keyboard Shortcuts
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <kbd className="border border-white/20 px-2 py-1 text-xs font-sans">/</kbd>
                  <span className="text-sm text-secondary font-sans">Search</span>
                </div>
                <div className="flex items-center gap-4">
                  <kbd className="border border-white/20 px-2 py-1 text-xs font-sans">R</kbd>
                  <span className="text-sm text-secondary font-sans">Random quote</span>
                </div>
                <div className="flex items-center gap-4">
                  <kbd className="border border-white/20 px-2 py-1 text-xs font-sans">← →</kbd>
                  <span className="text-sm text-secondary font-sans">Navigate quotes</span>
                </div>
              </div>
            </div>
          </RevealText>

          <RevealText delay={0.5}>
            <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary font-sans mb-4">
                Design Principles
              </p>
              <ul className="space-y-2">
                {[
                  'Monochrome only',
                  'Cinematic scale',
                  'Editorial minimalism',
                  'Dramatic interactions',
                  'Opacity as hierarchy',
                  'Sharp geometry',
                  'Mobile-first',
                  'Performance obsessed',
                  'Shareable by default',
                  'Keyboard friendly',
                ].map((principle, i) => (
                  <li key={i} className="text-secondary text-sm font-sans flex items-center gap-3">
                    <span className="text-tertiary text-xs">{String(i + 1).padStart(2, '0')}</span>
                    {principle}
                  </li>
                ))}
              </ul>
            </div>
          </RevealText>
        </div>
      </section>

      <Footer />
    </>
  );
}
