/* Inline lucide-style icons. All stroke: currentColor, no fills unless noted. */

const ArrowUpRight = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const Play = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
    aria-hidden="true"
  >
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);

const KeyIcon = ({ size = 28, className = "", strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="7.5" cy="15.5" r="4" />
    <path d="M10.4 12.6 21 2" />
    <path d="m16.5 6.5 3 3" />
    <path d="m13.5 9.5 3 3" />
  </svg>
);

const GlobeIcon = ({ size = 28, className = "", strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9.25" />
    <path d="M2.75 12h18.5" />
    <path d="M12 2.75a15 15 0 0 1 0 18.5a15 15 0 0 1 0-18.5z" />
  </svg>
);

const MovieIcon = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2.75 8.25h18.5v11a1.5 1.5 0 0 1-1.5 1.5H4.25a1.5 1.5 0 0 1-1.5-1.5z" />
    <path d="m3.4 8.25 2.1-4.9 3.6 1.55" />
    <path d="m9.1 8.25 2.1-4.9 3.6 1.55" />
    <path d="m14.8 8.25 2.1-4.9 3.6 1.55" />
    <path d="m10.3 12.4 4.2 2.35-4.2 2.35z" />
  </svg>
);

const ShieldIcon = ({ size = 24, className = "", strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.75 4.5 5.9v5.6c0 4.6 3.1 8.4 7.5 9.75 4.4-1.35 7.5-5.15 7.5-9.75V5.9z" />
    <path d="m9 11.9 2.2 2.2L15.3 10" />
  </svg>
);

window.ArrowUpRight = ArrowUpRight;
window.Play = Play;
window.KeyIcon = KeyIcon;
window.GlobeIcon = GlobeIcon;
window.MovieIcon = MovieIcon;
window.ShieldIcon = ShieldIcon;
