'use client';

/**
 * Services & pricing.
 *
 * The full menu is ~50 line items, which is far too much to dump on one screen.
 * On desktop it is a tab set; on mobile the same content is an accordion, since
 * horizontal tabs with six labels do not fit a phone.
 *
 * Both are the same content, and both keep every panel in the DOM (hidden with
 * the `hidden` attribute) so the page stays findable with in-page search and so
 * crawlers see the whole menu.
 */

import { useId, useRef, useState } from 'react';
import Reveal from './Reveal';
import { PRICING_DISCLAIMER, SERVICES } from '@/lib/content';
import { BUSINESS } from '@/lib/content';
import { PhoneIcon } from './Icons';

export default function Services() {
  const [active, setActive] = useState(SERVICES[0].id);
  const [openMobile, setOpenMobile] = useState<string | null>(SERVICES[0].id);
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /** Arrow-key roving focus, as expected of a tablist. */
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % SERVICES.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + SERVICES.length) % SERVICES.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = SERVICES.length - 1;
    const id = SERVICES[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <section id="services" className="section-y bg-paper">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ochre-ink">
            <span className="h-px w-8 rule-fade" aria-hidden="true" />
            Services &amp; pricing
          </p>
          <h2 className="mt-6 max-w-2xl font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-ink">
            The full menu, with the prices printed.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted">
            No packages to decode and nothing quoted only on arrival.
          </p>
        </Reveal>

        {/* ---------------- Desktop: tabs ---------------- */}
        <div className="mt-14 hidden md:block">
          <div
            role="tablist"
            aria-label="Service categories"
            className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line"
          >
            {SERVICES.map((cat, i) => {
              const selected = cat.id === active;
              return (
                <button
                  key={cat.id}
                  ref={(el) => {
                    tabRefs.current[cat.id] = el;
                  }}
                  role="tab"
                  id={`${baseId}-tab-${cat.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${cat.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(cat.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`-mb-px cursor-pointer border-b-2 pb-4 font-display text-xl transition-colors ${
                    selected
                      ? 'border-ochre text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>

          {SERVICES.map((cat) => (
            <div
              key={cat.id}
              role="tabpanel"
              id={`${baseId}-panel-${cat.id}`}
              aria-labelledby={`${baseId}-tab-${cat.id}`}
              hidden={cat.id !== active}
              tabIndex={0}
              className="pt-10"
            >
              <p className="mb-8 max-w-lg text-muted">{cat.blurb}</p>
              <PriceList items={cat.items} />
            </div>
          ))}
        </div>

        {/* ---------------- Mobile: accordion ---------------- */}
        <div className="mt-10 md:hidden">
          {SERVICES.map((cat) => {
            const isOpen = openMobile === cat.id;
            return (
              <div key={cat.id} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenMobile(isOpen ? null : cat.id)}
                    aria-expanded={isOpen}
                    aria-controls={`${baseId}-acc-${cat.id}`}
                    className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-display text-2xl text-ink">
                      {cat.title}
                    </span>
                    {/* Rotating chevron; the +/- shape change is the state cue
                        beyond colour alone. */}
                    <span
                      aria-hidden="true"
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={`${baseId}-acc-${cat.id}`} hidden={!isOpen} className="pb-8">
                  <p className="mb-6 text-muted">{cat.blurb}</p>
                  <PriceList items={cat.items} />
                </div>
              </div>
            );
          })}
        </div>

        <Reveal className="mt-12 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-muted">{PRICING_DISCLAIMER}</p>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bone transition-colors hover:bg-ink-soft"
          >
            <PhoneIcon width={16} height={16} />
            Call {BUSINESS.phone}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Price list. A description list is the honest markup here: each service name
 * is a term and its price is the definition. Leader dots are drawn with a
 * border on a flexible spacer so they never end up in the accessibility tree.
 */
function PriceList({ items }: { items: { name: string; price: string; note?: string }[] }) {
  return (
    <dl className="grid gap-x-16 gap-y-1 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-baseline gap-3 border-b border-line/60 py-3 last:border-0"
        >
          <dt className="text-ink">
            {item.name}
            {item.note ? (
              <span className="ml-2 text-sm text-muted">({item.note})</span>
            ) : null}
          </dt>
          <span
            aria-hidden="true"
            className="min-w-4 flex-1 translate-y-[-0.3em] border-b border-dotted border-line"
          />
          <dd className="font-mono text-sm tabular-nums text-ink">{item.price}</dd>
        </div>
      ))}
    </dl>
  );
}
