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
  address: {
    line1: 'Kilapudur',
    line2: 'Tiruchirappalli, Tamil Nadu 620001',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' +
             encodeURIComponent('Veera Gym Fitness, Kilapudur, Tiruchirappalli, Tamil Nadu 620001')
  },
  hours: 'Open 24 hours, every day',
  rating: { score: '4.8', count: '695' }
};

/* Stat band — real numbers only. */
var STATS = [
  { value: '4.8',  label: 'Google rating',  star: true },
  { value: '695',  label: 'Reviews' },
  { value: '24/7', label: 'Always open' },
  { value: '8',    label: 'Disciplines' }
];

/* --------------------------------------------------------------------------
   Images. Filenames are set once the client's photos are uploaded.
   Anything left null simply does not render; the layout stays intact.
   -------------------------------------------------------------------------- */
var IMAGES = {
  logo:  null,
  hero:  null,
  owner: null,
  experience: [],
  gallery: []
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
    name: 'Shenbaga Raj',
    meta: 'Edited 2 years ago',
    rating: 5,
    quote: 'Best gym in Trichy veera gym palakarai fitness studio and most the people suggest it and am also recommended this gym'
  }
];
