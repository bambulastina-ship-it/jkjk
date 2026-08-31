/**
 * ============================================================================
 * Daisy Nails — site content
 * ----------------------------------------------------------------------------
 * Every fact on the page lives here so the marketing copy has exactly one
 * source of truth, and so the JSON-LD and the visible page can never drift
 * apart. Nothing in this file is invented: the NAP data, hours, service menu,
 * ratings and review quotes are all carried over from the salon's existing
 * site and listings.
 * ==========================================================================*/

export const BUSINESS = {
  name: 'Daisy Nail Salon',
  shortName: 'Daisy Nails',
  tagline: 'A family-run nail salon in Colorado Springs.',
  street: '409 Windchime Pl',
  city: 'Colorado Springs',
  state: 'CO',
  zip: '80919',
  center: 'Windchime Center',
  /** Display form. */
  phone: '(719) 418-7193',
  /** RFC 3966 / tel: form, for tap-to-call. */
  phoneHref: 'tel:+17194187193',
  facebook: 'https://www.facebook.com/people/Daisy-Nails/100063606429117',
  // NOTE: no `geo` block on purpose. Exact coordinates for the storefront were
  // not available, and a guessed lat/long in structured data can send people to
  // the wrong end of a strip mall. The postal address is authoritative and
  // search engines geocode it themselves. Add real coordinates here (and to the
  // JSON-LD in app/layout.tsx) once they can be confirmed from the listing.
} as const;

export const ADDRESS_LINE = `${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.state} ${BUSINESS.zip}`;

/** Google Maps deep link — opens directions in the user's map app on mobile. */
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${BUSINESS.name}, ${ADDRESS_LINE}`,
)}`;

/** Keyless embed. The plain /maps?output=embed form needs no API key. */
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${BUSINESS.name}, ${ADDRESS_LINE}`,
)}&output=embed`;

/* -------------------------------------------------------------------------- */
/* Ratings — as published. Do not round, embellish or add sources.            */
/* -------------------------------------------------------------------------- */

export const RATINGS = [
  { source: 'Google', score: '4.5', count: 197, unit: 'reviews' },
  { source: 'Facebook', score: '4.8', count: 25, unit: 'votes' },
] as const;

/* -------------------------------------------------------------------------- */
/* Hours                                                                      */
/* -------------------------------------------------------------------------- */

export interface DayHours {
  day: string;
  /** Short label used by the JSON-LD `dayOfWeek`. */
  schemaDay: string;
  opens: string | null;
  closes: string | null;
}

export const HOURS: DayHours[] = [
  { day: 'Monday', schemaDay: 'Monday', opens: '09:30', closes: '19:00' },
  { day: 'Tuesday', schemaDay: 'Tuesday', opens: '09:30', closes: '19:00' },
  { day: 'Wednesday', schemaDay: 'Wednesday', opens: '09:30', closes: '19:00' },
  { day: 'Thursday', schemaDay: 'Thursday', opens: '09:30', closes: '19:00' },
  { day: 'Friday', schemaDay: 'Friday', opens: '09:30', closes: '19:00' },
  { day: 'Saturday', schemaDay: 'Saturday', opens: '09:30', closes: '19:00' },
  { day: 'Sunday', schemaDay: 'Sunday', opens: null, closes: null },
];

export const HOURS_SUMMARY = 'Mon–Sat 9:30am–7:00pm · Sunday closed';

/** 24h "09:30" → "9:30am", for display. */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`;
}

/* -------------------------------------------------------------------------- */
/* Service menu                                                               */
/* -------------------------------------------------------------------------- */

export interface ServiceItem {
  name: string;
  /** Display price, e.g. "$30" or "$3–5". Kept as text — some are ranges. */
  price: string;
  note?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  blurb: string;
  items: ServiceItem[];
}

export const SERVICES: ServiceCategory[] = [
  {
    id: 'manicures',
    title: 'Manicures',
    blurb: 'Shaping, cuticle care and a finish that lasts — regular or gel.',
    items: [
      { name: 'Princess Manicure', price: '$20', note: 'Ages 5–10' },
      { name: 'Regular Spa Manicure', price: '$30' },
      { name: 'Regular French Manicure', price: '$35' },
      { name: 'Regular Deluxe Manicure', price: '$40' },
      { name: 'Gel Spa Manicure', price: '$40' },
      { name: 'Gel French Manicure', price: '$45' },
      { name: 'Gel Deluxe Manicure', price: '$50' },
    ],
  },
  {
    id: 'pedicures',
    title: 'Pedicures',
    blurb: 'From a straightforward spa soak to the full CBD treatment.',
    items: [
      { name: 'Princess Pedicure', price: '$30', note: 'Ages 5–10' },
      { name: 'Regular Spa Pedicure', price: '$35' },
      { name: 'Regular Signature Pedicure', price: '$45' },
      { name: 'Regular Luxury Pedicure', price: '$55' },
      { name: 'Regular CBD Pedicure', price: '$65' },
      { name: 'Gel Spa Pedicure', price: '$50' },
      { name: 'Gel Signature Pedicure', price: '$60' },
      { name: 'Gel Luxury Pedicure', price: '$70' },
      { name: 'Gel CBD Pedicure', price: '$80' },
    ],
  },
  {
    id: 'enhancements',
    title: 'Nail Enhancements',
    blurb: 'Full sets, fills, ombré and dipping powder.',
    items: [
      { name: 'Regular Full Set', price: '$45' },
      { name: 'Gel Full Set', price: '$55' },
      { name: 'Regular Fill', price: '$35' },
      { name: 'Gel Fill', price: '$45' },
      { name: 'Full Set w/ Pink & White or Ombré', price: '$65' },
      { name: 'Fill Pink & White', price: '$55' },
      { name: 'Fill Ombré', price: '$50' },
      { name: 'Dipping Powder', price: '$45' },
      { name: 'Tip / French', price: '+$5' },
    ],
  },
  {
    id: 'polish',
    title: 'Polish Change',
    blurb: 'A quick refresh on hands or feet.',
    items: [
      { name: 'Hand / Feet', price: '$15' },
      { name: 'French Tip (Hand)', price: '$20' },
      { name: 'French Tip (Feet)', price: '$20' },
      { name: 'Shellac (whole nails)', price: '$25' },
      { name: 'Shellac (French tips)', price: '$30' },
    ],
  },
  {
    id: 'add-ons',
    title: 'Add-on Services',
    blurb: 'The extras — art, repairs and treatments.',
    items: [
      { name: 'Fill Toes', price: '$40' },
      { name: 'Fullset Toes', price: '$50' },
      { name: 'Nail Art Design', price: '$5+', note: 'Per nail' },
      { name: 'Soak Off w/ Full Set', price: '$5' },
      { name: 'Shellac Soak Off', price: '$10' },
      { name: 'Nail Repair', price: '$3–5' },
      { name: 'Callus Removal', price: '$8' },
      { name: 'Paraffin Treatment (Hand)', price: '$7' },
      { name: 'Paraffin Treatment (Feet)', price: '$10' },
      { name: 'Toe Waxing', price: '$7' },
      { name: 'French Tip', price: '$5' },
    ],
  },
  {
    id: 'waxing',
    title: 'Facial Waxing',
    blurb: 'Precise, careful waxing while you are in the chair.',
    items: [
      { name: 'Eyebrows', price: '$15' },
      { name: 'Lip / Chin', price: '$10' },
      { name: 'Nose', price: '$10' },
      { name: 'Ears', price: '$10' },
      { name: 'Face Side', price: '$15' },
      { name: 'Forehead', price: '$15' },
      { name: 'Full Face', price: '$45' },
    ],
  },
];

export const PRICING_DISCLAIMER =
  'Prices and services may vary — please call to confirm before your visit.';

/* -------------------------------------------------------------------------- */
/* Testimonials — real reviews, trimmed for length only.                      */
/* -------------------------------------------------------------------------- */

export interface Testimonial {
  quote: string;
  author: string;
  source: 'Google' | 'Facebook';
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'This is definitely a gem of a nail salon. The people are incredibly friendly and do an outstanding job. They work efficiently, but don’t rush.',
    author: 'Allison D.',
    source: 'Google',
  },
  {
    quote:
      'Amazing salon! Lana did my pedicure and was very helpful in helping me figure out what I wanted. Cindy did my nails, exceeded my expectations.',
    author: 'Jennifer H.',
    source: 'Google',
  },
  {
    quote:
      'Tim was so kind. I love his story and how this is a family operated business. He did a great job on my dip mani with tips, and my pedi.',
    author: 'Paige E.',
    source: 'Google',
  },
  {
    quote:
      'Hellen, Loan, Tim and the whole team did an amazing job!! Both my mom’s and my nails came out wonderful. Awesome environment.',
    author: 'Ellen L.',
    source: 'Google',
  },
  {
    quote:
      'Today was my first time coming here and I absolutely love this nail salon. They had a ton of colors, and their dip selection had matching…',
    author: 'Lyric O.',
    source: 'Google',
  },
  {
    quote: 'Wonderful place — very detailed work, great prices, family owned business.',
    author: 'Google review',
    source: 'Google',
  },
  {
    quote: 'The staff is very kind and the place is very clean.',
    author: 'Google review',
    source: 'Google',
  },
  {
    quote: 'Price, service and people are all wonderful.',
    author: 'Google review',
    source: 'Google',
  },
];

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * PLACEHOLDER IMAGERY. These are procedurally rendered colour studies, not
 * photographs of the salon's work — see scripts/generate-images.mjs and the
 * README. Replace the files at these paths with real photography and update
 * each `alt` to describe the actual work shown.
 */
export const GALLERY = [
  { src: '/img/work-01.webp', alt: 'Placeholder — warm nude lacquer colour study' },
  { src: '/img/work-02.webp', alt: 'Placeholder — smoke grey lacquer colour study' },
  { src: '/img/work-03.webp', alt: 'Placeholder — terracotta lacquer colour study' },
  { src: '/img/work-04.webp', alt: 'Placeholder — deep sage lacquer colour study' },
  { src: '/img/work-05.webp', alt: 'Placeholder — golden amber lacquer colour study' },
  { src: '/img/work-06.webp', alt: 'Placeholder — soft taupe lacquer colour study' },
  { src: '/img/work-07.webp', alt: 'Placeholder — dusty plum lacquer colour study' },
  { src: '/img/work-08.webp', alt: 'Placeholder — cool teal lacquer colour study' },
] as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#visit', label: 'Visit' },
] as const;
