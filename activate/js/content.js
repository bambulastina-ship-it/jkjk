/* ==========================================================================
   Activate Unisex Fitness Studio — editable content
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to change what the website says.
   Nothing here is invented: every fact and every review below was supplied
   by the studio. Do not add claims, prices or qualifications that are not
   confirmed.
   ========================================================================== */

var STUDIO = {
  name: 'Activate Unisex Fitness Studio',
  phoneDisplay: '090429 31302',
  phoneLink: 'tel:+919042931302',
  phone2Display: '89406 23223',
  phone2Link: 'tel:+918940623223',
  instagram: 'https://www.instagram.com/activatefitnessstudio/',
  address: {
    line1: 'Ground Floor & First Floor, BR. OGI Complex, No. 45/3',
    line2: 'Nelson Rd, near Hotel Thayar, Srirangam, Thiruvanaikoil',
    line3: 'Tiruchirappalli, Tamil Nadu 620005',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(
      'Activate Unisex Fitness Studio, Nelson Rd, Srirangam, Tiruchirappalli, Tamil Nadu 620005'
    )
  },
  // Confirmed opening hours.
  hours: {
    short: 'Open until 9 PM',
    full: [
      { days: 'Monday \u2013 Saturday', time: '5:00 AM \u2013 9:00 PM' },
      { days: 'Sunday',                 time: '7:00 AM \u2013 11:00 AM' }
    ]
  }
};

/* --------------------------------------------------------------------------
   Images — drop files into assets/images/ using these exact names.
   Any entry left missing simply does not render; the layout stays intact.
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   Hero background video (optional).
   Put the YouTube video ID in `youtubeId` - for a link like
   https://www.youtube.com/watch?v=AbCdEf12345 the ID is AbCdEf12345.
   Leave it null and the hero simply uses the poster photo.

   Notes: the video is always muted and looping (browsers block autoplay with
   sound), and it is deliberately skipped on phones and on slow connections,
   where it would cost data and often will not autoplay anyway.
   -------------------------------------------------------------------------- */
var HERO_VIDEO = {
  youtubeId: null,
  start: 0          // optional: second to start from, e.g. 12
};

var IMAGES = {
  logo:  'assets/images/04.jpg',
  hero:  'assets/images/03.png',
  owner: 'assets/images/a1.png',
  gallery: [
    // Add more studio photos here to switch the gallery section on, e.g.
    // { src: 'assets/images/gym-01.jpg', alt: 'Inside Activate Unisex Fitness Studio' }
  ]
};

/* --------------------------------------------------------------------------
   Client testimonials — REAL Google reviews, reproduced verbatim.
   Never edit the wording, never add a review that was not actually left.
   All four are confirmed 5-star Google reviews.
  
   -------------------------------------------------------------------------- */
var TESTIMONIALS = [
  {
    name: 'Mritthika Ramanujam',
    meta: '3 months ago',
    rating: 5,
    quote: 'I really love this gym and the atmosphere here is really motivating. The gym is well maintained, well equipped. All trainers here are som much supportive, makes us comfortable and care for us. Customised workout and diet chart is one the main reason that makes this gym more efficient and reliable. If you want a new experience for working out you can try this for sure !'
  },
  {
    name: 'Jeffrey Caleb',
    meta: '4 months ago',
    rating: 5,
    quote: 'Absolutely loving my experience at this gym! The environment is very positive, motivating, and well-maintained. The equipment is great, the atmosphere feels energetic, and it’s a perfect place to stay consistent with workouts.\n\nA special mention to the trainer — very supportive, knowledgeable, and always encouraging everyone to push their limits safely. Their guidance really makes a huge difference. Highly recommended for anyone looking for a good gym with an amazing vibe and professional training!'
  },
  {
    name: 'Aswitha Subramanian',
    meta: '3 months ago',
    rating: 5,
    quote: 'I joined this gym before 2 months, and my experience has been very positive. The coach is supportive and always willing to help with proper workout techniques. I really liked the gym atmosphere. I’ve noticed a huge improvement in my body and fitness. The coach not only guides me during workouts but also provided a personalized diet chart. I’m very happy with my progress.'
  },
  {
    name: 'Ganesh kumar M',
    meta: '3 months ago',
    rating: 5,
    quote: 'As a complete beginner, I was a little nervous about joining a gym for the first time. But from day one, I felt comfortable and welcomed.\n\nThe gym is very neat, clean, and well-maintained, creating a positive and motivating atmosphere to work out. The trainers are friendly, supportive, and always ready to guide.\n\nI’m really happy with my experience so far and excited to continue my fitness journey. Highly recommended for anyone looking to start their fitness journey!'
  }
];

/* --------------------------------------------------------------------------
   Services - exactly as the studio lists them on its own material.
   Nothing here is invented; do not add to it without the studio's say-so.
   -------------------------------------------------------------------------- */
var SERVICES = [
  'General Fitness',
  'Strength Training',
  'Weight Loss',
  'Muscle Gain',
  'Hypertension',
  'Posture Correction',
  'Nutrition',
  'Core Strengthening',
  'Powerlifting',
  'Body Building',
  'PCOD & PCOS',
  'Workout Cards Based On BMI'
];
