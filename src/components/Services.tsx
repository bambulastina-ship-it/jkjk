import { site } from '../site'
import { Home, Ruler, Hammer, PaintRoller, Fence, ShieldCheck } from './Icons'

const icons = [Home, Ruler, Hammer, PaintRoller, Fence, ShieldCheck]

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="services__head" data-reveal>
          <p className="eyebrow">What we do</p>
          <h2>Renovation work, start to finish</h2>
          <p className="section-lead">
            One crew, one schedule, one point of contact — from demolition through to the final coat
            of paint.
          </p>
        </div>

        <div className="services__grid">
          {site.services.map((s, i) => {
            const Icon = icons[i % icons.length]
            return (
              <article className="service reveal" key={s.id} data-reveal>
                <div className="service__icon">
                  <Icon size={22} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
