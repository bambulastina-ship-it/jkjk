/**
 * Location & hours. Everything a "nail salon near me" search needs, one tap
 * from actionable: the address opens directions, the phone number dials, and
 * today's row in the hours table is marked so the answer to "are they open?"
 * is available at a glance.
 */

import Reveal from './Reveal';
import {
  ADDRESS_LINE,
  BUSINESS,
  DIRECTIONS_URL,
  HOURS,
  MAP_EMBED_URL,
  formatTime,
} from '@/lib/content';
import { ArrowIcon, ClockIcon, PhoneIcon, PinIcon } from './Icons';

export default function Location() {
  return (
    <section id="visit" className="section-y bg-paper">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ochre-ink">
            <span className="h-px w-8 rule-fade" aria-hidden="true" />
            Visit us
          </p>
          <h2 className="mt-6 max-w-xl font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-ink">
            Walk-ins welcome. Appointments appreciated.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* --- Details --- */}
          <Reveal className="order-2 lg:order-1">
            <dl className="space-y-8">
              <div className="flex gap-4">
                <PinIcon className="mt-1 shrink-0 text-ochre" />
                <div>
                  <dt className="eyebrow text-muted">Address</dt>
                  <dd className="mt-2">
                    <a
                      href={DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-11 flex-wrap items-center gap-x-2 py-1 text-lg text-ink"
                    >
                      <address className="not-italic">
                        {BUSINESS.street}
                        <br />
                        {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
                      </address>
                      <ArrowIcon
                        width={16}
                        height={16}
                        className="text-ochre-ink transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </a>
                    <p className="mt-2 text-sm text-muted">
                      In the {BUSINESS.center} strip, on the northwest side of town.
                    </p>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4">
                <PhoneIcon className="mt-1 shrink-0 text-ochre" />
                <div>
                  <dt className="eyebrow text-muted">Phone</dt>
                  <dd className="mt-2">
                    <a
                      href={BUSINESS.phoneHref}
                      className="inline-flex min-h-11 items-center text-lg text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ochre"
                    >
                      {BUSINESS.phone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4">
                <ClockIcon className="mt-1 shrink-0 text-ochre" />
                <div className="min-w-0 flex-1">
                  <dt className="eyebrow text-muted">Hours</dt>
                  <dd className="mt-3">
                    <HoursTable />
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-medium text-bone transition-colors hover:bg-ink-soft"
              >
                <PhoneIcon width={18} height={18} />
                Call {BUSINESS.phone}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-line px-7 text-base font-medium text-ink transition-colors hover:border-ink"
              >
                <PinIcon width={18} height={18} />
                Directions
              </a>
            </div>
          </Reveal>

          {/* --- Map --- */}
          <Reveal delay={100} className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-sm border border-line bg-bone">
              {/* Keyless embed. `loading="lazy"` keeps the third-party frame off
                  the critical path — it is well below the fold. */}
              <iframe
                src={MAP_EMBED_URL}
                title={`Map showing ${BUSINESS.name} at ${ADDRESS_LINE}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[380px] w-full border-0 lg:h-[520px]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Hours table. Rows are grouped visually, but each day gets its own row so the
 * markup stays unambiguous. Today is marked with text ("Today"), not colour
 * alone.
 */
function HoursTable() {
  return (
    <table className="w-full max-w-sm border-collapse text-left">
      <caption className="sr-only">Opening hours</caption>
      <tbody>
        {HOURS.map((h) => (
          <tr key={h.day} className="border-b border-line/60 last:border-0">
            <th scope="row" className="py-2.5 pr-4 font-normal text-muted">
              {h.day}
            </th>
            <td className="py-2.5 text-right font-mono text-sm tabular-nums text-ink">
              {h.opens && h.closes
                ? `${formatTime(h.opens)} – ${formatTime(h.closes)}`
                : 'Closed'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
