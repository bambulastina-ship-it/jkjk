import { site } from '../site'
import { ShieldCheck, Hammer, MapPin, Clock } from './Icons'

const items = [
  { Icon: ShieldCheck, title: 'Licensed & insured', sub: 'Fully covered on every job' },
  { Icon: Hammer, title: site.yearsLabel, sub: 'On the tools, not subcontracted' },
  { Icon: MapPin, title: site.serviceArea, sub: 'Local crews, local references' },
  { Icon: Clock, title: 'Free written quotes', sub: site.hours },
]

export default function TrustStrip() {
  return (
    <section className="trust" aria-label="Why homeowners choose us">
      <div className="wrap trust__grid">
        {items.map(({ Icon, title, sub }) => (
          <div className="trust__item" key={title}>
            <Icon />
            <span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
