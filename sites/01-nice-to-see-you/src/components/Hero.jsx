import MetalWordmark from './MetalWordmark.jsx'
import Photo from './Photo.jsx'
import Reveal from './Reveal.jsx'
import { ADDRESS_ONE_LINE, BUSINESS, DIRECTIONS_URL } from '../lib/site.js'

export default function Hero({ innerRef }) {
  return (
    <section className="hero on-ink" ref={innerRef} aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <div className="hero__type">
          <p className="eyebrow">Family-run coffee shop · York</p>

          <div id="hero-title">
            <MetalWordmark />
          </div>

          <p className="hero__standfirst">Right by the Minster, on Goodramgate.</p>

          <p className="hero__body">
            A small, family-run coffee shop in the heart of York — known for orange and
            cranberry scones with clotted cream and jam, and a brunch menu to sit down to.
          </p>

          <div className="actions hero__actions">
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
        </div>

        <Reveal className="hero__figure">
          <Photo
            file="shopfront.jpg"
            alt="The shopfront of Nice To See You on Goodramgate: a glossy black frontage with NICE TO SEE YOU in spaced capitals on a white fascia board, four tall arched windows with black glazing bars, and the door standing open."
            width={1200}
            height={1600}
            tone="#26221e"
            position="50% 42%"
            sizes="(min-width: 900px) 40vw, 100vw"
            loading="eager"
            fetchPriority="high"
          />
        </Reveal>

        <div className="hero__meta">
          <dl>
            <dt>Address</dt>
            <dd>{ADDRESS_ONE_LINE}</dd>
          </dl>
          <dl>
            <dt>Google</dt>
            <dd>
              {BUSINESS.ratingValue} from {BUSINESS.ratingCount} reviews
            </dd>
          </dl>
          <dl>
            <dt>Typically</dt>
            <dd>{BUSINESS.priceRange}</dd>
          </dl>
        </div>
      </div>
    </section>
  )
}
