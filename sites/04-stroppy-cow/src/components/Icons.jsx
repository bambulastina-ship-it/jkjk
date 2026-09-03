export function InstagramIcon(props) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon(props) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14.6 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.85.24-1.42 1.45-1.42H17.6V4.79A19 19 0 0 0 15.35 4.7c-2.23 0-3.75 1.36-3.75 3.85v2.15H9.1v2.9h2.5V21h3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowIcon(props) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * A plain roundel: three concentric rings. Stands in for the real logo file
 * wherever it has not loaded, and doubles as the static fallback for the
 * WebGL pieces. Deliberately NOT a substitute logo — it is a geometric mark.
 */
export function Roundel({ ring = '#F4EEE4', mid = '#1355CE', core = '#F4EEE4', ...props }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={mid} strokeWidth="9" />
      <circle cx="50" cy="50" r="11" fill={core} />
    </svg>
  )
}

export function BiscuitIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 4" />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  )
}
