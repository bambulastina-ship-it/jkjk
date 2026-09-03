/* The menu, transcribed verbatim from assets/business-5/BRIEF.md.
   Every price here must match that file exactly. Nothing added, nothing dropped. */

export const menu = [
  {
    id: 'soups',
    title: 'Home Made Soups',
    note: 'See our daily specials board — what is in the pot changes with the day.',
    items: [
      { name: 'Take away', qual: 'from', price: '£4.50' },
      { name: 'Eat in', qual: 'from', price: '£5.50' },
      { name: 'Seeded bakers roll', price: '50p' },
    ],
  },
  {
    id: 'potatoes',
    title: 'Oven Baked Potatoes',
    note: 'With salad garnish.',
    items: [
      { name: 'Chilli Beef / Tuna / Coronation Chicken', price: '£7.50' },
      { name: 'Baked Beans / Cheese & Coleslaw', price: '£6.50' },
    ],
  },
  {
    id: 'toasties',
    title: 'Delicious Oozing Toasties',
    items: [
      { name: 'Cheese & Tomato', price: '£5.50' },
      { name: 'Ham & Cheese', price: '£5.50' },
      { name: 'Cheese & Onion', price: '£5.50' },
      {
        name: 'New Yorker',
        desc: 'pastrami, Swiss cheese, red onion, gherkin, American mustard',
        price: '£6.00',
      },
      { name: 'Italian', desc: 'mozzarella, pesto, tomato & rocket', price: '£6.00' },
      { name: 'Smokey Spanish', desc: 'chorizo, smoked or cheddar, tomato, rocket', price: '£6.00' },
      { name: 'Tuna Melt', desc: 'tuna mayo, red onion, melted cheese', price: '£6.00' },
      {
        name: 'Coronation Chicken',
        desc: 'curried chicken, mango chutney & melted cheese',
        price: '£6.00',
      },
    ],
  },
  {
    id: 'hot-drinks',
    title: 'Hot Drinks',
    split: true,
    items: [
      { name: 'Americano', price: '£3.25' },
      { name: 'Cappuccino', price: '£3.65' },
      { name: 'Latte', price: '£3.65' },
      { name: 'Flat White', price: '£3.65' },
      { name: 'Espresso', price: '£2.75' },
      { name: 'Tea', price: '£2.50' },
      { name: 'Earl Grey', price: '£3.00' },
      { name: 'Green Tea', price: '£3.00' },
      { name: 'Camomile', price: '£3.00' },
      { name: 'Hot Chocolate', price: '£3.65' },
      { name: 'Alpine Hot Chocolate', price: '£4.00' },
      { name: 'Fresh Lemon & Ginger', price: '£3.50' },
    ],
    foot: 'Milk alternative add 30p.',
  },
  {
    id: 'cold-drinks',
    title: 'Cold Drinks',
    split: true,
    items: [
      { name: 'Freshly squeezed orange juice', price: '£3.50' },
      { name: 'Soft drinks', price: '£2.50' },
      { name: 'Water', price: '£1.50' },
    ],
  },
]

export const reviews = [
  {
    quote: 'Location, staff and food quality were all excellent, staff super friendly.',
    name: 'Graham Harrington',
  },
  {
    quote: 'Served with top quality sourdough bread, toasted and buttered.',
    name: 'John S',
  },
  {
    quote: 'Absolutely fabulous, great coffee, lovely atmosphere and the food is delicious!',
    name: 'Trevor Marks',
  },
]

export const business = {
  name: 'SoupChick',
  unit: 'Unit 5 and 6',
  venue: 'The Shambles Market Hall',
  town: 'Devizes',
  postcode: 'SN10 1JG',
  phoneHref: 'tel:+447449114195',
  phoneLabel: '07449 114195',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=SoupChick%2C%20The%20Shambles%20Market%20Hall%2C%20Devizes%20SN10%201JG',
}
