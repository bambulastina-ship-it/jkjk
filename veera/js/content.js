/* ==========================================================================
   Veera Gym Fitness — editable content
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to change what the site says.
   Nothing here is invented. Every fact and every review came from the gym.
   Do not add prices, certifications, trainer counts or claims that are not
   confirmed.
   ========================================================================== */

var GYM = {
  name: 'Veera Gym Fitness',
  phoneDisplay: '094874 21801',
  phoneLink: 'tel:+919487421801',
  instagram: 'https://www.instagram.com/veeragym/',
  established: '2018',
  hours: 'Open 24 hours, every day',
  /* Both branches share this number and these hours. */
  branches: [
    {
      area: 'Kilapudur',
      address: 'Kilapudur, Tiruchirappalli, Tamil Nadu 620001',
      maps: 'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent('Veera Gym Fitness, Kilapudur, Tiruchirappalli, Tamil Nadu 620001')
    },
    {
      area: 'Edamalaipatti Pudur',
      address: 'Crawford Colony Main Rd, Bharathi Nagar, Crawford Colony, ' +
               'Edamalaipatti Pudur, Tiruchirappalli, Tamil Nadu 620012',
      maps: 'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent('Veera Fitness Studio, Crawford Colony Main Rd, Edamalaipatti Pudur, Tiruchirappalli, Tamil Nadu 620012')
    }
  ],
  ratings: [
    { score: '4.8', source: 'Google',   count: '695 reviews' },
    { score: '4.9', source: 'Justdial', count: '297 votes'   }
  ]
};

/* Service options listed by the business. */
var AMENITIES = ['Shower', 'Online classes', 'On-site parking', 'Air-conditioned'];

/* Stat band — real numbers only. */
var STATS = [
  { value: '4.8',  label: 'Google · 695 reviews',  star: true },
  { value: '4.9',  label: 'Justdial · 297 votes',  star: true },
  { value: '24/7', label: 'Always open' },
  { value: '2',    label: 'Locations in Trichy' }
];

/* --------------------------------------------------------------------------
   Images. Filenames are set once the client's photos are uploaded.
   Anything left null simply does not render; the layout stays intact.
   -------------------------------------------------------------------------- */
var IMAGES = {
  logo:  null,
  // Wide shot of the whole floor - the warmest, most complete image supplied.
  hero:  { src: 'assets/images/v2.png', alt: 'The training floor at Veera Gym Fitness' },
  experience: [
    { src: 'assets/images/v1.png', alt: 'Resistance machines on the floor at Veera Gym Fitness' }
  ],
  // The two screenshots are only 325px wide, so they are used as small tiles
  // only - blown up they look cheap.
  gallery: [
    { src: 'assets/images/v2.png', alt: 'The training floor at Veera Gym Fitness', wide: true },
    { src: 'assets/images/Screenshot_2026-09-21_204813.png', alt: 'Machines and free weights at Veera Gym Fitness' },
    { src: 'assets/images/Screenshot_2026-09-21_204747.png', alt: 'Punching bag and turf area at Veera Gym Fitness' },
    { src: 'assets/images/v1.png', alt: 'Resistance machines at Veera Gym Fitness' },
    { src: 'assets/images/Screenshot_2026-09-21_205601.png', alt: 'Veera Sports & Trophies medal' }
  ]
};

/* --------------------------------------------------------------------------
   Services, as supplied by the gym. Descriptions are neutral notes on each
   discipline - they claim nothing specific about how Veera runs them.
   -------------------------------------------------------------------------- */
var SERVICES = [
  { name: 'Weight Training',     icon: 'dumbbell', body: 'Free weights and machines for building strength and muscle.' },
  { name: 'CrossFit',            icon: 'bolt',     body: 'Varied functional training at intensity - lifting, conditioning and bodyweight work.' },
  { name: 'Yoga',                icon: 'lotus',    body: 'Guided postures, breathing and mobility work at a measured pace.' },
  { name: 'Aerobics',            icon: 'pulse',    body: 'Group cardio sessions built around continuous movement.' },
  { name: 'Cycling',             icon: 'cycle',    body: 'Indoor cycling for endurance and conditioning.' },
  { name: 'Youth Classes',       icon: 'youth',    body: 'Structured sessions for younger members, scaled to age and ability.' },
  { name: 'Adult Sports',        icon: 'sports',   body: 'Organised sport and group activity for adult members.' },
  { name: 'Nutrition Consulting',icon: 'leaf',     body: 'One-to-one guidance on eating to support your training.' }
];

/* Confirmed strengths, in the gym's own terms. */
var STRENGTHS = [
  'Spacious training floor',
  'Fully air-conditioned',
  'Well-equipped',
  'Clean and well-maintained',
  'Helpful trainers and instructors',
  'Customised workouts',
  'Suits every fitness level'
];

/* --------------------------------------------------------------------------
   Client testimonials - REAL Google reviews, reproduced verbatim.
   All confirmed 5-star. Never edit the wording, never add a review that was
   not actually left.
   -------------------------------------------------------------------------- */
var TESTIMONIALS = [
  {
    name: 'Thowfeek 11th A CS',
    meta: '9 months ago',
    rating: 5,
    quote: 'Gym equipment arrangements are good and sufficient space for doing workouts and piece full atmosphere with effective for gymnastics. Comfortable Workouts timings . Overall Excellent.'
  },
  {
    name: 'THANISH IRAESHA',
    meta: 'Edited 5 years ago',
    rating: 5,
    quote: 'I had an best opportunity to join here....an amazing gym for beginners, intermediates, professionals...well trained trainers are here to guide you to the core and make you,feel you cozy and comfy...and make u get the best results u wont even thought of'
  },
  {
    name: 'Rampandu',
    meta: '7 months ago',
    rating: 5,
    quote: 'Very satisfied with the yoga class. Good guidance and positive energy in each session'
  },
  {
    name: 'ani Priya',
    meta: '7 months ago',
    rating: 5,
    quote: 'Yoga classes are very effective and well guided. The trainer gives personal attention and corrects postures patiently.'
  },
  {
    name: 'SRY TRY 6D J.ASHWIN',
    meta: 'via Google',
    rating: null,
    quote: 'Great gym with awesome vibes, quality equipment, and motivating trainers.'
  },
  {
    name: 'bharu guru',
    meta: 'via Google',
    rating: null,
    quote: 'It was a very relaxing place and I really enjoyed every single day.'
  },
  {
    name: 'Roobben Sanjay',
    meta: 'via Google',
    rating: null,
    quote: 'The ambiance are good coaches are very friendly and good work out day to day'
  },
  {
    name: 'Shenbaga Raj',
    meta: 'Edited 2 years ago',
    rating: 5,
    quote: 'Best gym in Trichy veera gym palakarai fitness studio and most the people suggest it and am also recommended this gym'
  }
];
