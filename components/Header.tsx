'use client';

/**
 * Sticky header. Transparent over the dark hero, then swaps to the paper
 * ground once the hero has scrolled past — so the nav is always legible
 * against whatever is behind it.
 */

import { useEffect, useState } from 'react';
import { BUSINESS, NAV_LINKS } from '@/lib/content';
import { CloseIcon, DaisyMark, MenuIcon, PhoneIcon } from './Icons';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Flip once the hero is mostly behind us.
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape closes the sheet — expected for anything modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onDark = !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? 'border-b border-line bg-bone/90 backdrop-blur-md'
          : 'on-dark border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          // -my-2/py-2 grows the touch target to 44px without moving the
          // wordmark's optical position in the bar.
          className={`-my-2 flex min-h-11 items-center gap-2.5 py-2 transition-colors ${
            onDark ? 'text-bone' : 'text-ink'
          }`}
        >
          <DaisyMark
            width={26}
            height={26}
            className={onDark ? 'text-ochre-glow' : 'text-ochre'}
          />
          <span className="font-display text-xl tracking-tight">
            {BUSINESS.shortName}
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`inline-flex min-h-11 items-center text-sm transition-colors ${
                onDark
                  ? 'text-bone-dim hover:text-bone'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href={BUSINESS.phoneHref}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors ${
              onDark
                ? 'bg-bone text-ink hover:bg-white'
                : 'bg-ink text-bone hover:bg-ink-soft'
            }`}
          >
            <PhoneIcon width={16} height={16} />
            {BUSINESS.phone}
          </a>
        </nav>

        {/* Mobile: a call button always visible, plus the menu toggle. The
            phone number is the whole point of the site on a phone. */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={BUSINESS.phoneHref}
            aria-label={`Call ${BUSINESS.shortName} at ${BUSINESS.phone}`}
            className={`inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
              onDark ? 'bg-bone text-ink' : 'bg-ink text-bone'
            }`}
          >
            <PhoneIcon width={17} height={17} />
            <span>Call</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              onDark ? 'border-bone/30 text-bone' : 'border-line text-ink'
            }`}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile sheet. Always rendered so the button's `aria-controls` always
          resolves to a real element; visibility is the `hidden` attribute.
          Note the display utility (`flex`) is applied ONLY when open — a
          `display` class would otherwise beat Tailwind's zero-specificity
          `[hidden]` rule and the sheet would never actually hide. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className={`fixed inset-0 top-0 z-50 flex-col bg-bone md:hidden ${
          open ? 'flex' : ''
        }`}
      >
          <div className="flex h-20 items-center justify-between px-5">
            <span className="flex items-center gap-2.5 text-ink">
              <DaisyMark width={26} height={26} className="text-ochre" />
              <span className="font-display text-xl">{BUSINESS.shortName}</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink"
            >
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-5 pt-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-display text-3xl text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto p-5">
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-base font-medium text-bone"
            >
              <PhoneIcon />
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
    </header>
  );
}
