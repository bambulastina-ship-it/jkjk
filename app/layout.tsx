import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';
import {
  ADDRESS_LINE,
  BUSINESS,
  HOURS,
  HOURS_SUMMARY,
  RATINGS,
} from '@/lib/content';

/* ---------------------------------------------------------------------------
   Typography. See README "Design notes" for why this trio.
   `display: 'swap'` means text paints in the fallback immediately rather than
   blocking on the webfont.
   ------------------------------------------------------------------------ */

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  variable: '--font-public-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-jetbrains',
});

/* ---------------------------------------------------------------------------
   SEO
   ------------------------------------------------------------------------ */

// Set to the real domain at deploy time; used to absolutise OG/canonical URLs.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://daisynailscoloradosprings.com';

const DESCRIPTION =
  `Family-run nail salon in ${BUSINESS.city}, ${BUSINESS.state}. Manicures, ` +
  `pedicures, full sets, dip and ombré, nail art and facial waxing. ` +
  `Walk-ins welcome — ${HOURS_SUMMARY}. Call ${BUSINESS.phone}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} — Nail Salon in ${BUSINESS.city}, ${BUSINESS.state}`,
    template: `%s · ${BUSINESS.shortName}`,
  },
  description: DESCRIPTION,
  applicationName: BUSINESS.name,
  keywords: [
    'nail salon Colorado Springs',
    'manicure Colorado Springs',
    'pedicure Colorado Springs',
    'dip powder nails',
    'ombré nails',
    'nail art',
    'facial waxing',
    BUSINESS.center,
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} — Nail Salon in ${BUSINESS.city}, ${BUSINESS.state}`,
    description: DESCRIPTION,
    locale: 'en_US',
    images: [
      {
        url: '/img/og.jpg',
        width: 1200,
        height: 630,
        alt: `${BUSINESS.name} — ${ADDRESS_LINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS.name} — Nail Salon in ${BUSINESS.city}`,
    description: DESCRIPTION,
    images: ['/img/og.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#17150f',
  // Never block zoom — pinch-zoom is an accessibility feature.
  width: 'device-width',
  initialScale: 1,
};

/**
 * LocalBusiness structured data. Built from the same constants the visible page
 * renders, so the two can never disagree. `aggregateRating` reports only the
 * Google figures actually published for the salon.
 */
function localBusinessJsonLd() {
  const google = RATINGS[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    '@id': `${SITE_URL}/#business`,
    name: BUSINESS.name,
    alternateName: BUSINESS.shortName,
    description: DESCRIPTION,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    image: `${SITE_URL}/img/og.jpg`,
    // Derived from the published menu itself ($15–$80), not guessed.
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.zip,
      addressCountry: 'US',
    },
    sameAs: [BUSINESS.facebook],
    openingHoursSpecification: HOURS.filter((h) => h.opens && h.closes).map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${h.schemaDay}`,
      opens: h.opens,
      closes: h.closes,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: google.score,
      reviewCount: google.count,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${publicSans.variable} ${jetbrains.variable}`}
      // The inline script below adds `js-motion` to this element before React
      // hydrates, so the server and client class lists differ by design.
      suppressHydrationWarning
    >
      <body>
        {/*
          Opt the page into scroll-reveal animation. This runs synchronously
          before anything below it paints, so there is no flash of visible
          content — and if it never runs (JS disabled, script error), the
          content simply stays visible, which is the safe failure.
          Reduced-motion users are left out of it entirely.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)" +
              "document.documentElement.classList.add('js-motion')}catch(e){}",
          }}
        />
        {/* First tab stop on the page — required for keyboard users to get past
            the nav to the content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-bone"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          // Content is built from local constants, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </body>
    </html>
  );
}
