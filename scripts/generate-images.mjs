/**
 * ============================================================================
 * PLACEHOLDER IMAGERY GENERATOR — Daisy Nails
 * ----------------------------------------------------------------------------
 * !!! ALL IMAGERY PRODUCED BY THIS SCRIPT IS A PLACEHOLDER. !!!
 *
 * The brief's source photo (/ascii-editor/demos/generated/ref-029.webp) is not
 * present in this project and outbound image CDNs are blocked in this
 * environment, so every image is rendered procedurally here instead of being
 * sourced. Swap in real photography before launch — see README.md
 * ("Replacing the placeholder imagery"). Filenames and aspect ratios are the
 * contract; drop real files at the same paths and nothing else needs to change.
 *
 * The hero source is a macro daisy: the salon is called Daisy Nails and the
 * hero treatment is called "Ink Garden", so the flower does double duty as
 * brand motif and as a high-contrast, centre-weighted luminance subject — which
 * is exactly what the dither/ASCII grid needs to read well.
 *
 * Run: npm run gen:images
 * ==========================================================================*/

import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';
import {
  Surface, hex, mix, scale, clamp01, smoothstep, mulberry32, fbm,
} from './lib-raster.mjs';

const OUT = 'public/img';

/* -------------------------------------------------------------------------- */
/* 1. Hero source — macro daisy                                               */
/* -------------------------------------------------------------------------- */

/**
 * Renders a single daisy bloom lit from the upper-left against a dark,
 * out-of-focus garden ground.
 *
 * Tonal design is driven by what the ASCII pipeline needs:
 *  - a bright, clearly-shaped subject (petals) so glyph density traces form,
 *  - a mid-tone golden disc centre so the middle of the histogram is populated,
 *  - a dark, low-detail ground so the effect's grid does not turn to mush.
 */
function renderDaisy(w, h) {
  const s = new Surface(w, h);
  const rnd = mulberry32(20240831);

  const cx = w * 0.5;
  const cy = h * 0.47;
  const unit = Math.min(w, h); // scale-independent sizing

  // --- Ground: deep garden shadow with a soft warm light pool -------------
  const deep = hex('#141a11');
  const mossy = hex('#2c3826');
  const warmAir = hex('#6b6a3a');

  s.fill((x, y) => {
    const nx = x / w, ny = y / h;
    // Broad diagonal falloff: light enters from the upper left.
    const d = Math.hypot(nx - 0.28, ny - 0.2);
    let c = mix(mossy, deep, smoothstep(0.15, 1.0, d));
    // Low-frequency foliage mottling keeps the ground from banding.
    const n = fbm(nx * 3.2, ny * 3.2, 4, 7);
    c = mix(c, mossy, (n - 0.5) * 0.55);
    // Warm haze in the light pool.
    c = mix(c, warmAir, 0.18 * smoothstep(0.75, 0.0, d));
    return c;
  });

  // --- Bokeh: out-of-focus highlights behind the bloom --------------------
  const bokeh = [];
  for (let i = 0; i < 26; i++) {
    bokeh.push({
      x: rnd() * w,
      y: rnd() * h,
      r: unit * (0.02 + rnd() * 0.06),
      a: 0.05 + rnd() * 0.16,
      c: mix(hex('#c9b86a'), hex('#9fae70'), rnd()),
    });
  }
  for (const b of bokeh) {
    const x0 = Math.max(0, (b.x - b.r) | 0), x1 = Math.min(w - 1, (b.x + b.r) | 0);
    const y0 = Math.max(0, (b.y - b.r) | 0), y1 = Math.min(h - 1, (b.y + b.r) | 0);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - b.x, y - b.y) / b.r;
        if (d > 1) continue;
        // Defocused discs are near-flat with a brighter rim, not gaussian.
        const disc = smoothstep(1, 0.82, d) * (0.75 + 0.45 * smoothstep(0.55, 0.98, d));
        s.add((y * w + x) * 3, b.c, b.a * disc);
      }
    }
  }
  s.blur(unit * 0.012, 2); // push the whole ground out of focus

  // --- Petals -------------------------------------------------------------
  // Two rings: a back ring (longer, darker, offset) reading as depth, and a
  // front ring catching the key light.
  const petalWhite = hex('#fbf6e6');
  const petalShadow = hex('#7e7c68');
  const petalCool = hex('#b9bcae');

  const rings = [
    { count: 16, rIn: 0.085, rOut: 0.415, width: 0.052, phase: 0.19, dim: 0.55, bend: 0.22 },
    { count: 15, rIn: 0.075, rOut: 0.355, width: 0.056, phase: 0.0, dim: 1.0, bend: 0.16 },
  ];

  // Key light direction in image space (upper-left), used for petal shading.
  const LX = -0.55, LY = -0.72, LZ = 0.42;

  for (const ring of rings) {
    for (let p = 0; p < ring.count; p++) {
      // Per-petal jitter so the bloom never reads as a machine-made rosette.
      const jitterA = (rnd() - 0.5) * 0.09;
      const theta = (p / ring.count) * Math.PI * 2 + ring.phase + jitterA;
      const lenK = 1 + (rnd() - 0.5) * 0.18;
      const widK = 1 + (rnd() - 0.5) * 0.22;

      const rIn = unit * ring.rIn;
      const rOut = unit * ring.rOut * lenK;
      const a = (rOut - rIn) / 2;          // semi-length along the radius
      const b = unit * ring.width * widK;  // semi-width across the petal
      const mid = (rIn + rOut) / 2;
      const ct = Math.cos(theta), st = Math.sin(theta);
      const pcx = cx + ct * mid, pcy = cy + st * mid;

      // Conservative bounding box for the rotated petal.
      const ext = Math.hypot(a, b) + 2;
      const x0 = Math.max(0, (pcx - ext) | 0), x1 = Math.min(w - 1, (pcx + ext) | 0);
      const y0 = Math.max(0, (pcy - ext) | 0), y1 = Math.min(h - 1, (pcy + ext) | 0);

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          // Rotate into petal-local space: u along the petal, v across it.
          const dx = x - pcx, dy = y - pcy;
          let u = dx * ct + dy * st;
          let v = -dx * st + dy * ct;
          // Petals curve; bend v as a function of u so tips sweep sideways.
          v -= ring.bend * (u / a) * (u / a) * b * Math.sign(jitterA || 1);
          // Taper: the petal narrows toward the tip.
          const taper = b * (1 - 0.42 * smoothstep(-0.2, 1, u / a));
          const un = u / a, vn = v / taper;
          const d2 = un * un + vn * vn;
          if (d2 > 1.35) continue;
          const edge = smoothstep(1.02, 0.86, Math.sqrt(d2));
          if (edge <= 0) continue;

          // Fake a cylindrical normal across the petal for lambert shading.
          const nv = clamp01(1 - vn * vn);
          const nz = Math.sqrt(nv);
          const nxs = vn * 0.9 * -st + un * 0.12 * ct;
          const nys = vn * 0.9 * ct + un * 0.12 * st;
          const lam = clamp01(nxs * LX + nys * LY + nz * LZ);

          let col = mix(petalShadow, petalWhite, 0.28 + 0.72 * Math.pow(lam, 0.85));
          // Cool bounce light along the shadowed edge.
          col = mix(col, petalCool, 0.3 * clamp01(-(nxs * LX + nys * LY)));
          // Petals darken where they tuck under the disc, brighten at the tip.
          const along = clamp01((u / a + 1) / 2);
          col = scale(col, 0.62 + 0.5 * smoothstep(0, 0.55, along));
          // Fine longitudinal veining.
          const vein = 0.94 + 0.06 * Math.sin(vn * 9 + p);
          col = scale(col, vein * ring.dim);

          s.blend((y * w + x) * 3, col, edge);
        }
      }
    }
  }

  // --- Golden disc florets ------------------------------------------------
  const discR = unit * 0.115;
  const discLit = hex('#f0c04e');
  const discMid = hex('#c08a2e');
  const discDark = hex('#5d3f11');

  for (let y = Math.max(0, (cy - discR * 1.3) | 0); y <= Math.min(h - 1, (cy + discR * 1.3) | 0); y++) {
    for (let x = Math.max(0, (cx - discR * 1.3) | 0); x <= Math.min(w - 1, (cx + discR * 1.3) | 0); x++) {
      const dx = (x - cx) / discR, dy = (y - cy) / discR;
      const d = Math.hypot(dx, dy);
      if (d > 1.06) continue;
      const edge = smoothstep(1.02, 0.9, d);
      // The disc is a shallow dome: shade it like a sphere lit upper-left.
      const nz = Math.sqrt(clamp01(1 - d * d));
      const lam = clamp01(dx * LX + dy * LY + nz * LZ);
      let col = mix(discDark, discMid, 0.35 + 0.65 * lam);
      col = mix(col, discLit, 0.55 * Math.pow(lam, 2.2));
      // Floret stipple — individual seed-florets in a tight spiral texture.
      const stip = fbm(x * 0.42, y * 0.42, 2, 91);
      col = scale(col, 0.72 + 0.56 * stip);
      // The disc rim sits in its own shadow.
      col = scale(col, 0.7 + 0.3 * smoothstep(1.0, 0.55, d));
      s.blend((y * w + x) * 3, col, edge);
    }
  }

  // Contact shadow: the bloom occludes the ground just beneath it.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot((x - cx) / (unit * 0.5), (y - cy - unit * 0.06) / (unit * 0.46));
      if (d > 1.6) continue;
      const shade = 0.28 * smoothstep(1.6, 0.95, d) * smoothstep(0.42, 0.95, d);
      if (shade <= 0) continue;
      const i = (y * w + x) * 3;
      s.data[i] *= 1 - shade; s.data[i + 1] *= 1 - shade; s.data[i + 2] *= 1 - shade;
    }
  }

  return s.toSRGB({ grain: 0.018, vignette: 0.42, seed: 4 });
}

/* -------------------------------------------------------------------------- */
/* 2. Gallery tiles — abstract polish/colour studies                          */
/* -------------------------------------------------------------------------- */

/**
 * Composition recipes for the gallery. These read as macro colour studies
 * (polish drops, gloss sweeps, soft focus fields) rather than fake photographs,
 * so they look deliberate while real work photos are pending.
 */
const TILES = [
  // --- Slots awaiting the salon's real photographs ------------------------
  // These four stand in for supplied photos at fixed paths. Overwrite the file,
  // keep the name, and nothing else needs to change. Colours here approximate
  // each intended photo so the layout previews truthfully.
  //   feature-coffin-chrome : long coffin nails, pink chrome / aura French
  //   feature-red-crystal   : deep red nails, rhinestones + snowflake art
  //   work-mauve-chrome     : short almond nails, mauve chrome
  //   salon-interior        : the pedicure room
  { file: 'feature-coffin-chrome', kind: 'sweep', base: '#7d5f7a', lift: '#f2cfe4', seed: 101 },
  { file: 'feature-red-crystal',   kind: 'drop',  base: '#7c1f2c', lift: '#f0b9ae', seed: 103 },
  { file: 'work-mauve-chrome',     kind: 'drop',  base: '#7a5f75', lift: '#e8cfe0', seed: 107 },
  { file: 'salon-interior',        kind: 'split', base: '#8a7358', lift: '#f0e2c6', seed: 109 },

  // --- Generic colour studies ---------------------------------------------
  { file: 'work-01', kind: 'drop',   base: '#8a5a4a', lift: '#e8c4a8', seed: 11 },
  { file: 'work-02', kind: 'sweep',  base: '#3d3a44', lift: '#c8b6c9', seed: 23 },
  { file: 'work-03', kind: 'rings',  base: '#7a3c3c', lift: '#e2a98c', seed: 37 },
  { file: 'work-04', kind: 'bokeh',  base: '#38432f', lift: '#d9d29a', seed: 41 },
  { file: 'work-05', kind: 'split',  base: '#5c4a2e', lift: '#efd9a8', seed: 59 },
  { file: 'work-06', kind: 'drop',   base: '#4a4340', lift: '#ded2c2', seed: 67 },
  { file: 'work-07', kind: 'sweep',  base: '#6d4550', lift: '#e6c3c6', seed: 73 },
  { file: 'work-08', kind: 'bokeh',  base: '#2f3a3f', lift: '#bcd0cc', seed: 83 },
];

function renderTile(w, h, spec) {
  const s = new Surface(w, h);
  const rnd = mulberry32(spec.seed);
  const base = hex(spec.base);
  const lift = hex(spec.lift);
  const deep = scale(base, 0.16);

  s.fill((x, y) => {
    const nx = x / w, ny = y / h;
    let t;
    switch (spec.kind) {
      // A lacquer bead: a defined body with a fast terminator at its edge, so
      // it reads as an object under light rather than as a soft gradient.
      case 'drop': {
        const d = Math.hypot((nx - 0.46) * 1.22, ny - 0.42) / 0.34;
        t = smoothstep(1.05, 0.55, d) * (0.45 + 0.75 * smoothstep(1.0, 0.1, d));
        break;
      }
      // A hard-edged gloss band raking across the surface.
      case 'sweep': {
        const u = nx * 0.72 + ny * 0.9;
        t = smoothstep(0.32, 0.62, u) * smoothstep(1.22, 0.86, u);
        break;
      }
      // Concentric tonal rings, like light on a curved nail.
      case 'rings': {
        const d = Math.hypot((nx - 0.5) * 1.1, ny - 0.46);
        t = (0.5 + 0.5 * Math.cos(d * 15)) * smoothstep(0.85, 0.12, d);
        break;
      }
      // Two colour fields meeting on a crisp diagonal.
      case 'split':
        t = smoothstep(0.44, 0.52, nx * 0.5 + ny * 0.8);
        break;
      default:
        t = smoothstep(0.95, 0.15, Math.hypot(nx - 0.5, ny - 0.46) * 1.9);
        break;
    }
    t = clamp01(t);
    // Fine grain keeps the fields from reading as flat CSS gradients.
    const n = fbm(nx * 5.5, ny * 5.5, 5, spec.seed);
    let c = mix(deep, base, clamp01(Math.pow(t, 0.75) * 1.25 + (n - 0.5) * 0.3));
    c = mix(c, lift, Math.pow(clamp01((t - 0.42) * 1.9), 1.5));
    // Deepen the outer field so the focal form separates cleanly.
    c = scale(c, 0.55 + 0.65 * clamp01(t * 1.3 + 0.25));
    return c;
  });

  {
    // Defocused highlights: dense on the 'bokeh' recipe, a light dusting
    // elsewhere so no tile reads as a flat CSS gradient.
    const count = spec.kind === 'bokeh' ? 22 : 7;
    const strength = spec.kind === 'bokeh' ? 0.3 : 0.16;
    for (let i = 0; i < count; i++) {
      const bx = rnd() * w, by = rnd() * h, br = Math.min(w, h) * (0.03 + rnd() * 0.10);
      for (let y = Math.max(0, (by - br) | 0); y <= Math.min(h - 1, (by + br) | 0); y++) {
        for (let x = Math.max(0, (bx - br) | 0); x <= Math.min(w - 1, (bx + br) | 0); x++) {
          const d = Math.hypot(x - bx, y - by) / br;
          if (d > 1) continue;
          // Defocused disc: flat core, brighter rim.
          const disc = smoothstep(1, 0.85, d) * (0.7 + 0.5 * smoothstep(0.5, 0.98, d));
          s.add((y * w + x) * 3, lift, strength * disc);
        }
      }
    }
  }

  // Tight specular sweep — the cue that reads as "lacquer".
  const ang = rnd() * Math.PI;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = ((x / w - 0.5) * ca + (y / h - 0.5) * sa);
      const g = Math.exp(-Math.pow((u - 0.06) / 0.038, 2));
      if (g < 0.004) continue;
      s.add((y * w + x) * 3, lift, g * 0.85);
    }
  }

  s.blur(Math.min(w, h) * 0.0012, 1);
  return s.toSRGB({ grain: 0.028, vignette: 0.34, seed: spec.seed });
}

/* -------------------------------------------------------------------------- */
/* 3. Open Graph card                                                          */
/* -------------------------------------------------------------------------- */

function renderOg(w, h) {
  // Reuse the hero bloom so the share card is unmistakably the same object as
  // the site, then run it through a coarse dither grid quoting the hero effect.
  const src = renderDaisy(w, h);
  const s = new Surface(w, h);
  const ink = hex('#17150f');
  const moss = hex('#38432f');
  const bone = hex('#f5f1e8');
  const ochre = hex('#e9b866');

  s.fill((x, y) => {
    const nx = x / w, ny = y / h;
    return mix(moss, ink, smoothstep(0.1, 1.0, Math.hypot(nx - 0.42, ny - 0.5) * 1.35));
  });

  const cell = 7;
  for (let gy = 0; gy < h; gy += cell) {
    for (let gx = 0; gx < w; gx += cell) {
      // Average the source cell's luminance, exactly as the live effect does.
      let sum = 0, n = 0;
      for (let y = gy; y < Math.min(h, gy + cell); y += 2) {
        for (let x = gx; x < Math.min(w, gx + cell); x += 2) {
          const i = (y * w + x) * 3;
          sum += (src[i] * 0.2126 + src[i + 1] * 0.7152 + src[i + 2] * 0.0722) / 255;
          n++;
        }
      }
      const lum = sum / n;
      // High contrast, matching the hero config's contrast: 158.
      const v = clamp01((lum - 0.42) * 2.6 + 0.42);
      const r = Math.pow(v, 0.8) * cell * 0.62;
      if (r < 0.3) continue;
      // Bright cells go bone, dim cells go ochre — a two-tone dither.
      const col = mix(ochre, bone, smoothstep(0.35, 0.85, v));
      for (let y = gy; y < Math.min(h, gy + cell); y++) {
        for (let x = gx; x < Math.min(w, gx + cell); x++) {
          const d = Math.hypot(x - (gx + cell / 2), y - (gy + cell / 2));
          if (d < r) s.blend((y * w + x) * 3, col, smoothstep(r, r * 0.35, d));
        }
      }
    }
  }
  return s.toSRGB({ grain: 0.012, vignette: 0.45, seed: 9 });
}

/* -------------------------------------------------------------------------- */
/* Driver                                                                      */
/* -------------------------------------------------------------------------- */

async function write(path, raw, w, h, { webp = true, quality = 82 } = {}) {
  await mkdir(dirname(path), { recursive: true });
  const img = sharp(raw, { raw: { width: w, height: h, channels: 3 } });
  if (webp) await img.webp({ quality }).toFile(path);
  else await img.jpeg({ quality }).toFile(path);
  console.log('  ✓', path);
}

async function main() {
  console.log('Rendering placeholder imagery…');

  const HW = 1600, HH = 1200;
  console.log(' hero (macro daisy)');
  await write(`${OUT}/daisy-hero.webp`, renderDaisy(HW, HH), HW, HH, { quality: 88 });

  console.log(' gallery tiles');
  const TW = 900, TH = 1125; // 4:5 portrait
  for (const spec of TILES) {
    await write(`${OUT}/${spec.file}.webp`, renderTile(TW, TH, spec), TW, TH);
  }

  console.log(' open graph card');
  await write(`${OUT}/og.jpg`, renderOg(1200, 630), 1200, 630, { webp: false, quality: 86 });

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
