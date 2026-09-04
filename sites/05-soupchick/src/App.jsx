import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import Photo from './components/Photo.jsx'
import Rise from './components/Rise.jsx'
import Menu from './components/Menu.jsx'
import GlassCta from './components/GlassCta.jsx'
import { business, reviews } from './data/menu.js'
import { supportsWebGL2, useCanvasSlot, useIsNarrow, useReducedMotion } from './lib/env.js'

const Steam = lazy(() => import('./effects/Steam.jsx'))
const MarketWash = lazy(() => import('./effects/MarketWash.jsx'))
const MetalWordmark = lazy(() => import('./effects/MetalWordmark.jsx'))

const SIGNAGE = ['Fresh Soups', 'Juice Bar', 'Healthy Take-Away', 'Coffee']

export default function App() {
  const isNarrow = useIsNarrow()
  const reduced = useReducedMotion()
  const [gl, setGl] = useState(false)

  const [steamRef, steamMount, steamAnimate] = useCanvasSlot()
  const [plateRef, plateMount, plateAnimate] = useCanvasSlot()
  const [washRef, washMount, washAnimate] = useCanvasSlot()

  // sticky tray appears once the hero has gone by
  const heroRef = useRef(null)
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    setGl(supportsWebGL2())
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), {
      rootMargin: '-60px 0px 0px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#menu">
        Skip to the menu
      </a>

      <header className="masthead">
        <div className="shell masthead__inner">
          <a className="wordmark" href="#top">
            <span>Soup</span>
            <em>Chick</em>
          </a>
          <nav className="masthead__nav" aria-label="Primary">
            <a className="navlink navlink--menu" href="#menu">
              Menu
            </a>
            <a className="navlink navlink--find" href="#visit">
              Find us
            </a>
            <a
              className="navlink navlink--call"
              href={business.phoneHref}
              aria-label={`Call SoupChick on ${business.phoneLabel}`}
            >
              <span className="navlink__long">{business.phoneLabel}</span>
              <span className="navlink__short" aria-hidden="true">
                Call
              </span>
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ---------------------------------------------------------- hero */}
        <section className="hero" ref={heroRef} aria-labelledby="hero-title">
          <div className="shell">
            <div className="hero__head">
              <p className="hero__place">
                Units 5 &amp; 6 · The Shambles Market Hall · Devizes
              </p>
              <h1 id="hero-title">
                Home made soup and <em>oozing toasties</em>, in the market hall.
              </h1>
              <p className="hero__lede">
                A small stall with a big pot. Whatever has been made this morning goes up on the
                specials board — alongside toasties off the griddle, oven baked potatoes, proper
                coffee and the juice bar.
              </p>
              <div className="btn-row hero__actions">
                <a
                  className="btn btn--primary"
                  href={business.mapUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Visit us in the Shambles
                </a>
                <a className="btn btn--ghost" href={business.phoneHref}>
                  Call {business.phoneLabel}
                </a>
              </div>
              <p className="trust">
                <span>
                  <b>5.0</b> on Google, from 15 reviews
                </span>
                <span className="trust__dot" aria-hidden="true" />
                <span>
                  <b>5/5</b> on Facebook, from 31 votes
                </span>
                <span className="trust__dot" aria-hidden="true" />
                <span>
                  <b>£1–10</b> a head
                </span>
              </p>
            </div>

            <Rise>
              <figure className="figure hero__figure">
                <Photo
                  shape="wide"
                  src="https://res.cloudinary.com/ew67r2lv/image/upload/v1788519985/008_ux490a.webp"
                  alt="The SoupChick stall inside The Shambles Market Hall: black chalkboard signs reading Fresh Soups, Juice Bar and Healthy Take-Away above a pallet-clad counter and display fridge, festoon lights and bunting overhead, and red and white tables where customers are eating."
                  width={1600}
                  height={900}
                  eager
                />
              </figure>
            </Rise>
          </div>
        </section>

        {/* ------------------------------------------------------- signage */}
        <section className="signage" aria-label="What the stall sells">
          <div className="shell">
            <ul className="signage__list">
              {SIGNAGE.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------- soup + R3F */}
        <section className="band" aria-labelledby="pot-title">
          <div className="shell feature feature--flip">
            <div className="feature__media" ref={steamRef}>
              <Rise>
                <figure className="figure">
                  <Photo
                    shape="wide"
                    src="https://res.cloudinary.com/ew67r2lv/image/upload/v1788519991/009_t6uyhp.webp"
                    alt="A bowl of creamy, chunky soup with the spoon lifted from it, a blue-and-white patterned bowl of sliced sourdough alongside and a pepper grinder on a white table."
                    width={1400}
                    height={875}
                  >
                    {gl && steamMount ? (
                      <Suspense fallback={null}>
                        <Steam animate={steamAnimate} isNarrow={isNarrow} />
                      </Suspense>
                    ) : null}
                  </Photo>
                  <figcaption className="caption">
                    Soup, and the sourdough that comes with it.
                  </figcaption>
                </figure>
              </Rise>
            </div>
            <div className="feature__body stack">
              <p className="eyebrow">Home made soups</p>
              <h2 id="pot-title">What&rsquo;s in the pot changes with the day.</h2>
              <p>
                There is no fixed soup list, and that is rather the point. The daily specials board
                by the counter says what has been made. Take it away from £4.50, sit in from £5.50,
                and add a seeded bakers roll for 50p.
              </p>
              <p className="note">
                The menu carries two words above everything else: <strong>Fresh</strong> and{' '}
                <strong>Local</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------ liquid metal nameplate */}
        <div className="plate" ref={plateRef}>
          <div className="shell">
            {gl && plateMount ? (
              <Suspense fallback={<div className="plate__inner"><p className="plate__static">SoupChick</p></div>}>
                <MetalWordmark animate={plateAnimate && !reduced} isNarrow={isNarrow} />
              </Suspense>
            ) : (
              <div className="plate__inner">
                <p className="plate__static">SoupChick</p>
              </div>
            )}
            <p className="plate__caption">Fresh · Local · Devizes</p>
          </div>
        </div>

        {/* ---------------------------------------------------------- menu */}
        <section className="menu band" id="menu" aria-labelledby="menu-title">
          <div className="shell">
            <div className="menu__head">
              <p className="eyebrow">The menu</p>
              <h2 id="menu-title">Everything, with the prices.</h2>
              <p>
                As printed on the menu at the counter. Soups change daily; the board by the till has
                today&rsquo;s.
              </p>
            </div>

            <Menu />

            <div className="menu__foot">
              <p>
                <strong>Orders are taken at the counter.</strong> There is nothing to buy on this
                page — it is here so you know what is on and what it costs before you walk over.
              </p>
              <figure className="menu__scan">
                <Photo
                  shape="tall"
                  src="https://res.cloudinary.com/ew67r2lv/image/upload/v1788520005/0101_ivlw4p.webp"
                  alt="The printed SoupChick menu board at the stall, listing the same soups, baked potatoes, toasties and drinks set out in text above."
                  width={600}
                  height={750}
                />
                <figcaption className="caption">The printed menu at the stall.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- quotes */}
        <section className="quotes band" aria-labelledby="said-title">
          <div className="shell">
            <div className="centred">
              <p className="eyebrow">What people say</p>
              <h2 id="said-title">Fifteen Google reviews. All five stars.</h2>
              <p className="lede">
                A small stall with a small, unanimous set of reviews — 5.0 from 15 on Google, and
                5/5 from 31 votes on Facebook.
              </p>
            </div>
            <div className="quotes__grid">
              {reviews.map((review, i) => (
                <Rise key={review.name} delay={i * 90}>
                  <figure className="quote">
                    <p className="quote__stars" aria-hidden="true">
                      ★★★★★
                    </p>
                    <blockquote>“{review.quote}”</blockquote>
                    <figcaption>
                      {review.name} <span className="visually-hidden">— five stars on Google</span>
                    </figcaption>
                  </figure>
                </Rise>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- room */}
        <section className="room band" aria-labelledby="room-title">
          <div className="shell feature">
            <div className="feature__media">
              <Rise>
                <figure className="figure">
                  <Photo
                    shape="wide"
                    tone="green"
                    src="https://res.cloudinary.com/ew67r2lv/image/upload/v1788519998/010_ewrpdj.webp"
                    alt="The seating room: white painted brick under an arched ceiling, four coloured pendant shades, framed landscape photographs on the walls, tartan blankets over the chairs, fairy lights, candles and flowers on the tables."
                    width={1400}
                    height={875}
                  />
                </figure>
              </Rise>
            </div>
            <div className="feature__body stack">
              <p className="eyebrow eyebrow--light">Eat in</p>
              <h2 id="room-title">And a room to sit down in.</h2>
              <p>
                White painted brick under an arched ceiling, four coloured pendant shades, framed
                landscapes on the walls, tartan blankets over the backs of the chairs, fairy lights
                and candles. Bring a book; the soup is hot.
              </p>
              <p className="note">
                Eat in from <strong>£5.50</strong>, take away from <strong>£4.50</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- visit */}
        <section className="visit band" id="visit" aria-labelledby="visit-title" ref={washRef}>
          <div className="visit__wash" aria-hidden="true">
            {gl && washMount ? (
              <Suspense fallback={null}>
                <MarketWash animate={washAnimate} isNarrow={isNarrow} />
              </Suspense>
            ) : null}
          </div>
          <div className="visit__veil" aria-hidden="true" />
          <div className="shell visit__inner">
            <div className="centred">
              <p className="eyebrow">Come and find us</p>
              <h2 id="visit-title">Inside the covered market hall.</h2>
            </div>
            <div className="visit__grid">
              <div className="card">
                <h3>Where</h3>
                <address className="address">
                  <b>SoupChick</b>
                  <br />
                  {business.unit}, {business.venue}
                  <br />
                  {business.town} {business.postcode}
                </address>
                <div className="btn-row" style={{ marginTop: '1.4rem' }}>
                  <a
                    className="btn btn--primary"
                    href={business.mapUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Get directions
                  </a>
                  <a className="btn btn--ghost" href={business.phoneHref}>
                    Call the stall
                  </a>
                </div>
              </div>
              <div className="card">
                <h3>Good to know</h3>
                <dl className="deflist">
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={business.phoneHref}>{business.phoneLabel}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Prices</dt>
                    <dd>£1–10 per person.</dd>
                  </div>
                  <div>
                    <dt>Opening</dt>
                    <dd>
                      Opens 9:15am on Fridays. The rest of the week follows the market hall — give
                      the stall a ring if you are making a special trip.
                    </dd>
                  </div>
                  <div>
                    <dt>Ordering</dt>
                    <dd>At the counter. Eat in, or take it away.</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">
          <div className="footer__grid">
            <div>
              <p className="footer__mark">SoupChick</p>
              <p>Fresh soups, oozing toasties, baked potatoes, coffee and a juice bar.</p>
            </div>
            <div>
              <h3>Find us</h3>
              <address className="address" style={{ color: 'inherit' }}>
                {business.unit}
                <br />
                {business.venue}
                <br />
                {business.town} {business.postcode}
              </address>
            </div>
            <div>
              <h3>Get in touch</h3>
              <p>
                <a href={business.phoneHref}>{business.phoneLabel}</a>
                <br />
                <a href={business.mapUrl} target="_blank" rel="noreferrer noopener">
                  Directions
                </a>
                <br />
                <a href="#menu">The menu</a>
              </p>
            </div>
          </div>
          <p className="footer__fine">
            Menu and prices as printed at the stall. Soup specials change daily. Orders are taken at
            the counter — nothing is sold on this page.
          </p>
        </div>
      </footer>

      <GlassCta
        mapUrl={business.mapUrl}
        phoneHref={business.phoneHref}
        phoneLabel={business.phoneLabel}
        shown={pastHero}
        enabled={gl}
      />
    </>
  )
}
