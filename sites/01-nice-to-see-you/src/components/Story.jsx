import Photo from './Photo.jsx'
import Reveal from './Reveal.jsx'
import { BUSINESS } from '../lib/site.js'

/**
 * Narrow offset column against a small portrait aside — the quietest part of
 * the page, and the only place the owner speaks in their own words.
 */
export default function Story() {
  return (
    <section className="section story" id="story" aria-labelledby="story-title">
      <div className="shell grid">
        <Reveal className="story__aside">
          <Photo
            file="juice.jpg"
            alt="A tall glass of fresh orange juice over crushed ice with a sprig of mint, a dried orange slice and two black straws, a halved orange beside it on light wood in hard sunlight."
            width={900}
            height={1200}
            tone="#c98a3c"
            position="50% 45%"
            sizes="(min-width: 900px) 24vw, 100vw"
            caption="Fresh juices and smoothies"
          />
        </Reveal>

        <div className="story__col">
          <Reveal>
            <p className="eyebrow">The shop</p>
            <h2 className="h-l" id="story-title">
              A family-run coffee shop, one street back from the&nbsp;Minster.
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className="story__drop story__lede">
              {BUSINESS.name} sits at 30 Goodramgate, in the heart of York. A glossy black
              frontage, a white fascia board with the name in spaced capitals, four tall
              arched windows and the door open onto the street.
            </p>
            <p>
              The kitchen runs a brunch menu — avocado on toast among it, and a Polish
              breakfast plate — while the counter carries cakes, brownies and scones, with
              the prices chalked up beside them. To drink: coffee, a chai latte, matcha,
              fresh juices and smoothies.
            </p>
            <blockquote className="pull">
              <p>
                “We are well-known for our orange and cranberry scones served with clotted
                cream and jam.”
              </p>
              <footer className="small">The family, in their own words</footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
