/**
 * Featured work — two boxed pictures sitting directly beneath the hero.
 *
 * These are LINKS into the gallery, not a second gallery. A local salon has to
 * show the work early, but dropping the whole grid above the fold buries the
 * phone number and the opening copy. Two boxes answer "is this any good?" in a
 * glance and hand anyone who wants more straight to #gallery.
 *
 * Blending with the rest of the page: it reuses the established section
 * furniture — the mono eyebrow with its fading ochre rule, `rounded-sm` on a
 * `border-line` frame, and the exact hover transform the gallery tiles use — and
 * sits on the `paper` ground so the page keeps alternating paper/bone rather
 * than running two identical sections together.
 */

import Image from 'next/image';
import Reveal from './Reveal';
import { FEATURED } from '@/lib/content';
import { ArrowIcon } from './Icons';

export default function Featured() {
  return (
    <section className="bg-paper pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ochre-ink">
              <span className="h-px w-8 rule-fade" aria-hidden="true" />
              Recent work
            </p>
            <h2 className="mt-5 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] text-ink">
              Chrome, crystal and a steady hand.
            </h2>
            <p className="mt-4 max-w-sm text-muted">
              Bring a picture or an idea — nail art, ombré, dip or a clean classic
              finish. We will tell you honestly what will last.
            </p>
            <a
              href="#gallery"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ochre"
            >
              See the full gallery
              <ArrowIcon
                width={16}
                height={16}
                className="text-ochre-ink transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {FEATURED.map((item, i) => (
              <Reveal
                key={item.src}
                delay={i * 110}
                // The second box drops half a step on desktop — an editorial
                // stagger that stops the pair reading as a flat two-up block.
                className={i === 1 ? 'lg:translate-y-8' : undefined}
              >
                <a
                  href="#gallery"
                  aria-label={`${item.caption} — see the full gallery`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-sm border border-line bg-bone">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={900}
                      height={1125}
                      sizes="(min-width: 1024px) 28vw, 45vw"
                      className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="eyebrow mt-3 text-muted transition-colors group-hover:text-ink">
                    {item.caption}
                  </p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
