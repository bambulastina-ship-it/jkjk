import Photo from './Photo.jsx'
import Reveal from './Reveal.jsx'
import { BUSINESS, COUNTER } from '../lib/site.js'

/**
 * Typographic list against a portrait plate. Only what the brief lists —
 * this is not a menu, and it is deliberately not extended.
 */
export default function Counter() {
  return (
    <section className="section counter" id="counter" aria-labelledby="counter-title">
      <div className="shell grid twoup twoup--reverse">
        <Reveal className="twoup__figure">
          <Photo
            file="pancakes.jpg"
            alt="A tall stack of pancakes with sliced banana, caramel sauce, a crumb topping and icing sugar, a small pot of syrup alongside, on a matte grey plate."
            width={1050}
            height={1400}
            tone="#8a6640"
            position="50% 50%"
            sizes="(min-width: 860px) 40vw, 100vw"
            caption="From the brunch menu"
          />
        </Reveal>

        <div className="twoup__text">
          <Reveal>
            <p className="eyebrow">On the counter</p>
            <h2 className="h-m" id="counter-title">
              What there is
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <ul className="counter__list">
              {COUNTER.map((item, i) => (
                <li className="counter__item" key={item.name}>
                  <span className="counter__idx" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="counter__name">{item.name}</span>
                  {item.note ? <p className="counter__note">{item.note}</p> : null}
                </li>
              ))}
            </ul>
            <p className="small counter__foot">
              Typically {BUSINESS.priceRange}. The chalkboards behind the counter carry the
              day&rsquo;s full list — this is only what we can put in writing.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
