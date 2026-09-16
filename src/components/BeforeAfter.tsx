import { site } from '../site'

/**
 * Before/after pairs, shown side by side with permanent labels.
 *
 * Deliberately not a drag-slider: cold visitors do not interact, and a slider
 * hides half the evidence behind a gesture. A labelled static pair is legible
 * in one glance, works on touch without fiddling, and needs no JavaScript.
 */
export default function BeforeAfter() {
  if (!site.beforeAfter.length) return null

  return (
    <section className="section ba" id="before-after">
      <div className="wrap">
        <div className="ba__head" data-reveal>
          <p className="eyebrow">Before &amp; after</p>
          <h2>The same room, start to finish</h2>
          <p className="section-lead">
            Same spot, same angle — so you can see exactly what changed.
          </p>
        </div>

        {site.beforeAfter.map((p) => (
          <article className="ba__item" key={p.id}>
            <div className="ba__pair">
              <figure className="ba__shot">
                <img src={p.before} alt={`${p.title} before work started`} decoding="async" />
                <figcaption className="ba__tag ba__tag--before">Before</figcaption>
              </figure>
              <figure className="ba__shot">
                <img src={p.after} alt={`${p.title} after completion`} decoding="async" />
                <figcaption className="ba__tag ba__tag--after">After</figcaption>
              </figure>
            </div>
            <div className="ba__copy">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              {p.duration && <p className="ba__duration">Completed in {p.duration}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
