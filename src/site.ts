import project1 from './assets/project-1.jpg'
import project2 from './assets/project-2.jpg'
import project3 from './assets/project-3.jpg'

/**
 * Single source of truth for business content.
 *
 * REVIEW BEFORE LAUNCH: entries marked [ASSUMED] are sensible defaults for a
 * general renovation contractor and were NOT supplied by the owner. Confirm or
 * correct them — see README.md.
 */
export const site = {
  name: 'Malwa Belt Renovations',
  legalName: 'Malwa Belt Renovations Ltd.',
  phoneDisplay: '+1 (365) 440-3466',
  phoneHref: 'tel:+13654403466',
  instagram: 'https://www.instagram.com/malwabeltrenovations/',
  instagramHandle: '@malwabeltrenovations',

  /** [ASSUMED] */ serviceArea: 'Greater Toronto & Hamilton Area',
  /** [ASSUMED] */ hours: 'Mon–Sat, 8am – 7pm',
  /** [ASSUMED] */ yearsLabel: '10+ years',

  services: [
    { id: 'basements', title: 'Basement Finishing', body: 'Full basement builds — framing, insulation, drywall, flooring and finishing. Legal-height and egress work included.' },
    { id: 'kitchens', title: 'Kitchens & Bathrooms', body: 'Complete remodels from demolition to final fixtures. Cabinetry, tile, plumbing coordination and finish carpentry.' },
    { id: 'framing', title: 'Framing & Drywall', body: 'Structural framing, partition walls, drywall board, taping and a properly sanded, paint-ready finish.' },
    { id: 'painting', title: 'Painting & Finishing', body: 'Interior and exterior painting, trim, baseboards, doors and crown moulding — cut in clean and built to last.' },
    { id: 'exterior', title: 'Decks & Exteriors', body: 'Decks, fences, railings and exterior repairs built to withstand Ontario winters.' },
    { id: 'whole-home', title: 'Full Home Renovations', body: 'Whole-property renovations managed end to end, on one schedule with one point of contact.' },
  ],

  process: [
    { title: 'Call for a quote', body: 'Tell us what you have in mind. We visit the property, take measurements and answer questions — no obligation.' },
    { title: 'Written estimate', body: 'You get an itemised estimate with a clear scope and timeline. No vague numbers and no surprises later.' },
    { title: 'We build it', body: 'A tidy site, daily updates and work that passes inspection. We are not finished until you have walked it with us.' },
  ],

  work: [
    { src: project1, caption: 'Recent project' },
    { src: project2, caption: 'Recent project' },
    { src: project3, caption: 'Recent project' },
  ],
} as const
