import { site } from '../site'
import { Phone, ArrowRight } from './Icons'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero__inner">
        <div className="hero__copy">
          <p className="eyebrow" style={{ color: 'var(--amber-500)' }}>
            {site.serviceArea}
          </p>
          <h1>
            Renovations done <em>properly</em>, the first time.
          </h1>
          <p className="hero__sub">
            {site.legalName} is a licensed and insured renovation contractor. Basements, kitchens,
            bathrooms, framing and finishing — built by the same crew that quotes the job.
          </p>

          <div className="hero__ctas">
            <a className="btn btn--primary" href={site.phoneHref}>
              <Phone size={18} />
              Call Now
            </a>
            <a className="btn btn--ghost" href="#work">
              See Our Work
              <ArrowRight size={18} />
            </a>
          </div>

          <a className="hero__phone" href={site.phoneHref}>
            <Phone size={22} />
            <span className="hero__phone-stack">
              <small>Free quotes — call or text</small>
              {site.phoneDisplay}
            </span>
          </a>
        </div>

        <figure className="hero__figure">
          <img
            className="hero__photo"
            src="assets/owner.jpg"
            alt={`The owner of ${site.legalName} on a recent job site`}
            width={1080}
            height={1350}
            fetchPriority="high"
            decoding="async"
          />
          <figcaption className="hero__badge">
            <span className="dot" aria-hidden="true" />
            <span>
              <strong>Taking on new projects</strong>
              <small>{site.hours}</small>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
