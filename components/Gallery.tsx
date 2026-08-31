/**
 * Gallery. A masonry-ish grid built with CSS columns so the tiles keep their
 * natural aspect ratios without a layout library.
 *
 * PLACEHOLDER IMAGERY — see lib/content.ts and the README. Every tile has an
 * explicit width/height so the browser reserves the box before decode and the
 * grid does not shift as images arrive (CLS).
 */

import Image from 'next/image';
import Reveal from './Reveal';
import { GALLERY, BUSINESS } from '@/lib/content';
import { FacebookIcon } from './Icons';

export default function Gallery() {
  return (
    <section id="gallery" className="section-y bg-bone">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-ochre-ink">
              <span className="h-px w-8 rule-fade" aria-hidden="true" />
              Our work
            </p>
            <h2 className="mt-6 max-w-xl font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-ink">
              Colour, shape and a finish that lasts.
            </h2>
          </div>
          <a
            href={BUSINESS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink sm:self-auto"
          >
            <FacebookIcon width={17} height={17} />
            More on Facebook
          </a>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GALLERY.map((img, i) => (
            <Reveal
              key={img.src}
              // Stagger down the grid, capped so late tiles are not left waiting.
              delay={Math.min(i, 5) * 70}
              className="group relative overflow-hidden rounded-sm bg-line"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={900}
                height={1125}
                sizes="(min-width: 1024px) 25vw, 50vw"
                // The first row is close to the fold on a phone; the rest can wait.
                loading={i < 2 ? 'eager' : 'lazy'}
                className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted">
          Images shown are placeholders pending photography of the salon&rsquo;s own
          work.
        </p>
      </div>
    </section>
  );
}
