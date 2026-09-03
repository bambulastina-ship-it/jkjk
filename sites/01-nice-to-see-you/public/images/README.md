# Photography

The five photographs below are referenced by the page but are **not on disk
yet** — they were shown in chat, not supplied as files. Until they land, every
frame holds a warm solid tone at the correct aspect ratio, so the layout reads
properly and nothing shifts when the real file arrives.

Drop the files in **this directory** with these exact names.

| File | Shape | Where it appears | The photograph |
|---|---|---|---|
| `shopfront.jpg` | portrait ~3:4 | Hero, right-hand column | Glossy black shopfront, white fascia with NICE TO SEE YOU in spaced black capitals, four tall arched windows with black glazing bars, door open, York stone kerb, bright daylight |
| `espresso.jpg` | landscape ~4:3 | Full-bleed band under the story | Branded matte-dark cup and saucer on dark wood, white "NICE TO SEE YOU Cafe" on the cup, golden crema, water glass and coffee-bean jar behind, shallow depth of field |
| `interior.jpg` | portrait ~3:4 | "The signature" two-up, left | Inside looking out — wooden tiered counter display of cakes, scones and brownies with chalkboard price tags, glowing pendant bulb, rubber plant, street beyond with the pink-awninged pizzeria opposite |
| `pancakes.jpg` | portrait ~3:4 | "On the counter" two-up, right | Tall pancake stack, sliced banana, caramel sauce, crumb topping, icing sugar, small syrup pot, matte grey plate |
| `juice.jpg` | portrait ~3:4 | "The shop" aside, left column | Fresh orange juice, crushed ice, mint sprig, dried orange slice, two black straws, halved orange, light wood, hard sunlight |

Notes for whoever drops them in:

- Nothing is ever stretched. Each frame is `object-fit: cover` inside a fixed
  `aspect-ratio`, with a chosen `object-position`; a photo that is a little off
  the stated ratio will simply crop, not distort.
- Roughly 1600px on the long edge is plenty. Keep them under ~400 kB each.
- Another extension (`.webp`, `.png`) is fine — change the `file=` prop on the
  matching `<Photo>` in `src/components/`.
- The alt text is already written against these exact photographs, in
  `src/components/Hero.jsx`, `Story.jsx`, `BleedBand.jsx`, `Signature.jsx` and
  `Counter.jsx`. If a different photo is substituted, rewrite the alt text too.
