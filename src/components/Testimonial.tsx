import { site } from '../site'
import { Instagram } from './Icons'

/**
 * Client testimonial, placed immediately before the contact CTA — social proof
 * does the most work right where the visitor decides whether to call.
 *
 * The quote is rendered as real text rather than left inside the image: a
 * screenshot is invisible to screen readers and to search engines, and goes
 * soft on small screens. The photo sits alongside as the receipt.
 */
export default function Testimonial() {
  const t = site.testimonial
  if (!t?.quote) return null

  const who = [t.attribution, t.location].filter(Boolean).join(', ')

  return (
    <section className="section tm" aria-labelledby="tm-title">
      <div className="wrap tm__inner">
        <figure className="tm__photo" data-reveal>
          <img
            src={t.photo}
            alt={`The ${site.legalName} crew with a client at the end of a job`}
            decoding="async"
          />
        </figure>

        <div className="tm__body" data-reveal>
          <p className="eyebrow" id="tm-title">
            What our clients say
          </p>
          <blockquote className="tm__quote">
            <p>&ldquo;{t.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="tm__meta">
            <span className="tm__who">{who}</span>
            {t.translatedFrom && (
              <span className="tm__note">Translated from {t.translatedFrom}</span>
            )}
          </figcaption>
          {t.reelUrl && (
            <a
              className="btn btn--outline btn--sm tm__watch"
              href={t.reelUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={18} />
              Watch the video
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
