/**
 * Testimonials. Laid out as a masonry column flow rather than a carousel: the
 * quotes are short, there are only eight, and a static layout means no
 * autoplay to pause, no rotation to announce and nothing hidden from search.
 *
 * Quotes are verbatim from the salon's Google and Facebook reviews, trimmed
 * for length only.
 */

import Reveal from './Reveal';
import { RATINGS, TESTIMONIALS } from '@/lib/content';
import { StarIcon } from './Icons';

export default function Testimonials() {
  return (
    <section id="reviews" className="on-dark section-y bg-moss text-bone">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-ochre-glow">
              <span className="h-px w-8 bg-ochre-glow/60" aria-hidden="true" />
              What people say
            </p>
            <h2 className="mt-6 max-w-xl font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-bone">
              Kind, careful and fairly priced.
            </h2>
          </div>

          {/* Ratings, exactly as published on each platform. */}
          <dl className="flex gap-10">
            {RATINGS.map((r) => (
              <div key={r.source}>
                <dt className="eyebrow text-bone-dim">{r.source}</dt>
                <dd className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-4xl text-bone">{r.score}</span>
                  <StarIcon width={16} height={16} className="text-ochre-glow" />
                  <span className="text-sm text-bone-dim">
                    {r.count} {r.unit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* CSS columns give a masonry flow with no JS and no fixed row heights. */}
        <div className="mt-16 gap-5 sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.quote}
              delay={Math.min(i, 5) * 60}
              className="mb-5 break-inside-avoid"
            >
              <figure className="rounded-sm border border-line-dark bg-ink/25 p-6">
                <blockquote className="font-display text-lg leading-snug text-bone">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2 text-sm text-bone-dim">
                  <span>{t.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.source}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
