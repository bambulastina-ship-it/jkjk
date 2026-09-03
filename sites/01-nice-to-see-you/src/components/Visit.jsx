import { Suspense, lazy } from 'react'
import Reveal from './Reveal.jsx'
import { ADDRESS_ONE_LINE, BUSINESS, DIRECTIONS_URL } from '../lib/site.js'

const VisitBackdrop = lazy(() => import('./VisitBackdrop.jsx'))

/**
 * The closing panel. ShaderGradient sits behind it, dark and nearly still,
 * under a heavy scrim.
 *
 * Note what is NOT here: no opening-hours table. Only "closes 5pm" was
 * supplied, so the page says that much and sends people to the Google listing
 * for the rest, rather than inventing a week.
 */
export default function Visit({ innerRef, active }) {
  return (
    <section className="section visit on-ink" id="visit" ref={innerRef} aria-labelledby="visit-title">
      {active ? (
        <Suspense fallback={null}>
          <VisitBackdrop active={active} />
        </Suspense>
      ) : null}

      <div className="shell grid visit__inner">
        <Reveal className="visit__head">
          <p className="eyebrow">Visit</p>
          <h2 className="h-l" id="visit-title">
            30 Goodramgate,
            <br />
            <span className="italic">York</span>
          </h2>
          <p className="lede">
            A walk-in coffee shop, right by the Minster. Come in, or give us a ring.
          </p>
          <div className="actions visit__actions">
            <a
              className="btn btn--solid"
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit us
            </a>
            <a className="btn btn--outline" href={BUSINESS.phoneHref}>
              Call {BUSINESS.phoneDisplay}
            </a>
          </div>
        </Reveal>

        <Reveal className="visit__details" delay={120}>
          <dl className="detail">
            <dt>Where</dt>
            <dd>
              <a
                className="link-underline"
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ADDRESS_ONE_LINE}
              </a>
            </dd>
          </dl>

          <dl className="detail">
            <dt>Phone</dt>
            <dd>
              <a className="link-underline" href={BUSINESS.phoneHref}>
                {BUSINESS.phoneDisplay}
              </a>
            </dd>
          </dl>

          <dl className="detail">
            <dt>Hours</dt>
            <dd>
              Closes 5pm.{' '}
              <a
                className="link-underline"
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Day-by-day hours are on the Google listing
              </a>
              .
            </dd>
          </dl>

          <dl className="detail">
            <dt>Typically</dt>
            <dd>{BUSINESS.priceRange}</dd>
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
