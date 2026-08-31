/**
 * Footer. Repeats the NAP block, because it is the thing people scroll to the
 * bottom looking for, and because a consistent name/address/phone in the
 * footer is what local search expects.
 */

import {
  BUSINESS,
  DIRECTIONS_URL,
  HOURS_SUMMARY,
  NAV_LINKS,
} from '@/lib/content';
import { DaisyMark, FacebookIcon, PhoneIcon, PinIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="on-dark bg-ink text-bone-dim">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <span className="flex items-center gap-2.5 text-bone">
              <DaisyMark width={26} height={26} className="text-ochre-glow" />
              <span className="font-display text-2xl">{BUSINESS.name}</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {BUSINESS.tagline} Walk-ins welcome, appointments appreciated.
            </p>
            <a
              href={BUSINESS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-bone-dim transition-colors hover:text-bone"
            >
              <FacebookIcon width={18} height={18} />
              Daisy Nails on Facebook
            </a>
          </div>

          <div>
            <h2 className="eyebrow text-bone">Visit</h2>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex min-h-11 gap-2.5 py-1 text-sm transition-colors hover:text-bone"
            >
              <PinIcon width={17} height={17} className="mt-0.5 shrink-0" />
              <address className="not-italic">
                {BUSINESS.street}
                <br />
                {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
              </address>
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 inline-flex min-h-11 items-center gap-2.5 text-sm transition-colors hover:text-bone"
            >
              <PhoneIcon width={17} height={17} />
              {BUSINESS.phone}
            </a>
            <p className="mt-4 text-sm">{HOURS_SUMMARY}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow text-bone">Explore</h2>
            <ul className="mt-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="flex min-h-11 items-center text-sm transition-colors hover:text-bone"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-bone/10 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p>{BUSINESS.center} · {BUSINESS.city}, {BUSINESS.state}</p>
        </div>
      </div>
    </footer>
  );
}
