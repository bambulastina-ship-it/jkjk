/**
 * Tiny software rasteriser used by generate-images.mjs.
 *
 * Everything here works on a linear-light Float32 RGB buffer and only converts
 * to sRGB bytes at the very end, so gradients, shading and blurs composite the
 * way light actually behaves rather than the way 8-bit sRGB numbers average.
 */

export class Surface {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.data = new Float32Array(width * height * 3); // linear light, 0..1+
  }

  /** Run `fn(x, y, i)` for every pixel; fn returns [r,g,b] in linear light. */
  fill(fn) {
    const { w, h, data } = this;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 3;
        const c = fn(x, y, i);
        data[i] = c[0];
        data[i + 1] = c[1];
        data[i + 2] = c[2];
      }
    }
  }

  /** Alpha-composite a colour over a single pixel. */
  blend(i, rgb, alpha) {
    if (alpha <= 0) return;
    const a = alpha > 1 ? 1 : alpha;
    const d = this.data;
    d[i] += (rgb[0] - d[i]) * a;
    d[i + 1] += (rgb[1] - d[i + 1]) * a;
    d[i + 2] += (rgb[2] - d[i + 2]) * a;
  }

  /** Additive light (for highlights and bokeh). */
  add(i, rgb, amount) {
    if (amount <= 0) return;
    const d = this.data;
    d[i] += rgb[0] * amount;
    d[i + 1] += rgb[1] * amount;
    d[i + 2] += rgb[2] * amount;
  }

  /** Separable box blur, repeated to approximate a Gaussian. */
  blur(radius, passes = 3) {
    if (radius < 0.5) return this;
    const r = Math.round(radius);
    for (let p = 0; p < passes; p++) {
      this._blurAxis(r, true);
      this._blurAxis(r, false);
    }
    return this;
  }

  _blurAxis(r, horizontal) {
    const { w, h, data } = this;
    const len = horizontal ? w : h;
    const outer = horizontal ? h : w;
    const line = new Float32Array(len * 3);
    const inv = 1 / (2 * r + 1);
    for (let o = 0; o < outer; o++) {
      for (let k = 0; k < len; k++) {
        const i = horizontal ? (o * w + k) * 3 : (k * w + o) * 3;
        line[k * 3] = data[i];
        line[k * 3 + 1] = data[i + 1];
        line[k * 3 + 2] = data[i + 2];
      }
      let sr = 0, sg = 0, sb = 0;
      // Prime the running sum with the clamped left half of the window.
      for (let k = -r; k <= r; k++) {
        const c = Math.min(len - 1, Math.max(0, k)) * 3;
        sr += line[c]; sg += line[c + 1]; sb += line[c + 2];
      }
      for (let k = 0; k < len; k++) {
        const i = horizontal ? (o * w + k) * 3 : (k * w + o) * 3;
        data[i] = sr * inv;
        data[i + 1] = sg * inv;
        data[i + 2] = sb * inv;
        const outIdx = Math.min(len - 1, Math.max(0, k - r)) * 3;
        const inIdx = Math.min(len - 1, Math.max(0, k + r + 1)) * 3;
        sr += line[inIdx] - line[outIdx];
        sg += line[inIdx + 1] - line[outIdx + 1];
        sb += line[inIdx + 2] - line[outIdx + 2];
      }
    }
  }

  /** Convert linear light to 8-bit sRGB, with optional grain and vignette. */
  toSRGB({ grain = 0, vignette = 0, seed = 1 } = {}) {
    const { w, h, data } = this;
    const out = Buffer.allocUnsafe(w * h * 3);
    const rnd = mulberry32(seed);
    const cx = w / 2, cy = h / 2;
    const maxD = Math.hypot(cx, cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 3;
        let v = 1;
        if (vignette > 0) {
          const d = Math.hypot(x - cx, y - cy) / maxD;
          v = 1 - vignette * smoothstep(0.45, 1.05, d);
        }
        const n = grain > 0 ? (rnd() - 0.5) * grain : 0;
        for (let c = 0; c < 3; c++) {
          out[i + c] = Math.max(0, Math.min(255, Math.round((linearToSrgb(data[i + c] * v) + n) * 255)));
        }
      }
    }
    return out;
  }
}

/* -------------------------------------------------------------------------- */
/* Colour helpers                                                             */
/* -------------------------------------------------------------------------- */

export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c) {
  if (c <= 0) return 0;
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return v > 1 ? 1 : v;
}

/** '#rrggbb' -> linear-light [r,g,b]. */
export function hex(h) {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => srgbToLinear(parseInt(s.slice(i, i + 2), 16) / 255));
}

export const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const scale = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

/* -------------------------------------------------------------------------- */
/* Math helpers                                                               */
/* -------------------------------------------------------------------------- */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash-based 2D value noise with smooth interpolation. */
export function valueNoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const h = (a, b) => {
    let n = Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(seed, 1274126177);
    n = (n ^ (n >>> 13)) >>> 0;
    n = Math.imul(n, 1274126177) >>> 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Fractal Brownian motion over valueNoise. */
export function fbm(x, y, octaves = 4, seed = 0) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(x * freq, y * freq, seed + o * 131) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}
