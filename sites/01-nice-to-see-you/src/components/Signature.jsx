import Photo from './Photo.jsx'
import Reveal from './Reveal.jsx'
import { DIRECTIONS_URL } from '../lib/site.js'

/**
 * Two-up: the counter display against the one dish the shop is known for.
 */
export default function Signature() {
  return (
    <section
      className="section signature on-paper-2"
      id="signature"
      aria-labelledby="signature-title"
    >
      <div className="shell grid twoup">
        <Reveal className="twoup__figure">
          <Photo
            file="interior.jpg"
            alt="Inside the shop looking out: a wooden tiered counter display of cakes, scones and brownies with small chalkboard price tags, a glowing pendant bulb overhead, a rubber plant, and the street beyond with a pink-awninged pizzeria opposite."
            width={1050}
            height={1400}
            tone="#4a3b2c"
            position="50% 50%"
            sizes="(min-width: 860px) 40vw, 100vw"
            caption="The counter display, Goodramgate beyond"
          />
        </Reveal>

        <Reveal className="twoup__text" delay={120}>
          <p className="eyebrow">The signature</p>
          <h2 className="h-l" id="signature-title">
            Orange &amp; cranberry <span className="italic accent">scones</span>
          </h2>
          <p className="lede">
            Served with clotted cream and jam. It is the thing the shop is known for.
          </p>
          <p>
            They sit on the tiered display with the cakes and the brownies, priced on the
            little chalkboards, under the pendant light — the first thing you see when you
            come through the door.
          </p>
          <p className="actions signature__actions">
            <a
              className="btn btn--ink"
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit us
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
