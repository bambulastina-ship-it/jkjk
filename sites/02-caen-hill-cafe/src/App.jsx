import { Suspense, lazy } from 'react'
import {
  prefersLightweight,
  supportsWebGL2,
  useInView,
  useIsNarrow,
  usePageVisible,
  useReducedMotion,
} from './lib/env.js'
import GlassDock from './components/GlassDock.jsx'
import Photo from './components/Photo.jsx'

const CanalWater = lazy(() => import('./effects/CanalWater.jsx'))
const LockFlight = lazy(() => import('./effects/LockFlight.jsx'))
const MetalWordmark = lazy(() => import('./effects/MetalWordmark.jsx'))

const IMG = import.meta.env.BASE_URL + 'images/'

const DIRECTIONS =
  'https://www.google.com/maps/dir/?api=1&destination=Caen%20Hill%20Cafe%2C%20The%20Locks%2C%20Devizes%20SN10%201QR'
const LISTING =
  'https://www.google.com/maps/search/?api=1&query=Caen%20Hill%20Cafe%20Devizes%20SN10%201QR'

/* Slow reveal — drifts in, never snaps. */
function Drift({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView({ rootMargin: '-8% 0px -8% 0px', once: true })
  return (
    <Tag
      ref={ref}
      className={`drift${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { '--drift-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

const MENU = [
  { name: 'Hot drinks', note: 'Coffee, and the rest of the hot board.' },
  { name: 'Cold drinks', note: "Chalked up on the board by the counter." },
  { name: 'Toasted sandwiches', note: 'In a kraft tray, with a pile of crisps.' },
  { name: 'Cakes', note: 'On the counter, under the dome.' },
  { name: 'Marshfield Farm ice cream', note: 'Real dairy, signed at the counter.' },
  { name: 'Plant-based & sorbet', note: 'Dairy-free flavours on the board.' },
  { name: 'Ice cream for dogs', note: 'They walked here too.' },
]

const QUOTES = [
  { text: 'Food and drinks are quality, priced well and served quickly.', name: 'Chris Worby' },
  {
    text: 'Coffee was very nice, small indoor seating area but loads of benches outside.',
    name: 'Sara Locking',
  },
  { text: 'Nice service, good choice of menu, a little pricey.', name: 'Nicky Gardner' },
]

export default function App() {
  const reduced = useReducedMotion()
  const isNarrow = useIsNarrow()
  const pageVisible = usePageVisible()
  const gl = supportsWebGL2() && !prefersLightweight()

  const [heroRef, heroInView] = useInView({ rootMargin: '0px', threshold: 0 })
  const [serveRef, serveInView] = useInView({ rootMargin: '15% 0px' })
  const [signRef, signInView] = useInView({ rootMargin: '25% 0px' })

  /* One heavy context at a time: the water and the lock flight are never
     mounted together, and both stop when the tab is hidden. */
  const waterOn = gl && pageVisible && heroInView
  const flightOn = gl && pageVisible && serveInView && !heroInView
  const metalOn = gl && pageVisible && signInView

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="masthead">
        <div className="shell masthead__inner">
          <a className="mark" href="#top">
            <span className="mark__name">Caen Hill Cafe</span>
            <span className="mark__where">The Locks · Devizes</span>
          </a>
          <nav className="navlinks" aria-label="Sections">
            <a href="#stop">The stop</a>
            <a href="#serve">What we serve</a>
            <a className="is-cta" href="#visit">
              Visiting
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* ---------------------------------------------------------- hero */}
        <section className="hero" id="top" ref={heroRef} aria-labelledby="hero-title">
          <div className="hero__canvas" aria-hidden="true">
            {waterOn ? (
              <Suspense fallback={null}>
                <CanalWater animate={!reduced} isNarrow={isNarrow} />
              </Suspense>
            ) : null}
          </div>

          <div className="shell">
            <div className="hero__grid">
              <div>
                <p className="eyebrow">Caen Hill Locks · Kennet &amp; Avon Canal</p>
                <h1 className="hero__title" id="hero-title">
                  Coffee, toasties and ice cream <em>at the locks</em>.
                </h1>
                <p className="hero__sub">
                  A canal-side café at the Caen Hill Locks in Devizes. Benches outside, a small
                  room in, dogs welcome — and ice cream for them too.
                </p>
                <div className="hero__actions">
                  <a
                    className="btn btn--primary"
                    href={DIRECTIONS}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Find us at the locks
                  </a>
                  <a className="btn btn--ghost" href="#serve">
                    See what we serve
                  </a>
                </div>
              </div>

              <figure className="hero__figure">
                <Photo
                  variant="toastie"
                  src={`${IMG}toastie.jpg`}
                  width={1200}
                  height={800}
                  eager
                  alt="A toasted granary sandwich cut in half with melted cheese, served with ready salted crisps in a kraft cardboard tray on a weathered wooden table outside."
                />
                <figcaption className="caption">
                  A toastie and crisps, out in the open air.
                </figcaption>
              </figure>
            </div>

            <dl className="hero__strip">
              <div className="strip__cell">
                <dt className="strip__value">4.4 out of 5</dt>
                <dd className="strip__label">From 919 Google reviews</dd>
              </div>
              <div className="strip__cell">
                <dt className="strip__value">£1–10</dt>
                <dd className="strip__label">A head, on a typical visit</dd>
              </div>
              <div className="strip__cell">
                <dt className="strip__value">Dogs welcome</dt>
                <dd className="strip__label">Ice cream for them as well</dd>
              </div>
              <div className="strip__cell">
                <dt className="strip__value">Benches outside</dt>
                <dd className="strip__label">Out at the locks</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ---------------------------------------------------------- stop */}
        <section className="band band--cream-deep" id="stop" aria-labelledby="stop-title">
          <div className="shell stop__grid">
            <Drift as="figure" className="stop__figure">
              <Photo
                variant="interior"
                src={`${IMG}interior.jpg`}
                width={1200}
                height={900}
                alt="Inside the café: sage green walls, a red brick fireplace with a framed photograph of the canal locks propped inside it, a large roman numeral wall clock, a round table with floral oilcloth and white folding chairs, and a member of staff working at the wooden counter."
              />
              <figcaption className="caption">
                One warm room: sage walls, the fireplace, and the counter.
              </figcaption>
            </Drift>

            <Drift delay={120}>
              <p className="eyebrow">The stop</p>
              <h2 className="stop__title" id="stop-title">
                A small room, and a lot of outdoors.
              </h2>
              <div className="stop__body">
                <p>
                  Inside is one warm room — sage walls, a brick fireplace with a photograph of
                  the locks propped in it, oilcloth on the tables and the day&rsquo;s boards
                  chalked up behind the counter.
                </p>
                <p>
                  There is far more seating outside than in. The benches are where the walkers,
                  cyclists and boat crews end up, dogs included, halfway through whatever they
                  came out to do.
                </p>
              </div>
              <ul className="notes">
                <li>Dog friendly, inside and out — with ice cream for them too.</li>
                <li>Plenty of benches outside; a small seating area indoors.</li>
                <li>On the canal at the Caen Hill Locks — arrive on foot, by bike or by boat.</li>
              </ul>
            </Drift>
          </div>
        </section>

        {/* --------------------------------------------------------- serve */}
        <section
          className="band band--water serve"
          id="serve"
          ref={serveRef}
          aria-labelledby="serve-title"
        >
          <div className="serve__canvas" aria-hidden="true">
            {flightOn ? (
              <Suspense fallback={null}>
                <LockFlight animate={!reduced} isNarrow={isNarrow} />
              </Suspense>
            ) : null}
          </div>

          <div className="shell">
            <Drift className="serve__head">
              <div>
                <p className="eyebrow">At the counter</p>
                <h2 className="serve__title" id="serve-title">
                  Something hot, something toasted, ice cream after.
                </h2>
              </div>
              <p className="lede">
                It is chalked up on the boards rather than printed, so flavours and specials
                move around. This is the shape of it.
              </p>
            </Drift>

            <Drift as="ul" className="menu" delay={100}>
              {MENU.map((item) => (
                <li key={item.name}>
                  <span className="menu__name">{item.name}</span>
                  <span className="menu__note">{item.note}</span>
                </li>
              ))}
            </Drift>

            <Drift className="serve__foot" delay={160}>
              <span>Most people spend £1–10 a head.</span>
              <span>Boards change — what&rsquo;s on today is on the wall.</span>
            </Drift>
          </div>
        </section>

        {/* --------------------------------------------------------- words */}
        <section className="band" id="words" aria-labelledby="words-title">
          <div className="shell">
            <Drift className="words__head">
              <div>
                <p className="eyebrow">In other words</p>
                <h2 className="words__title" id="words-title">
                  What people said afterwards.
                </h2>
              </div>
              <div className="scores">
                <span className="score">
                  <b>4.4</b> Google · 919 reviews
                </span>
                <span className="score">
                  <b>4.6</b> Facebook · 64 votes
                </span>
              </div>
            </Drift>

            <div className="quotes">
              {QUOTES.map((quote, i) => (
                <Drift as="figure" className="quote" key={quote.name} delay={i * 110}>
                  <blockquote>
                    <p>&ldquo;{quote.text}&rdquo;</p>
                  </blockquote>
                  <figcaption>
                    <b>{quote.name}</b> · Google review
                  </figcaption>
                </Drift>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- visit */}
        <section className="band band--sage" id="visit" aria-labelledby="visit-title">
          <div className="shell visit__grid">
            <Drift>
              <p className="eyebrow">Visiting</p>
              <h2 className="visit__title" id="visit-title">
                Find us at the locks.
              </h2>
              <address className="address">
                Caen Hill Cafe
                <br />
                The Locks, Devizes
                <br />
                SN10 1QR
              </address>
              <div className="visit__actions">
                <a
                  className="btn btn--primary"
                  href={DIRECTIONS}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Get directions
                </a>
                <a
                  className="btn btn--ghost"
                  href={LISTING}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Check today&rsquo;s hours
                </a>
              </div>
            </Drift>

            <Drift as="dl" className="facts" delay={120}>
              <div className="fact">
                <dt>Hours</dt>
                <dd>
                  We close at 4pm, and open at 10:30am on Fridays. Times move with the seasons
                  out here — check the Google listing before a long walk.
                </dd>
              </div>
              <div className="fact">
                <dt>Getting here</dt>
                <dd>
                  On the Kennet &amp; Avon Canal at the Caen Hill Locks, just outside Devizes.
                  Walkers, cyclists, boaters and dog walkers all pass the door.
                </dd>
              </div>
              <div className="fact">
                <dt>Prices</dt>
                <dd>£1–10 a head. An everyday stop, not an occasion.</dd>
              </div>
              <div className="fact">
                <dt>Phone</dt>
                <dd>
                  There is no number on our listing. Google Maps is the most reliable place to
                  check we are open.
                </dd>
              </div>
            </Drift>
          </div>
        </section>

        {/* ----------------------------------------------------- signature */}
        <section className="signature" ref={signRef} aria-label="Caen Hill Cafe">
          <div className="shell signature__inner">
            {metalOn ? (
              <Suspense
                fallback={
                  <div className="wordmark">
                    <p className="wordmark__fallback">
                      <span>CAEN HILL</span>
                      <span>CAFE</span>
                    </p>
                  </div>
                }
              >
                <MetalWordmark animate={!reduced} isNarrow={isNarrow} />
              </Suspense>
            ) : (
              <div className="wordmark">
                <p className="wordmark__fallback">
                  <span>CAEN HILL</span>
                  <span>CAFE</span>
                </p>
              </div>
            )}
            <p className="signature__line">
              The Locks, Devizes SN10 1QR — on the Kennet &amp; Avon, wherever you are in the
              walk.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer__inner">
          <p>
            <strong>Caen Hill Cafe</strong> · The Locks, Devizes SN10 1QR
          </p>
          <div className="footer__meta">
            <span>
              Ratings from Google (4.4 from 919 reviews) and Facebook (4.6 from 64 votes).
            </span>
            <span>Hours vary seasonally — check Google before travelling.</span>
          </div>
        </div>
      </footer>

      <GlassDock
        href={DIRECTIONS}
        label="Find us at the locks"
        shown={!heroInView}
        enabled={!reduced && !prefersLightweight()}
      />
    </>
  )
}
