import { Suspense, lazy } from 'react'
import Reveal from './Reveal.jsx'
import { BUSINESS, REVIEWS } from '../lib/site.js'

// three.js and R3F are ~900 kB of the bundle and are needed by nothing above
// the fold, so they are fetched only when this section comes into view.
const CremaField = lazy(() => import('./CremaField.jsx'))

/**
 * Real, supplied Google reviews on the R3F crema field. Nothing here is
 * paraphrased or invented — the quotes and the rating are as given, and both
 * are attributed to Google on the page.
 */
export default function Voices({ innerRef, active }) {
  return (
    <section className="section voices on-ink" ref={innerRef} aria-labelledby="voices-title">
      {active ? (
        <Suspense fallback={null}>
          <CremaField active={active} />
        </Suspense>
      ) : null}

      <div className="shell grid voices__inner">
        <Reveal className="voices__head">
          <p className="eyebrow">The reviews</p>
          <h2 className="h-m" id="voices-title">
            What people&nbsp;say
          </h2>
          <div className="rating">
            <span className="rating__score">{BUSINESS.ratingValue}</span>
            <span className="small">
              from {BUSINESS.ratingCount} Google reviews
              <br />
              as supplied by the shop
            </span>
          </div>
        </Reveal>

        <div className="voices__quotes">
          {REVIEWS.map((review, i) => (
            <Reveal as="figure" className="quote" key={review.name} delay={i * 90}>
              <blockquote>
                <p>&ldquo;{review.quote}&rdquo;</p>
              </blockquote>
              <figcaption>
                {review.name} <span aria-hidden="true">·</span>{' '}
                <span className="quote__src">Google</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
