/**
 * Inline SVG icon set. SVG rather than an icon font or emoji, so icons inherit
 * `currentColor`, scale cleanly and never get announced as text by a screen
 * reader. Every icon is decorative — the surrounding control carries the label.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.6 3h-2A1.6 1.6 0 0 0 3 4.7C3 13.1 10.9 21 19.3 21a1.6 1.6 0 0 0 1.7-1.6v-2a1.2 1.2 0 0 0-1-1.2l-3-.6a1.2 1.2 0 0 0-1.2.5l-.9 1.2a13.6 13.6 0 0 1-5.2-5.2l1.2-.9a1.2 1.2 0 0 0 .5-1.2l-.6-3a1.2 1.2 0 0 0-1.2-1Z" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 10.4c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10.2" r="2.8" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 1.9" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="m12 2.6 2.83 5.9 6.42.9-4.66 4.6 1.12 6.48L12 17.4l-5.71 3.08 1.12-6.47-4.66-4.6 6.42-.91Z" />
  </svg>
);

export const ArrowIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const FacebookIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** Small daisy mark used as the wordmark glyph and as a section divider. */
export const DaisyMark = (p: IconProps) => (
  <svg {...base({ strokeWidth: 1.2, ...p })} viewBox="0 0 24 24">
    {/* Eight petals around a filled heart — the brand motif in miniature. */}
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return (
        <ellipse
          key={i}
          cx={12 + Math.cos(a) * 6}
          cy={12 + Math.sin(a) * 6}
          rx={3.4}
          ry={1.9}
          transform={`rotate(${(i / 8) * 360} ${12 + Math.cos(a) * 6} ${
            12 + Math.sin(a) * 6
          })`}
        />
      );
    })}
    <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
  </svg>
);
