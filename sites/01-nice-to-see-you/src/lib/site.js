/**
 * Every fact on this page comes from here, and everything here came from the
 * supplied brief. Nothing is invented — no hours table, no email address, no
 * awards, no social links (no URLs were supplied, so there are no icons).
 */

export const BUSINESS = {
  name: 'Nice To See You',
  wordmark: 'NICE TO SEE YOU',
  street: '30 Goodramgate',
  city: 'York',
  postcode: 'YO1 7LG',
  phoneDisplay: '+44 7707 559048',
  phoneHref: 'tel:+447707559048',
  priceRange: '£10–20 per person',
  ratingValue: '4.6',
  ratingCount: '434',
}

export const ADDRESS_ONE_LINE = `${BUSINESS.street}, ${BUSINESS.city} ${BUSINESS.postcode}`

/** A plain Google Maps search for the address — no API key, no tracking. */
export const DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(`${BUSINESS.name}, ${ADDRESS_ONE_LINE}, United Kingdom`)

/** Real, supplied Google reviews. Attributed by first name, as given. */
export const REVIEWS = [
  {
    quote: 'Then we had a selection of main meals — again quality, tasty, fresh food.',
    name: 'Andrea Payne',
  },
  { quote: 'I ordered a chai latte and a polish breakfast plate.', name: 'Cillian Hanna' },
  { quote: 'Excellent choice, generous servings, yummy and great service.', name: 'Amy' },
]

/** Only what the brief lists. Not extended. */
export const COUNTER = [
  {
    name: 'Orange & cranberry scones',
    note: 'Served with clotted cream and jam. The thing people come back for.',
  },
  { name: 'Avocado on toast', note: 'From the brunch menu.' },
  { name: 'Polish breakfast plate', note: null },
  { name: 'Chai latte, matcha, frappuccino', note: null },
  { name: 'Cakes, brownies and scones', note: 'On the counter display, priced on the chalkboards.' },
  { name: 'Fresh juices and smoothies', note: null },
]

export const IMG = (file) => `${import.meta.env.BASE_URL}images/${file}`
