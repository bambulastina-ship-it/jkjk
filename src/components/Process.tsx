import { site } from '../site'

export default function Process() {
  return (
    <section className="section process" id="process">
      <div className="wrap">
        <div data-reveal>
          <p className="eyebrow" style={{ color: 'var(--amber-500)' }}>
            How it works
          </p>
          <h2>Three steps, no surprises</h2>
          <p className="section-lead">
            The part most homeowners worry about is not knowing what happens next. Here is exactly
            what happens next.
          </p>
        </div>

        <div className="process__grid">
          {site.process.map((p) => (
            <div className="process__step reveal" key={p.title} data-reveal>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
