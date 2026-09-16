import before1 from './assets/before-1.png'
import after1 from './assets/after-1.png'
import inProgress1 from './assets/in-progress-1.jpg'
import client1 from './assets/client-1.jpg'
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

  /**
   * Before/after pairs. Same room, same angle — that is what makes them
   * evidence rather than decoration.
   * TODO: `duration` is unconfirmed; the owner has not supplied it yet.
   */
  beforeAfter: [
    {
      id: 'bathroom-1',
      before: before1,
      after: after1,
      title: 'Bathroom rebuild',
      body: 'Stripped back to the studs, waterproofed, then tiled and fitted with a glass shower enclosure.',
      duration: '',
    },
  ],

  /**
   * Real client testimonial, spoken on camera in Punjabi/Hindi and translated
   * by the owner. The words are hers, only lightly cleaned of transcription
   * artefacts — nothing added, nothing embellished.
   * TODO: confirm her name, city, and that she is happy to be quoted; add the
   * reel link so a visitor can verify it for themselves.
   */
  testimonial: {
    quote:
      'Harpreet, Lucky, Inder \u2014 the entire team. Thank you very much. We work by the grace of God. May your business shine brightly with the blessings of God.',
    attribution: 'Homeowner',
    location: '',
    translatedFrom: 'Punjabi',
    reelUrl: '',
    photo: client1,
  },

  work: [
    { src: project1, caption: 'Finished basement' },
    { src: project2, caption: 'Recent project' },
    { src: project3, caption: 'Recent project' },
    { src: inProgress1, caption: 'Tiling in progress' },
    { src: client1, caption: 'Handing over a finished job' },
  ],
} as const
