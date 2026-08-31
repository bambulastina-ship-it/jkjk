/**
 * ============================================================================
 * INK GARDEN — per-cell drawing primitives (pipeline step 3)
 * ----------------------------------------------------------------------------
 * One routine per `RenderMode`. Each receives a single grid cell's sampled
 * colour and luminance and draws that cell with Canvas2D primitives.
 *
 * Contract for every renderer:
 *   - draw inside the box (x, y, size, size) — the grid owns the layout;
 *   - treat `lum` as already final (invert, edge emphasis, tone curve and the
 *     animation perturbation have all been folded in by the caller);
 *   - treat `density` as the mode's fill weight, normalised 0–1;
 *   - never mutate shared ctx state without restoring it.
 * ==========================================================================*/

import type { RenderMode } from './types';

/** Everything a per-cell renderer is allowed to know about its cell. */
export interface Cell {
  ctx: CanvasRenderingContext2D;
  /** Cell box, in device pixels. */
  x: number;
  y: number;
  size: number;
  /** Final luminance, 0–1. */
  lum: number;
  /** Sampled cell colour, 0–255. */
  r: number;
  g: number;
  b: number;
  /** Sub-cell luminance, used by `halfblocks` for double vertical detail. */
  lumTop: number;
  lumBottom: number;
  /** Mode fill weight, 0–1. */
  density: number;
  /** Seconds since the effect started — for self-animating modes. */
  time: number;
  /** Stable per-cell random value, 0–1. Same cell → same value every frame. */
  seed: number;
  /** Grid coordinates. */
  col: number;
  row: number;
  /** Glyph ramp, ordered light → dark. */
  chars: string;
}

const TAU = Math.PI * 2;

/**
 * Canvas2D's `ctx.font` is parsed as a CSS `font` shorthand and does NOT
 * resolve custom properties. Assigning a font whose family is a CSS variable
 * is invalid, so the assignment is dropped and the context silently keeps its
 * default 10px sans-serif. The glyph modes therefore need a literal stack.
 */
const MONO_STACK =
  "ui-monospace, 'SFMono-Regular', 'JetBrains Mono', Menlo, Consolas, monospace";

/** `rgb()` string for the cell's sampled colour. */
function rgb(c: Cell, scale = 1): string {
  const k = scale;
  return `rgb(${Math.min(255, c.r * k) | 0},${Math.min(255, c.g * k) | 0},${
    Math.min(255, c.b * k) | 0
  })`;
}

/**
 * 4×4 Bayer matrix, normalised to 0–1. Ordered dithering compares a pixel's
 * luminance against the matrix value at its position: this is what gives the
 * `dither` mode its characteristic stable cross-hatch instead of noise.
 */
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

/** Glyph from the ramp, sized and coloured by luminance. */
function drawCharacters(c: Cell) {
  const { ctx, chars } = c;
  // Dark cells take the dense end of the ramp.
  const idx = Math.min(
    chars.length - 1,
    Math.max(0, Math.round((1 - c.lum) * (chars.length - 1))),
  );
  const ch = chars[idx];
  if (ch === ' ') return;
  ctx.fillStyle = rgb(c);
  ctx.font = `${c.size * (0.85 + c.density * 0.35)}px ${MONO_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, c.x + c.size / 2, c.y + c.size / 2);
}

/**
 * Ordered (Bayer) dithering. The cell is subdivided into a 4×4 grid and each
 * sub-pixel is filled only where luminance beats the matrix threshold — so
 * tone is carried by *how many* sub-pixels survive, not by their colour.
 */
function drawDither(c: Cell) {
  const { ctx } = c;
  const sub = c.size / 4;
  ctx.fillStyle = rgb(c);
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 4; i++) {
      // Offsetting the matrix by grid position keeps the pattern continuous
      // across cell borders rather than restarting in every cell.
      const threshold = BAYER_4[(j + c.row) & 3][(i + c.col) & 3];
      if (c.lum > threshold) {
        ctx.fillRect(c.x + i * sub, c.y + j * sub, sub + 0.5, sub + 0.5);
      }
    }
  }
}

/** Rounded tile, inset by luminance. */
function drawMosaic(c: Cell) {
  const { ctx } = c;
  const inset = (1 - c.lum) * c.size * 0.42;
  const s = c.size - inset * 2;
  if (s <= 0.5) return;
  const r = Math.min(s * 0.28, c.size * 0.2);
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  ctx.roundRect(c.x + inset, c.y + inset, s, s, r);
  ctx.fill();
}

/** Flat filled square — the plainest possible mode. */
function drawPixel(c: Cell) {
  c.ctx.fillStyle = rgb(c);
  c.ctx.fillRect(c.x, c.y, c.size + 0.5, c.size + 0.5);
}

/** Circle whose radius tracks luminance. */
function drawDots(c: Cell) {
  const { ctx } = c;
  const r = c.lum * c.size * (0.34 + c.density * 0.3);
  if (r < 0.2) return;
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  ctx.arc(c.x + c.size / 2, c.y + c.size / 2, r, 0, TAU);
  ctx.fill();
}

/** Plus sign, arm length by luminance. */
function drawCross(c: Cell) {
  const { ctx } = c;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  const len = c.lum * c.size * 0.5;
  const w = Math.max(0.6, c.size * (0.1 + c.density * 0.18));
  if (len < 0.3) return;
  ctx.fillStyle = rgb(c);
  ctx.fillRect(cx - len, cy - w / 2, len * 2, w);
  ctx.fillRect(cx - w / 2, cy - len, w, len * 2);
}

/** Square rotated 45°. */
function drawDiamond(c: Cell) {
  const { ctx } = c;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  const r = c.lum * c.size * 0.62;
  if (r < 0.3) return;
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
}

/**
 * Isometric cube. The three visible faces get fixed relative brightness, which
 * is what sells the volume — luminance drives the cube's height.
 */
function drawVoxel(c: Cell) {
  const { ctx } = c;
  const s = c.size;
  const h = c.lum * s * 0.55; // extrusion height
  const hw = s * 0.42; // half width
  const hh = s * 0.24; // half depth (isometric foreshortening)
  const cx = c.x + s / 2;
  const cy = c.y + s / 2 + h * 0.35;
  if (c.lum < 0.04) return;

  // Top face (lightest)
  ctx.fillStyle = rgb(c, 1.25);
  ctx.beginPath();
  ctx.moveTo(cx, cy - h - hh);
  ctx.lineTo(cx + hw, cy - h);
  ctx.lineTo(cx, cy - h + hh);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  // Left face (mid)
  ctx.fillStyle = rgb(c, 0.78);
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - h);
  ctx.lineTo(cx, cy - h + hh);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fill();

  // Right face (darkest)
  ctx.fillStyle = rgb(c, 0.5);
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy - h);
  ctx.lineTo(cx, cy - h + hh);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx + hw, cy);
  ctx.closePath();
  ctx.fill();
}

/** Toy brick: a plate plus a lit stud. */
function drawLego(c: Cell) {
  const { ctx } = c;
  const s = c.size;
  if (c.lum < 0.05) return;
  ctx.fillStyle = rgb(c);
  ctx.fillRect(c.x, c.y, s + 0.5, s + 0.5);
  const r = s * 0.26 * (0.5 + c.lum * 0.5);
  const cx = c.x + s / 2;
  const cy = c.y + s / 2;
  ctx.fillStyle = rgb(c, 1.3);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  // Crescent shadow under the stud reads as a moulded edge.
  ctx.fillStyle = rgb(c, 0.6);
  ctx.beginPath();
  ctx.arc(cx + r * 0.18, cy + r * 0.2, r * 0.72, 0, TAU);
  ctx.fill();
}

/** Horizontal bar, thickness by luminance. */
function drawLines(c: Cell) {
  const { ctx } = c;
  const h = Math.max(0.4, c.lum * c.size * (0.5 + c.density * 0.5));
  ctx.fillStyle = rgb(c);
  ctx.fillRect(c.x, c.y + (c.size - h) / 2, c.size + 0.5, h);
}

/** Diagonal stroke; direction alternates on a checkerboard for a woven look. */
function drawDiagonal(c: Cell) {
  const { ctx } = c;
  if (c.lum < 0.04) return;
  const up = ((c.col + c.row) & 1) === 0;
  ctx.strokeStyle = rgb(c);
  ctx.lineWidth = Math.max(0.5, c.lum * c.size * (0.24 + c.density * 0.3));
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (up) {
    ctx.moveTo(c.x, c.y + c.size);
    ctx.lineTo(c.x + c.size, c.y);
  } else {
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.size, c.y + c.size);
  }
  ctx.stroke();
}

/**
 * Braille 2×4 dot matrix. Each of the 8 positions lights when luminance beats
 * its ordered threshold, giving 8 tonal steps at 4× the vertical resolution of
 * a single dot.
 */
function drawBraille(c: Cell) {
  const { ctx } = c;
  const dotR = c.size * 0.11;
  const stepX = c.size / 2;
  const stepY = c.size / 4;
  ctx.fillStyle = rgb(c);
  // Ordered thresholds: fill top-left first, bottom-right last.
  const order = [0.06, 0.5, 0.19, 0.63, 0.31, 0.75, 0.44, 0.88];
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 2; i++) {
      const k = j * 2 + i;
      if (c.lum <= order[k]) continue;
      ctx.beginPath();
      ctx.arc(
        c.x + stepX * (i + 0.5),
        c.y + stepY * (j + 0.5),
        dotR,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
}

/** Saturated rotating facets — deliberately the loudest mode. */
function drawDisco(c: Cell) {
  const { ctx } = c;
  if (c.lum < 0.05) return;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  const r = c.lum * c.size * 0.6;
  // Hue cycles with time and cell seed rather than following the photo.
  const hue = (c.seed * 360 + c.time * 90) % 360;
  ctx.fillStyle = `hsl(${hue} 85% ${35 + c.lum * 40}%)`;
  ctx.beginPath();
  const facets = 6;
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * TAU + c.time * 1.5 + c.seed * TAU;
    const rr = r * (i % 2 === 0 ? 1 : 0.55);
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Hex digit 0–F chosen by luminance — a memory-dump readout of the image. */
function drawHexdump(c: Cell) {
  const { ctx } = c;
  const digits = '0123456789ABCDEF';
  const d = digits[Math.min(15, Math.max(0, Math.round(c.lum * 15)))];
  ctx.fillStyle = rgb(c);
  ctx.font = `${c.size * 0.95}px ${MONO_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d, c.x + c.size / 2, c.y + c.size / 2);
}

const MATRIX_GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789';

/**
 * Green code rain. Unlike every other mode this one animates on its own clock:
 * a virtual "head" falls down each column and the photo's luminance decides
 * how brightly each cell can glow when the head passes.
 */
function drawMatrix(c: Cell) {
  const { ctx } = c;
  if (c.lum < 0.03) return;
  // Each column falls at its own speed, seeded so it stays stable per column.
  const speed = 2 + ((c.col * 37) % 10) * 0.6;
  const phase = ((c.col * 13) % 100) / 100;
  const head = (c.time * speed + phase * 40) % 40;
  const dist = (head - c.row + 40) % 40;
  if (dist > 18) return;
  // The head is white-hot; the tail decays to deep green.
  const fade = 1 - dist / 18;
  const isHead = dist < 1;
  const alpha = Math.pow(fade, 1.4) * (0.5 + c.lum * 0.5);
  ctx.fillStyle = isHead
    ? `rgba(215,255,225,${alpha})`
    : `rgba(60,${Math.round(140 + fade * 100)},90,${alpha})`;
  ctx.font = `${c.size * 0.95}px ${MONO_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const gi = (c.col * 7 + c.row * 13 + Math.floor(c.time * 6 + c.seed * 20)) %
    MATRIX_GLYPHS.length;
  ctx.fillText(MATRIX_GLYPHS[gi], c.x + c.size / 2, c.y + c.size / 2);
}

/** Concentric circles; brighter cells get more rings. */
function drawRings(c: Cell) {
  const { ctx } = c;
  const count = Math.round(c.lum * (1 + c.density * 4));
  if (count < 1) return;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  ctx.strokeStyle = rgb(c);
  ctx.lineWidth = Math.max(0.4, c.size * 0.07);
  for (let i = 1; i <= count; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (i / (count + 0.4)) * c.size * 0.48, 0, TAU);
    ctx.stroke();
  }
}

/** Heart glyph via two arcs and a V. */
function drawHearts(c: Cell) {
  const { ctx } = c;
  const s = c.lum * c.size * 0.52;
  if (s < 0.4) return;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2 - s * 0.15;
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  ctx.arc(cx - s * 0.45, cy - s * 0.2, s * 0.48, Math.PI * 0.9, Math.PI * 1.95);
  ctx.arc(cx + s * 0.45, cy - s * 0.2, s * 0.48, Math.PI * 1.05, Math.PI * 2.1);
  ctx.lineTo(cx, cy + s * 0.95);
  ctx.closePath();
  ctx.fill();
}

/** Five-pointed star. */
function drawStars(c: Cell) {
  const { ctx } = c;
  const r = c.lum * c.size * 0.6;
  if (r < 0.4) return;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.42;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Honeycomb: odd rows shift half a cell so hexagons tessellate. */
function drawHexagons(c: Cell) {
  const { ctx } = c;
  const r = c.lum * c.size * 0.62;
  if (r < 0.3) return;
  const offset = (c.row & 1) === 1 ? c.size * 0.5 : 0;
  const cx = c.x + c.size / 2 + offset;
  const cy = c.y + c.size / 2;
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + Math.PI / 6;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Low-poly: the cell splits into two triangles with different shading. */
function drawTriangles(c: Cell) {
  const { ctx } = c;
  const s = c.size + 0.5;
  const flip = ((c.col + c.row) & 1) === 0;
  // Split along one diagonal; the two halves lean on the sub-cell luminances
  // so the split direction carries real image detail.
  ctx.fillStyle = rgb(c, 0.72 + c.lumTop * 0.6);
  ctx.beginPath();
  if (flip) {
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + s, c.y);
    ctx.lineTo(c.x, c.y + s);
  } else {
    ctx.moveTo(c.x + s, c.y);
    ctx.lineTo(c.x + s, c.y + s);
    ctx.lineTo(c.x, c.y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rgb(c, 0.72 + c.lumBottom * 0.6);
  ctx.beginPath();
  if (flip) {
    ctx.moveTo(c.x + s, c.y);
    ctx.lineTo(c.x + s, c.y + s);
    ctx.lineTo(c.x, c.y + s);
  } else {
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x, c.y + s);
    ctx.lineTo(c.x + s, c.y + s);
  }
  ctx.closePath();
  ctx.fill();
}

/** Soap bubble: translucent body, bright rim, offset specular dot. */
function drawBubbles(c: Cell) {
  const { ctx } = c;
  const r = c.lum * c.size * 0.5;
  if (r < 0.5) return;
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = rgb(c);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = rgb(c, 1.35);
  ctx.lineWidth = Math.max(0.4, c.size * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  if (r > 1.5) {
    ctx.fillStyle = rgb(c, 1.6);
    ctx.beginPath();
    ctx.arc(cx - r * 0.32, cy - r * 0.34, r * 0.2, 0, TAU);
    ctx.fill();
  }
}

/** Pencil cross-hatch: more strokes, and a second crossing layer, as it darkens. */
function drawHatch(c: Cell) {
  const { ctx } = c;
  // Hatching describes *shadow*, so it thickens as luminance falls.
  const dark = 1 - c.lum;
  const strokes = Math.round(dark * (1 + c.density * 5));
  if (strokes < 1) return;
  ctx.strokeStyle = rgb(c);
  ctx.lineWidth = Math.max(0.35, c.size * 0.06);
  ctx.lineCap = 'round';
  const step = c.size / (strokes + 1);
  ctx.beginPath();
  for (let i = 1; i <= strokes; i++) {
    const o = i * step;
    ctx.moveTo(c.x, c.y + o);
    ctx.lineTo(c.x + o, c.y);
    ctx.moveTo(c.x + o, c.y + c.size);
    ctx.lineTo(c.x + c.size, c.y + o);
  }
  // The darkest cells get a crossing layer, as in real cross-hatching.
  if (dark > 0.62) {
    for (let i = 1; i <= strokes; i++) {
      const o = i * step;
      ctx.moveTo(c.x + c.size - o, c.y);
      ctx.lineTo(c.x + c.size, c.y + o);
      ctx.moveTo(c.x, c.y + c.size - o);
      ctx.lineTo(c.x + o, c.y + c.size);
    }
  }
  ctx.stroke();
}

/**
 * Topographic iso-lines. A cell is drawn only where its luminance sits close to
 * one of N evenly-spaced elevation bands, so the image resolves into contours.
 */
function drawContour(c: Cell) {
  const { ctx } = c;
  const bands = 4 + Math.round(c.density * 10);
  const pos = c.lum * bands;
  const frac = pos - Math.floor(pos);
  // Distance to the nearest band boundary, 0 at the line.
  const dist = Math.min(frac, 1 - frac);
  const width = 0.16;
  if (dist > width) return;
  const alpha = 1 - dist / width;
  ctx.fillStyle = `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${alpha})`;
  ctx.fillRect(c.x, c.y, c.size + 0.5, c.size + 0.5);
}

/**
 * Half blocks: the top and bottom halves of the cell are filled independently
 * from the sub-cell luminances, doubling effective vertical resolution — the
 * same trick terminal image viewers use with U+2580.
 */
function drawHalfblocks(c: Cell) {
  const { ctx } = c;
  const half = c.size / 2;
  ctx.fillStyle = rgb(c, 0.55 + c.lumTop * 0.9);
  ctx.fillRect(c.x, c.y, c.size + 0.5, half + 0.5);
  ctx.fillStyle = rgb(c, 0.55 + c.lumBottom * 0.9);
  ctx.fillRect(c.x, c.y + half, c.size + 0.5, half + 0.5);
}

/* -------------------------------------------------------------------------- */
/* Dispatch                                                                   */
/* -------------------------------------------------------------------------- */

/** Modes that `mixed` picks between, per cell. */
const MIXED_POOL: RenderMode[] = [
  'dots',
  'diamond',
  'cross',
  'pixel',
  'rings',
  'diagonal',
  'stars',
];

export const CELL_RENDERERS: Record<
  Exclude<RenderMode, 'mixed'>,
  (c: Cell) => void
> = {
  characters: drawCharacters,
  dither: drawDither,
  mosaic: drawMosaic,
  pixel: drawPixel,
  dots: drawDots,
  cross: drawCross,
  diamond: drawDiamond,
  voxel: drawVoxel,
  lego: drawLego,
  lines: drawLines,
  diagonal: drawDiagonal,
  braille: drawBraille,
  disco: drawDisco,
  hexdump: drawHexdump,
  matrix: drawMatrix,
  rings: drawRings,
  hearts: drawHearts,
  stars: drawStars,
  hexagons: drawHexagons,
  triangles: drawTriangles,
  bubbles: drawBubbles,
  hatch: drawHatch,
  contour: drawContour,
  halfblocks: drawHalfblocks,
};

/** Draw one cell in the requested mode. `mixed` fans out per cell. */
export function drawCell(mode: RenderMode, c: Cell) {
  if (mode === 'mixed') {
    // Deterministic per-cell pick, so the mosaic of modes never flickers.
    const pick = MIXED_POOL[Math.floor(c.seed * MIXED_POOL.length) % MIXED_POOL.length];
    CELL_RENDERERS[pick as Exclude<RenderMode, 'mixed'>](c);
    return;
  }
  CELL_RENDERERS[mode](c);
}
