/**
 * ============================================================================
 * INK GARDEN — the render pipeline
 * ----------------------------------------------------------------------------
 * Canvas2D only. The eight stages of the brief, in order:
 *
 *   1. Background layer      drawBackground()
 *   2. Grid sampling         sampleGrid()          [cached]
 *   3. Per-cell rendering    drawCells() -> renderers.ts
 *   4. Colour adjustments    prepareSource()       [cached]
 *   5. Post-effects          applyPostEffects()
 *   6. Lights                drawLights()
 *   7. Mask reveal           applyMaskReveal()
 *   8. Animation loop        driven by the caller via render(time)
 *
 * WHERE STAGE 4 ACTUALLY RUNS: the colour adjustments are applied to the
 * *source* before the grid samples it, not to the finished cell drawing. That
 * is the only ordering that makes them mean anything — `contrast: 158` is
 * supposed to change which glyph a cell picks, and it can only do that if the
 * contrast is already baked in when the cell's luminance is measured. The
 * adjustments still run in the exact internal order the brief specifies:
 * brightness → contrast → saturation → grayscale → tint → blur.
 *
 * PERFORMANCE MODEL: stages 2 and 4 are expensive and are cached. They re-run
 * only when the size, the image or a tone/colour/blur setting changes. A frame
 * costs stage 1 + 3 + 5 + 6 + 7, where stage 3 reads cached per-cell values and
 * only perturbs them with the animation term — no per-frame re-sampling.
 * ==========================================================================*/

import {
  type AsciiConfig,
  type CurvePoint,
  resolveCharSet,
} from './types';
import { drawCell, type Cell } from './renderers';

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Stable hash → 0–1. Used for coverage tests and per-cell seeds. */
function hash2(x: number, y: number, seed = 0): number {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
}

function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const x = c.getContext('2d', { willReadFrequently: false });
  if (!x) throw new Error('Canvas2D unavailable');
  return x;
}

/** Feature-detect `ctx.filter`; Safari < 15.4 and some embedded webviews lack it. */
let filterSupport: boolean | null = null;
function supportsFilter(): boolean {
  if (filterSupport !== null) return filterSupport;
  try {
    const c = makeCanvas(1, 1);
    const x = ctx2d(c);
    x.filter = 'blur(1px)';
    filterSupport = x.filter === 'blur(1px)';
  } catch {
    filterSupport = false;
  }
  return filterSupport;
}

/** Build a 256-entry lookup table from the tone curve's control points. */
function buildToneLUT(points: CurvePoint[]): Uint8Array | null {
  const pts = [...points].sort((a, b) => a.x - b.x);
  // The identity curve is the default; skip the whole per-pixel pass for it.
  const isIdentity =
    pts.length === 2 &&
    Math.abs(pts[0].x) < 1e-6 && Math.abs(pts[0].y) < 1e-6 &&
    Math.abs(pts[1].x - 1) < 1e-6 && Math.abs(pts[1].y - 1) < 1e-6;
  if (isIdentity || pts.length < 2) return null;

  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    // Piecewise-linear interpolation between the surrounding control points.
    let j = 0;
    while (j < pts.length - 2 && pts[j + 1].x < t) j++;
    const a = pts[j];
    const b = pts[j + 1];
    const span = b.x - a.x;
    const k = span <= 1e-6 ? 0 : (t - a.x) / span;
    lut[i] = Math.round(clamp01(a.y + (b.y - a.y) * k) * 255);
  }
  return lut;
}

export interface RendererOptions {
  /** Hard cap on devicePixelRatio — the single biggest mobile perf lever. */
  maxDpr?: number;
}

export class AsciiRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private config: AsciiConfig;
  private maxDpr: number;

  /** Backing-store size, in device pixels. */
  private w = 0;
  private h = 0;
  private dpr = 1;

  /** Stage 4 output: the tone/colour/blur-adjusted source the grid samples. */
  private prepared: HTMLCanvasElement | null = null;
  /** The untouched photo at canvas size, used by the stage-7 mask reveal. */
  private plain: HTMLCanvasElement | null = null;

  /* Stage 2 cache — parallel arrays, one entry per grid cell. */
  private cols = 0;
  private rows = 0;
  private cellR = new Float32Array(0);
  private cellG = new Float32Array(0);
  private cellB = new Float32Array(0);
  private cellL = new Float32Array(0);
  private cellLT = new Float32Array(0);
  private cellLB = new Float32Array(0);

  /** Reusable scratch surfaces, so post-effects never allocate per frame. */
  private scratch = new Map<string, HTMLCanvasElement>();
  private grainTile: HTMLCanvasElement | null = null;
  private maskImage: HTMLImageElement | null = null;
  private maskSrc: string | null = null;

  private dirty = true;

  constructor(canvas: HTMLCanvasElement, config: AsciiConfig, options: RendererOptions = {}) {
    this.canvas = canvas;
    this.ctx = ctx2d(canvas);
    this.config = config;
    this.maxDpr = options.maxDpr ?? 2;
  }

  /* ---------------------------------------------------------------------- */
  /* Lifecycle                                                              */
  /* ---------------------------------------------------------------------- */

  setImage(image: HTMLImageElement) {
    this.image = image;
    this.dirty = true;
  }

  setConfig(config: AsciiConfig) {
    this.config = config;
    this.dirty = true;
  }

  /** True once there is an image and a non-zero size — i.e. safe to render. */
  get ready(): boolean {
    return !!this.image && this.w > 0 && this.h > 0;
  }

  /** Resize the backing store. CSS size is the caller's business. */
  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number) {
    const dpr = Math.min(this.maxDpr, Math.max(1, devicePixelRatio));
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.scratch.clear();
    this.dirty = true;
  }

  private getScratch(key: string, w = this.w, h = this.h): HTMLCanvasElement {
    let c = this.scratch.get(key);
    if (!c || c.width !== w || c.height !== h) {
      c = makeCanvas(w, h);
      this.scratch.set(key, c);
    }
    return c;
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 4 — colour adjustments (cached)                                  */
  /* ---------------------------------------------------------------------- */

  /**
   * Draws the photo cover-fit, then applies, in the brief's exact order:
   * brightness → contrast → saturation → grayscale → tint@opacity via
   * overlayBlend → tone curve → blurType/blurAmount.
   */
  private prepareSource() {
    const img = this.image;
    if (!img) return;
    const cfg = this.config;

    // The untouched photo, kept for the mask reveal in stage 7.
    const plain = this.getScratch('plain');
    const pctx = ctx2d(plain);
    pctx.clearRect(0, 0, this.w, this.h);
    this.drawCover(pctx, img);
    this.plain = plain;

    const prep = this.getScratch('prepared');
    const c = ctx2d(prep);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.w, this.h);

    // brightness → contrast → saturation → grayscale, left-to-right, which is
    // the order the CSS filter spec composes them in.
    const filters: string[] = [];
    if (cfg.brightness !== 0) filters.push(`brightness(${1 + cfg.brightness / 100})`);
    if (cfg.contrast !== 100) filters.push(`contrast(${cfg.contrast / 100})`);
    if (cfg.saturation !== 100) filters.push(`saturate(${cfg.saturation / 100})`);
    if (cfg.grayscale > 0) filters.push(`grayscale(${cfg.grayscale / 100})`);

    if (filters.length && supportsFilter()) {
      c.filter = filters.join(' ');
      c.drawImage(plain, 0, 0);
      c.filter = 'none';
    } else {
      c.drawImage(plain, 0, 0);
      if (filters.length) this.applyToneFallback(c);
    }

    // Tint, composited with the configured blend mode.
    if (cfg.tintOpacity > 0) {
      c.save();
      c.globalCompositeOperation = cfg.overlayBlend;
      c.globalAlpha = cfg.tintOpacity / 100;
      c.fillStyle = cfg.tint;
      c.fillRect(0, 0, this.w, this.h);
      c.restore();
    }

    // Tone curve, as a per-channel LUT. Skipped entirely for the identity curve.
    const lut = buildToneLUT(cfg.toneCurve);
    if (lut) {
      const id = c.getImageData(0, 0, this.w, this.h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = lut[d[i]];
        d[i + 1] = lut[d[i + 1]];
        d[i + 2] = lut[d[i + 2]];
      }
      c.putImageData(id, 0, 0);
    }

    this.applyBlur(prep);
    this.prepared = prep;
  }

  /**
   * Manual brightness/contrast/saturation/grayscale for engines without
   * `ctx.filter`. Same order, same maths, just done per pixel.
   */
  private applyToneFallback(c: CanvasRenderingContext2D) {
    const cfg = this.config;
    const id = c.getImageData(0, 0, this.w, this.h);
    const d = id.data;
    const bAdd = (cfg.brightness / 100) * 255;
    const con = cfg.contrast / 100;
    const sat = cfg.saturation / 100;
    const gray = cfg.grayscale / 100;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] + bAdd;
      let g = d[i + 1] + bAdd;
      let b = d[i + 2] + bAdd;
      r = (r - 128) * con + 128;
      g = (g - 128) * con + 128;
      b = (b - 128) * con + 128;
      const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
      r = l + (r - l) * sat;
      g = l + (g - l) * sat;
      b = l + (b - l) * sat;
      if (gray > 0) {
        const l2 = r * 0.2126 + g * 0.7152 + b * 0.0722;
        r += (l2 - r) * gray;
        g += (l2 - g) * gray;
        b += (l2 - b) * gray;
      }
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
    c.putImageData(id, 0, 0);
  }

  /** Cover-fit draw: fills the canvas, centre-cropping the overflow. */
  private drawCover(c: CanvasRenderingContext2D, img: HTMLImageElement) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(this.w / iw, this.h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    c.drawImage(img, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
  }

  /* ---------------------------------------------------------------------- */
  /* Blur family                                                            */
  /* ---------------------------------------------------------------------- */

  /** A blurred copy of `src` at `px` radius, in a named scratch surface. */
  private blurCopy(src: HTMLCanvasElement, px: number, key = 'blur'): HTMLCanvasElement {
    const dst = this.getScratch(key);
    const c = ctx2d(dst);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    if (supportsFilter()) {
      c.filter = `blur(${px}px)`;
      c.drawImage(src, 0, 0);
      c.filter = 'none';
    } else {
      // Fallback: downscale-then-upscale approximates a wide blur cheaply.
      const k = Math.max(1, px / 2);
      const tw = Math.max(1, Math.round(this.w / k));
      const th = Math.max(1, Math.round(this.h / k));
      const tmp = this.getScratch(`${key}-lo`, tw, th);
      const tc = ctx2d(tmp);
      tc.clearRect(0, 0, tw, th);
      tc.drawImage(src, 0, 0, tw, th);
      c.imageSmoothingEnabled = true;
      c.drawImage(tmp, 0, 0, this.w, this.h);
    }
    return dst;
  }

  /**
   * Composites `layer` over `target` through a gradient alpha mask: the mask is
   * punched into a copy of the layer with `destination-in`, then that copy is
   * drawn over the target. This is how tilt-shift, lens and progressive blur
   * each get their focus falloff.
   */
  private compositeMasked(
    target: HTMLCanvasElement,
    layer: HTMLCanvasElement,
    gradient: CanvasGradient,
  ) {
    const tmp = this.getScratch('masked');
    const c = ctx2d(tmp);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, this.w, this.h);
    c.drawImage(layer, 0, 0);
    c.globalCompositeOperation = 'destination-in';
    c.fillStyle = gradient;
    c.fillRect(0, 0, this.w, this.h);
    c.globalCompositeOperation = 'source-over';
    const t = ctx2d(target);
    t.drawImage(tmp, 0, 0);
  }

  private applyBlur(surface: HTMLCanvasElement) {
    const cfg = this.config;
    if (cfg.blurType === 'off' || cfg.blurAmount <= 0) return;
    const c = ctx2d(surface);
    // blurAmount is 0–100; scale it to a pixel radius that reads sensibly at
    // any canvas size rather than being fixed in device pixels.
    const px = (cfg.blurAmount / 100) * Math.min(this.w, this.h) * 0.06;
    if (px < 0.3) return;
    const diag = Math.hypot(this.w, this.h);

    switch (cfg.blurType) {
      case 'gaussian': {
        const b = this.blurCopy(surface, px);
        c.clearRect(0, 0, this.w, this.h);
        c.drawImage(b, 0, 0);
        break;
      }

      case 'directional': {
        // Smear the image along `blurAngle` by stacking offset copies.
        const snapshot = this.getScratch('dir-src');
        const sc = ctx2d(snapshot);
        sc.clearRect(0, 0, this.w, this.h);
        sc.drawImage(surface, 0, 0);
        const steps = 14;
        const rad = (cfg.blurAngle * Math.PI) / 180;
        const dx = Math.cos(rad) * px;
        const dy = Math.sin(rad) * px;
        c.clearRect(0, 0, this.w, this.h);
        c.globalAlpha = 1 / steps;
        for (let i = 0; i < steps; i++) {
          // Both-sides smears symmetrically; otherwise it trails one way only.
          const t = cfg.directionalBothSides
            ? (i / (steps - 1)) * 2 - 1
            : i / (steps - 1);
          c.drawImage(snapshot, dx * t, dy * t);
        }
        c.globalAlpha = 1;
        break;
      }

      case 'tilt': {
        // Sharp band across the middle, blurred above and below it.
        const blurred = this.blurCopy(surface, px);
        const band = (cfg.tiltFocus / 100) * this.h * 0.5;
        const centre = (cfg.tiltPosition / 100) * this.h;
        const feather = Math.max(1, (cfg.tiltFeather / 100) * this.h * 0.5);
        const g = c.createLinearGradient(0, 0, 0, this.h);
        const stops: Array<[number, number]> = [
          [0, 1],
          [clamp01((centre - band - feather) / this.h), 1],
          [clamp01((centre - band) / this.h), 0],
          [clamp01((centre + band) / this.h), 0],
          [clamp01((centre + band + feather) / this.h), 1],
          [1, 1],
        ];
        for (const [pos, a] of stops) g.addColorStop(clamp01(pos), `rgba(0,0,0,${a})`);
        this.compositeMasked(surface, blurred, g);
        break;
      }

      case 'lens': {
        // Sharp circle in the centre, blur rising toward the corners.
        const blurred = this.blurCopy(surface, px);
        const r = (cfg.lensFocus / 100) * diag * 0.5;
        const g = c.createRadialGradient(
          this.w / 2, this.h / 2, Math.max(0, r * 0.6),
          this.w / 2, this.h / 2, Math.max(1, r * 1.6),
        );
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,1)');
        this.compositeMasked(surface, blurred, g);
        break;
      }

      case 'radial': {
        // Zoom blur: stack progressively scaled copies about the blur centre.
        const snapshot = this.getScratch('rad-src');
        const sc = ctx2d(snapshot);
        sc.clearRect(0, 0, this.w, this.h);
        sc.drawImage(surface, 0, 0);
        const cx = (cfg.blurCenterX / 100) * this.w;
        const cy = (cfg.blurCenterY / 100) * this.h;
        const steps = 12;
        const maxZoom = (px / Math.min(this.w, this.h)) * 2.2;
        c.clearRect(0, 0, this.w, this.h);
        c.globalAlpha = 1 / steps;
        for (let i = 0; i < steps; i++) {
          const s = 1 + (i / (steps - 1)) * maxZoom;
          c.save();
          c.translate(cx, cy);
          c.scale(s, s);
          c.translate(-cx, -cy);
          c.drawImage(snapshot, 0, 0);
          c.restore();
        }
        c.globalAlpha = 1;
        break;
      }

      case 'progressive': {
        // Blur ramps in from `progressivePosition` toward one edge.
        const blurred = this.blurCopy(surface, px);
        const p = clamp01(cfg.progressivePosition / 100);
        const g = c.createLinearGradient(0, 0, 0, this.h);
        if (cfg.progressiveReverse) {
          g.addColorStop(0, 'rgba(0,0,0,1)');
          g.addColorStop(clamp01(p), 'rgba(0,0,0,0)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          g.addColorStop(0, 'rgba(0,0,0,0)');
          g.addColorStop(clamp01(p), 'rgba(0,0,0,0)');
          g.addColorStop(1, 'rgba(0,0,0,1)');
        }
        this.compositeMasked(surface, blurred, g);
        break;
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 2 — grid sampling (cached)                                       */
  /* ---------------------------------------------------------------------- */

  /**
   * Divides the prepared source into `cellSize` cells and stores each cell's
   * mean colour and luminance. Also stores top/bottom half luminances, which
   * `halfblocks` and `triangles` use for sub-cell detail.
   */
  private sampleGrid() {
    const prep = this.prepared;
    if (!prep) return;
    const cfg = this.config;
    // Cell pitch is specified in CSS px; scale it into device px so the grid
    // looks the same density on a retina screen as on a 1x one.
    const cell = Math.max(2, Math.round(cfg.cellSize * this.dpr));
    const cols = Math.ceil(this.w / cell);
    const rows = Math.ceil(this.h / cell);
    const n = cols * rows;

    if (n !== this.cellL.length) {
      this.cellR = new Float32Array(n);
      this.cellG = new Float32Array(n);
      this.cellB = new Float32Array(n);
      this.cellL = new Float32Array(n);
      this.cellLT = new Float32Array(n);
      this.cellLB = new Float32Array(n);
    }
    this.cols = cols;
    this.rows = rows;
    this.cellPx = cell;

    const data = ctx2d(prep).getImageData(0, 0, this.w, this.h).data;
    // Sub-sample within each cell: on a dense grid every pixel is overkill.
    const step = cell > 6 ? 2 : 1;

    for (let row = 0; row < rows; row++) {
      const y0 = row * cell;
      const y1 = Math.min(this.h, y0 + cell);
      const yMid = (y0 + y1) / 2;
      for (let col = 0; col < cols; col++) {
        const x0 = col * cell;
        const x1 = Math.min(this.w, x0 + cell);
        let r = 0, g = 0, b = 0, count = 0;
        let lTop = 0, nTop = 0, lBot = 0, nBot = 0;
        for (let y = y0; y < y1; y += step) {
          const rowOff = y * this.w;
          for (let x = x0; x < x1; x += step) {
            const i = (rowOff + x) << 2;
            const pr = data[i], pg = data[i + 1], pb = data[i + 2];
            r += pr; g += pg; b += pb; count++;
            const l = (pr * 0.2126 + pg * 0.7152 + pb * 0.0722) / 255;
            if (y < yMid) { lTop += l; nTop++; } else { lBot += l; nBot++; }
          }
        }
        const k = col + row * cols;
        if (count === 0) continue;
        this.cellR[k] = r / count;
        this.cellG[k] = g / count;
        this.cellB[k] = b / count;
        this.cellL[k] =
          (this.cellR[k] * 0.2126 + this.cellG[k] * 0.7152 + this.cellB[k] * 0.0722) / 255;
        this.cellLT[k] = nTop ? lTop / nTop : this.cellL[k];
        this.cellLB[k] = nBot ? lBot / nBot : this.cellL[k];
      }
    }

    if (cfg.edgeEmphasis > 0) this.applyEdgeEmphasis();
  }

  private cellPx = 9;

  /**
   * Sobel over the *cell* luminance grid (not the pixel grid), so edges are
   * detected at the same resolution the effect draws at. The gradient
   * magnitude is added back into luminance, making outlines pop.
   */
  private applyEdgeEmphasis() {
    const { cols, rows } = this;
    const amount = this.config.edgeEmphasis / 100;
    const src = Float32Array.from(this.cellL);
    const at = (c: number, r: number) =>
      src[Math.min(cols - 1, Math.max(0, c)) + Math.min(rows - 1, Math.max(0, r)) * cols];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx =
          -at(c - 1, r - 1) - 2 * at(c - 1, r) - at(c - 1, r + 1) +
          at(c + 1, r - 1) + 2 * at(c + 1, r) + at(c + 1, r + 1);
        const gy =
          -at(c - 1, r - 1) - 2 * at(c, r - 1) - at(c + 1, r - 1) +
          at(c - 1, r + 1) + 2 * at(c, r + 1) + at(c + 1, r + 1);
        const mag = Math.min(1, Math.hypot(gx, gy));
        this.cellL[c + r * cols] = clamp01(src[c + r * cols] + mag * amount);
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 1 — background                                                   */
  /* ---------------------------------------------------------------------- */

  private drawBackground() {
    const cfg = this.config;
    const c = this.ctx;
    c.clearRect(0, 0, this.w, this.h);
    if (cfg.bgMode === 'none') return;
    const alpha = cfg.bgOpacity / 100;
    if (alpha <= 0) return;

    c.save();
    c.globalAlpha = alpha;
    if (cfg.bgMode === 'color') {
      c.fillStyle = cfg.bgColor ?? '#000000';
      c.fillRect(0, 0, this.w, this.h);
    } else if (this.plain) {
      if (cfg.bgMode === 'blur' && cfg.bgBlur > 0) {
        c.drawImage(this.blurCopy(this.plain, cfg.bgBlur * this.dpr, 'bg-blur'), 0, 0);
      } else {
        c.drawImage(this.plain, 0, 0);
      }
    }
    c.restore();
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 3 + 8 — cells, perturbed by the animation term                   */
  /* ---------------------------------------------------------------------- */

  private drawCells(time: number) {
    const cfg = this.config;
    const c = this.ctx;
    const cell = this.cellPx;
    const chars = resolveCharSet(cfg);
    const density = cfg.density / 100;
    const coverage = cfg.coverage / 100;

    // Animation amplitude and clock rate. Both collapse to 0 when disabled,
    // which is what makes the reduced-motion path a single static frame.
    const amp =
      cfg.animated && cfg.animIntensity.enabled ? (cfg.animIntensity.intensity / 100) * 0.35 : 0;
    const rate =
      cfg.animated && cfg.animSpeed.enabled ? (cfg.animSpeed.intensity / 100) * 1.6 : 0;
    const t = time * rate;

    const cxCell = this.cols / 2;
    const cyCell = this.rows / 2;
    // `pulse` is uniform across the grid, so hoist it out of the inner loop.
    const pulse = cfg.animStyle === 'pulse' ? Math.sin(t * 1.7) : 0;
    // `flicker` re-rolls on a coarse clock rather than every frame, so it
    // reads as a flicker instead of as white noise.
    const flickerTick = Math.floor(t * 7);

    c.save();
    c.globalCompositeOperation = cfg.styleBlend;

    const cellObj: Cell = {
      ctx: c, x: 0, y: 0, size: cell, lum: 0, r: 0, g: 0, b: 0,
      lumTop: 0, lumBottom: 0, density, time, seed: 0, col: 0, row: 0, chars,
    };

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const k = col + row * this.cols;
        const seed = hash2(col, row, 1);

        // Coverage: a stable per-cell dice roll, so cells don't strobe.
        if (coverage < 1 && seed > coverage) continue;

        let lum = this.cellL[k];

        if (amp > 0) {
          let d = 0;
          switch (cfg.animStyle) {
            case 'wave':
              d = Math.sin(col * 0.3 + row * 0.16 - t * 2.2);
              break;
            case 'pulse':
              d = pulse;
              break;
            case 'shimmer':
              d = Math.sin(t * 3.1 + seed * TAU);
              break;
            case 'ripple': {
              const dist = Math.hypot(col - cxCell, row - cyCell);
              d = Math.sin(dist * 0.42 - t * 3);
              break;
            }
            case 'flicker':
              d = hash2(col, row, flickerTick) * 2 - 1;
              break;
          }
          lum = clamp01(lum + d * amp);
        }

        if (cfg.invert) lum = 1 - lum;
        if (lum <= 0.002 && cfg.renderMode !== 'pixel' && cfg.renderMode !== 'halfblocks') {
          continue;
        }

        cellObj.x = col * cell;
        cellObj.y = row * cell;
        cellObj.lum = lum;
        cellObj.r = this.cellR[k];
        cellObj.g = this.cellG[k];
        cellObj.b = this.cellB[k];
        cellObj.lumTop = cfg.invert ? 1 - this.cellLT[k] : this.cellLT[k];
        cellObj.lumBottom = cfg.invert ? 1 - this.cellLB[k] : this.cellLB[k];
        cellObj.seed = seed;
        cellObj.col = col;
        cellObj.row = row;

        drawCell(cfg.renderMode, cellObj);
      }
    }

    c.restore();
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 5 — post-effects                                                 */
  /* ---------------------------------------------------------------------- */

  private applyPostEffects(time: number) {
    const p = this.config.pfx;
    // Order matters: geometry-distorting effects run before the optical ones,
    // so bloom and grain sit on top of the distorted image rather than under it.
    if (p.pixelate.enabled) this.pfxPixelate(p.pixelate.intensity / 100);
    if (p.glitch.enabled) this.pfxGlitch(p.glitch.intensity / 100, time);
    if (p.halftone.enabled) this.pfxHalftone(p.halftone.intensity / 100);
    if (p.chromatic.enabled) this.pfxChromatic(p.chromatic.intensity / 100);
    if (p.bloom.enabled) this.pfxBloom(p.bloom.intensity / 100);
    if (p.scanLines.enabled) this.pfxScanLines(p.scanLines.intensity / 100);
    if (p.filmGrain.enabled) this.pfxFilmGrain(p.filmGrain.intensity / 100, time);
    if (p.filmDust.enabled) this.pfxFilmDust(p.filmDust.intensity / 100, time);
    if (p.vignette.enabled) this.pfxVignette(p.vignette.intensity / 100);
  }

  /** Snapshot the live canvas into a named scratch surface. */
  private snapshot(key: string): HTMLCanvasElement {
    const s = this.getScratch(key);
    const c = ctx2d(s);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.clearRect(0, 0, this.w, this.h);
    c.drawImage(this.canvas, 0, 0);
    return s;
  }

  /** Downscale then upscale with smoothing off — classic hard pixelation. */
  private pfxPixelate(k: number) {
    const factor = 1 + k * 14;
    const tw = Math.max(1, Math.round(this.w / factor));
    const th = Math.max(1, Math.round(this.h / factor));
    const small = this.getScratch('px-small', tw, th);
    const sc = ctx2d(small);
    sc.clearRect(0, 0, tw, th);
    sc.imageSmoothingEnabled = true;
    sc.drawImage(this.canvas, 0, 0, tw, th);
    const c = this.ctx;
    c.save();
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, this.w, this.h);
    c.drawImage(small, 0, 0, this.w, this.h);
    c.restore();
  }

  /** Horizontal slice displacement on a coarse clock. */
  private pfxGlitch(k: number, time: number) {
    const snap = this.snapshot('glitch');
    const c = this.ctx;
    // Re-roll slices a few times a second; per-frame would read as static.
    const tick = Math.floor(time * 8);
    const slices = Math.round(3 + k * 12);
    for (let i = 0; i < slices; i++) {
      const r = hash2(i, tick, 7);
      const r2 = hash2(i, tick, 13);
      const sy = r * this.h;
      const sh = (0.01 + r2 * 0.06) * this.h;
      const dx = (hash2(i, tick, 29) - 0.5) * k * this.w * 0.22;
      c.clearRect(0, sy, this.w, sh);
      c.drawImage(snap, 0, sy, this.w, sh, dx, sy, this.w, sh);
    }
  }

  /** Overlay a dot screen whose dot size tracks local darkness. */
  private pfxHalftone(k: number) {
    const snap = this.snapshot('halftone');
    const c = this.ctx;
    const pitch = Math.max(4, Math.round(6 * this.dpr + k * 10));
    const data = ctx2d(snap).getImageData(0, 0, this.w, this.h).data;
    c.save();
    c.globalAlpha = k;
    c.fillStyle = '#000';
    for (let y = 0; y < this.h; y += pitch) {
      for (let x = 0; x < this.w; x += pitch) {
        const i = (y * this.w + x) << 2;
        const l = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
        const r = (1 - l) * pitch * 0.55;
        if (r < 0.3) continue;
        c.beginPath();
        c.arc(x + pitch / 2, y + pitch / 2, r, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }

  /**
   * True chromatic aberration: isolate R, G and B into separate copies, then
   * re-add them at different offsets. Summing the three isolated channels
   * reproduces the original exactly at zero offset.
   */
  private pfxChromatic(k: number) {
    const snap = this.snapshot('chroma');
    const shift = k * this.w * 0.006;
    const c = this.ctx;
    const channels: Array<[string, number]> = [
      ['#ff0000', -shift],
      ['#00ff00', 0],
      ['#0000ff', shift],
    ];
    c.save();
    c.clearRect(0, 0, this.w, this.h);
    c.globalCompositeOperation = 'lighter';
    for (const [colour, dx] of channels) {
      const iso = this.getScratch('chroma-iso');
      const ic = ctx2d(iso);
      ic.setTransform(1, 0, 0, 1, 0, 0);
      ic.globalCompositeOperation = 'source-over';
      ic.clearRect(0, 0, this.w, this.h);
      ic.drawImage(snap, 0, 0);
      // Multiplying by a pure primary keeps only that channel.
      ic.globalCompositeOperation = 'multiply';
      ic.fillStyle = colour;
      ic.fillRect(0, 0, this.w, this.h);
      ic.globalCompositeOperation = 'source-over';
      c.drawImage(iso, dx, 0);
    }
    c.restore();
  }

  /** Isolate highlights, blur them wide, add back with `lighter`. */
  private pfxBloom(k: number) {
    const snap = this.snapshot('bloom-src');
    const bright = this.getScratch('bloom-bright');
    const bc = ctx2d(bright);
    bc.setTransform(1, 0, 0, 1, 0, 0);
    bc.clearRect(0, 0, this.w, this.h);
    if (supportsFilter()) {
      // Crush everything below the highlights to black before blurring.
      bc.filter = 'brightness(1.5) contrast(2.4)';
      bc.drawImage(snap, 0, 0);
      bc.filter = 'none';
    } else {
      bc.drawImage(snap, 0, 0);
    }
    const blurred = this.blurCopy(bright, Math.max(2, k * 26 * this.dpr), 'bloom-blur');
    const c = this.ctx;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = k * 0.85;
    c.drawImage(blurred, 0, 0);
    c.restore();
  }

  private pfxScanLines(k: number) {
    const c = this.ctx;
    const pitch = Math.max(2, Math.round(3 * this.dpr));
    c.save();
    c.globalAlpha = k * 0.55;
    c.fillStyle = '#000';
    for (let y = 0; y < this.h; y += pitch) {
      c.fillRect(0, y, this.w, Math.max(1, pitch * 0.45));
    }
    c.restore();
  }

  /**
   * Film grain. The noise tile is generated once and re-tiled at a jittered
   * offset each frame — regenerating real noise per frame is far too expensive.
   */
  private pfxFilmGrain(k: number, time: number) {
    if (!this.grainTile) {
      const size = 128;
      const t = makeCanvas(size, size);
      const tc = ctx2d(t);
      const id = tc.createImageData(size, size);
      for (let i = 0; i < id.data.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 255;
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
        id.data[i + 3] = 255;
      }
      tc.putImageData(id, 0, 0);
      this.grainTile = t;
    }
    const c = this.ctx;
    const pattern = c.createPattern(this.grainTile, 'repeat');
    if (!pattern) return;
    c.save();
    c.globalCompositeOperation = 'overlay';
    c.globalAlpha = k * 0.5;
    // Jitter the tile origin so the grain crawls instead of sitting still.
    const ox = (Math.floor(time * 24) * 37) % 128;
    const oy = (Math.floor(time * 24) * 61) % 128;
    c.translate(-ox, -oy);
    c.fillStyle = pattern;
    c.fillRect(0, 0, this.w + 128, this.h + 128);
    c.restore();
  }

  /** Sparse specks and hairs, on a slow clock, like dirt on a film gate. */
  private pfxFilmDust(k: number, time: number) {
    const c = this.ctx;
    const tick = Math.floor(time * 5);
    const count = Math.round(k * 40);
    c.save();
    c.globalAlpha = k * 0.6;
    for (let i = 0; i < count; i++) {
      const x = hash2(i, tick, 3) * this.w;
      const y = hash2(i, tick, 5) * this.h;
      const light = hash2(i, tick, 11) > 0.5;
      c.fillStyle = light ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
      if (hash2(i, tick, 17) > 0.82) {
        // Occasional hair: a short curved scratch.
        c.strokeStyle = c.fillStyle;
        c.lineWidth = Math.max(0.5, this.dpr * 0.6);
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(
          x + (hash2(i, tick, 19) - 0.5) * 40,
          y + hash2(i, tick, 23) * 30,
          x + (hash2(i, tick, 31) - 0.5) * 30,
          y + 40,
        );
        c.stroke();
      } else {
        const r = (0.4 + hash2(i, tick, 37) * 1.4) * this.dpr;
        c.beginPath();
        c.arc(x, y, r, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }

  private pfxVignette(k: number) {
    const c = this.ctx;
    const diag = Math.hypot(this.w, this.h) / 2;
    const g = c.createRadialGradient(
      this.w / 2, this.h / 2, diag * 0.35,
      this.w / 2, this.h / 2, diag,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${clamp01(k)})`);
    c.save();
    c.fillStyle = g;
    c.fillRect(0, 0, this.w, this.h);
    c.restore();
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 6 — lights                                                       */
  /* ---------------------------------------------------------------------- */

  private drawLights() {
    const { enabled, points } = this.config.lights;
    if (!enabled || points.length === 0) return;
    const c = this.ctx;
    const diag = Math.hypot(this.w, this.h);
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (const p of points) {
      const x = p.x * this.w;
      const y = p.y * this.h;
      const r = Math.max(1, p.radius * diag);
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      const a = clamp01(p.intensity / 100);
      g.addColorStop(0, `rgba(255,240,214,${a})`);
      g.addColorStop(0.5, `rgba(255,232,190,${a * 0.35})`);
      g.addColorStop(1, 'rgba(255,228,180,0)');
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    c.restore();
  }

  /* ---------------------------------------------------------------------- */
  /* Stage 7 — mask reveal                                                  */
  /* ---------------------------------------------------------------------- */

  /**
   * Punches the plain photo back through wherever the mask is opaque. The
   * mask image is loaded once and cached against its data URL.
   */
  private applyMaskReveal() {
    const m = this.config.mask;
    if (!m.enabled || !m.dataUrl || !this.plain) return;

    if (this.maskSrc !== m.dataUrl) {
      const img = new Image();
      img.src = m.dataUrl;
      this.maskImage = img;
      this.maskSrc = m.dataUrl;
    }
    const mask = this.maskImage;
    if (!mask || !mask.complete || mask.naturalWidth === 0) return;

    const tmp = this.getScratch('mask');
    const c = ctx2d(tmp);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, this.w, this.h);
    c.drawImage(this.plain, 0, 0);
    // Keep the photo only where the mask is opaque…
    c.globalCompositeOperation = m.invert ? 'destination-out' : 'destination-in';
    c.drawImage(mask, 0, 0, this.w, this.h);
    c.globalCompositeOperation = 'source-over';
    this.ctx.drawImage(tmp, 0, 0);
  }

  /* ---------------------------------------------------------------------- */
  /* Frame                                                                  */
  /* ---------------------------------------------------------------------- */

  /** Render one frame. `time` is seconds since the effect started. */
  render(time: number) {
    if (!this.ready) return;
    if (this.dirty) {
      this.prepareSource();
      this.sampleGrid();
      this.dirty = false;
    }
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    this.drawBackground();  // 1
    this.drawCells(time);   // 3 + 8
    this.applyPostEffects(time); // 5
    this.drawLights();      // 6
    this.applyMaskReveal(); // 7
  }

  /** Release scratch surfaces. Call on unmount. */
  dispose() {
    this.scratch.clear();
    this.grainTile = null;
    this.maskImage = null;
    this.prepared = null;
    this.plain = null;
  }
}
