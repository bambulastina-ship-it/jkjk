# Activate Unisex Fitness Studio

Landing page and brand image assets for **Activate Unisex Fitness Studio**, Srirangam, Tiruchirappalli.

- **Phone:** [090429 31302](tel:+919042931302)
- **Address:** Ground Floor & First Floor, BR. OGI Complex, No. 45/3, Nelson Rd, near Hotel Thayar, Srirangam, Thiruvanaikoil, Tiruchirappalli, Tamil Nadu 620005
- **Instagram:** https://www.instagram.com/activatefitnessstudio/

---

## Uploading photos

Put every image in **`assets/images/`**. Use these exact filenames — the site looks for them by name,
so a photo dropped in with the right name appears on the site with no code change.

| Upload as | Where it appears | Notes |
|---|---|---|
| `logo.png` | Header + 3s loader | Transparent PNG if possible |
| `hero.jpg` | Hero background | Landscape / wide, high resolution |
| `owner.jpg` | Gym Master section | Portrait of the owner / gym master, shown large in the foreground |
| `gym-01.jpg` … `gym-08.jpg` | Experience section + gallery | Real gym, equipment and workout shots |
| `trainer-01.jpg`, `trainer-02.jpg` … | Trainers row (optional) | Only used if supplied |

**To upload from the browser:** open [`assets/images`](../../upload/main/assets/images), drag the
files in, then press *Commit changes*.

Tips
- Keep files under ~500 KB each where possible so the page stays fast.
- Landscape shots work best for `hero.jpg` and the wide gallery cells.
- Filenames are case-sensitive: `gym-01.jpg`, not `GYM-01.JPG`.

---

## Editing text content

All client-editable text lives in **`js/content.js`** — testimonials, services and the image list.
Edit that one file to change what the page says; no other file needs touching.

## Running locally

No build step, no dependencies.

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080
