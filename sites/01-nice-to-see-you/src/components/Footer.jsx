import { ADDRESS_ONE_LINE, BUSINESS, DIRECTIONS_URL } from '../lib/site.js'

export default function Footer() {
  return (
    <footer className="footer on-ink">
      <div className="shell footer__inner">
        <p className="footer__mark">{BUSINESS.wordmark}</p>
        <p>
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
            {ADDRESS_ONE_LINE}
          </a>
        </p>
        <p>
          <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a>
        </p>
        <p className="footer__note">Family-run. Walk in — no booking needed.</p>
      </div>
    </footer>
  )
}
