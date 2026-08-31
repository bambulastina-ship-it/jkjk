/**
 * Hero. The Ink Garden ASCII canvas is the full-bleed background; everything
 * else is type over it.
 *
 * Layering, back to front:
 *   1. a dark ground (also the poster if the canvas never initialises),
 *   2. the animated ASCII canvas,
 *   3. a scrim that keeps the headline at AAA contrast over a moving image,
 *   4. the content.
 */

import AsciiEffect from './AsciiEffect';
import { ArrowIcon, PhoneIcon, PinIcon, StarIcon } from './Icons';
import { BUSINESS, DIRECTIONS_URL, HOURS_SUMMARY, RATINGS } from '@/lib/content';

export default function Hero() {
  const google = RATINGS[0];

  return (
    <section
      id="top"
      className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink"
    >
      {/* 2 — the effect. Mounted client-side; it fades itself in on decode. */}
      <AsciiEffect
        src="/img/daisy-hero.webp"
        alt="A daisy in bloom, lit from one side against a dark garden background."
        className="absolute inset-0 -z-10"
      />

      {/* 3 — scrim, in two layers. The headline overlaps the bloom's bright
          petals, so a single soft gradient is not enough to hold contrast:
          a vertical ramp darkens the lower half where the type sits, and a
          horizontal ramp darkens the left column the type is set in. Together
          they keep the h1 well above 4.5:1 wherever the animation happens to
          be in its cycle. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-ink)_0%,color-mix(in_srgb,var(--color-ink)_94%,transparent)_38%,color-mix(in_srgb,var(--color-ink)_55%,transparent)_72%,color-mix(in_srgb,var(--color-ink)_28%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-ink)_72%,transparent)_0%,color-mix(in_srgb,var(--color-ink)_35%,transparent)_45%,transparent_75%)]"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24">
        <p className="eyebrow text-ochre-glow">
          Colorado&nbsp;Springs · {BUSINESS.center}
        </p>

        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.95] text-bone">
          Daisy Nails
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone-dim sm:text-xl">
          A family-run nail salon where the work is careful, the room is calm and
          the prices are fair. Walk in, or call ahead — both are welcome.
        </p>

        {/* Primary actions. Call first: on a phone, that is the conversion. */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={BUSINESS.phoneHref}
            className="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-bone px-8 text-base font-medium text-ink transition-colors hover:bg-white"
          >
            <PhoneIcon width={18} height={18} />
            Call to book · {BUSINESS.phone}
          </a>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-bone/35 px-8 text-base font-medium text-bone transition-colors hover:border-bone/70 hover:bg-bone/10"
          >
            <PinIcon width={18} height={18} />
            Get directions
            <ArrowIcon
              width={16}
              height={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* Social proof + hours, on one quiet line. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bone/15 pt-6 text-sm text-bone-dim">
          <span className="flex items-center gap-2">
            <StarIcon width={15} height={15} className="text-ochre-glow" />
            <strong className="font-medium text-bone">{google.score}★</strong>
            <span>
              {google.count} {google.source} {google.unit}
            </span>
          </span>
          <span className="hidden h-4 w-px bg-bone/20 sm:block" aria-hidden="true" />
          <span>{HOURS_SUMMARY}</span>
        </div>
      </div>
    </section>
  );
}
