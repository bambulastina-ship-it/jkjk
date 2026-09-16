import logoSrc from '../assets/logo.jpg'
import { site } from '../site'
import { Phone, Instagram, MapPin } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <img src={logoSrc} alt="" width={44} height={44} />
              <strong style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {site.legalName}
              </strong>
            </div>
            <p style={{ marginTop: 'var(--sp-2)', maxWidth: '34ch' }}>
              Licensed and insured renovation contractors serving the {site.serviceArea}.
            </p>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={site.phoneHref}>
                  <Phone size={16} /> {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram size={16} /> {site.instagramHandle}
                </a>
              </li>
              <li>
                <MapPin size={16} /> {site.serviceArea}
              </li>
            </ul>
          </div>

          <div>
            <h4>Services</h4>
            <ul>
              {site.services.slice(0, 4).map((s) => (
                <li key={s.id}>
                  <a href="#services">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </span>
          <span>{site.hours}</span>
        </div>
      </div>
    </footer>
  )
}
