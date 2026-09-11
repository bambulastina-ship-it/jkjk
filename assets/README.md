# assets

Drop the lead advisor portrait here as **`eliza-reed.png`** (`.jpg`, `.jpeg` and
`.webp` are also picked up — see `PORTRAIT_SOURCES` in `js/ProfileCard.js`).

The image is rendered with `object-cover` inside a 280×180 frame and masked by
`.profile-blend`, an elliptical alpha falloff that dissolves the edges into the
black ground so the photograph reads as part of the page rather than a crop box.
A landscape source works best; the subject should sit near the centre of the
frame, which is the fully opaque part of the mask.

If no file is present the card falls back to an `ER` monogram set in Instrument
Serif, so the layout never breaks.
