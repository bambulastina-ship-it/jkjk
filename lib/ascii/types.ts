/**
 * ============================================================================
 * INK GARDEN — ASCII canvas effect: configuration surface
 * ----------------------------------------------------------------------------
 * A reimplementation of the 21st.dev "Ink Garden" ASCII effect
 * (https://21st.dev/community/ascii), written from scratch against the
 * Canvas2D raster API only — no WebGL, no shaders, no third-party library.
 *
 * This file is the whole tweakable surface of the effect. Every knob is typed
 * so a designer can change the look without reading the renderer.
 * ==========================================================================*/

/** Per-cell drawing primitive. Each is its own routine in `renderers.ts`. */
export type RenderMode =
  | 'characters'
  | 'dither'
  | 'mosaic'
  | 'pixel'
  | 'dots'
  | 'cross'
  | 'diamond'
  | 'voxel'
  | 'lego'
  | 'mixed'
  | 'lines'
  | 'diagonal'
  | 'braille'
  | 'disco'
  | 'hexdump'
  | 'matrix'
  | 'rings'
  | 'hearts'
  | 'stars'
  | 'hexagons'
  | 'triangles'
  | 'bubbles'
  | 'hatch'
  | 'contour'
  | 'halfblocks';

/** What remains visible *behind* the per-cell drawing. */
export type BgMode = 'none' | 'blur' | 'color' | 'photo';

/** Named glyph ramps, ordered light → dark. `custom` uses `customChars`. */
export type CharSet =
  | 'standard'
  | 'blocks'
  | 'minimal'
  | 'dense'
  | 'binary'
  | 'hex'
  | 'custom';

export type BlurType =
  | 'off'
  | 'gaussian'
  | 'directional'
  | 'tilt'
  | 'lens'
  | 'radial'
  | 'progressive';

export type AnimStyle = 'wave' | 'pulse' | 'shimmer' | 'ripple' | 'flicker';

/** A toggle plus a 0–100 strength, used by the animation and post-effect knobs. */
export interface Toggle {
  enabled: boolean;
  intensity: number;
}

/** Control point for the tone curve, both axes normalised 0–1. */
export interface CurvePoint {
  x: number;
  y: number;
}

/** Additive glow source, positioned in normalised canvas space. */
export interface LightPoint {
  x: number; // 0–1
  y: number; // 0–1
  radius: number; // fraction of the canvas diagonal
  intensity: number; // 0–100
}

export interface LightsConfig {
  enabled: boolean;
  points: LightPoint[];
}

/**
 * Reveal mask. Where the mask is opaque, the plain unprocessed photo shows
 * through instead of the effect (flip with `invert`).
 */
export interface MaskConfig {
  enabled: boolean;
  tool: 'freehand' | 'rect' | 'ellipse';
  brushSize: number;
  showOverlay: boolean;
  invert: boolean;
  /** Greyscale PNG data URL; white = reveal the photo. */
  dataUrl: string | null;
  shapes: Array<{ type: string; x: number; y: number; w: number; h: number }>;
}

/** The nine post-effects, each independently toggleable at a 0–100 intensity. */
export interface PostEffects {
  vignette: Toggle;
  scanLines: Toggle;
  chromatic: Toggle;
  bloom: Toggle;
  filmGrain: Toggle;
  glitch: Toggle;
  pixelate: Toggle;
  halftone: Toggle;
  filmDust: Toggle;
}

export interface AsciiConfig {
  /* --- Sampling & primitives ------------------------------------------- */
  renderMode: RenderMode;
  bgMode: BgMode;
  bgBlur: number; // px, used when bgMode === 'blur'
  bgOpacity: number; // 0–100
  bgColor?: string; // used when bgMode === 'color'
  cellSize: number; // px grid pitch
  coverage: number; // 0–100, share of cells actually drawn
  invert: boolean;
  styleBlend: GlobalCompositeOperation;
  charSet: CharSet;
  customChars: string;

  /* --- Tone ------------------------------------------------------------- */
  brightness: number; // -100..100
  contrast: number; // 0..200 (100 = neutral)
  edgeEmphasis: number; // 0..100
  density: number; // 0..100, mode-specific fill weight
  toneCurve: CurvePoint[];

  /* --- Colour ----------------------------------------------------------- */
  tint: string;
  tintOpacity: number; // 0..100
  overlayBlend: GlobalCompositeOperation;
  saturation: number; // 0..200 (100 = neutral)
  grayscale: number; // 0..100

  /* --- Blur ------------------------------------------------------------- */
  blurType: BlurType;
  blurAmount: number; // 0..100
  blurAngle: number; // degrees, for directional
  directionalBothSides: boolean;
  tiltFocus: number; // 0..100 band height
  tiltPosition: number; // 0..100 band centre
  tiltFeather: number; // 0..100 edge softness
  lensFocus: number; // 0..100 sharp-circle radius
  blurCenterX: number; // 0..100, for radial
  blurCenterY: number; // 0..100
  progressivePosition: number; // 0..100
  progressiveReverse: boolean;

  /* --- Layers ----------------------------------------------------------- */
  pfx: PostEffects;
  lights: LightsConfig;
  mask: MaskConfig;

  /* --- Animation -------------------------------------------------------- */
  animated: boolean;
  animStyle: AnimStyle;
  animSpeed: Toggle;
  animIntensity: Toggle;
}

/* -------------------------------------------------------------------------- */
/* Glyph ramps — ordered LIGHT → DARK.                                        */
/* -------------------------------------------------------------------------- */

export const CHAR_SETS: Record<Exclude<CharSet, 'custom'>, string> = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  minimal: ' .:*#',
  dense: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  binary: ' 01',
  hex: '0123456789ABCDEF',
};

export function resolveCharSet(config: AsciiConfig): string {
  if (config.charSet === 'custom') {
    return config.customChars.length > 0 ? config.customChars : CHAR_SETS.standard;
  }
  return CHAR_SETS[config.charSet];
}

/* -------------------------------------------------------------------------- */
/* The hero's default configuration.                                          */
/* -------------------------------------------------------------------------- */

/**
 * Supplied verbatim by the brief, with one deliberate change: `tint` is the
 * brand ochre rather than the stock blue `#3ca6ff`, which fought the warm
 * palette everywhere else on the page. `tintOpacity` stays at 0 so the tint is
 * inert until someone wants it — the hook is there, the effect is not.
 */
export const HERO_ASCII_CONFIG: AsciiConfig = {
  renderMode: 'dither',
  bgMode: 'none',
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 9,
  coverage: 100,
  invert: false,
  styleBlend: 'source-over',
  charSet: 'standard',
  customChars: '',
  brightness: 0,
  contrast: 158,
  edgeEmphasis: 0,
  density: 20,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  tint: '#c08a2e',
  tintOpacity: 0,
  overlayBlend: 'multiply',
  saturation: 100,
  grayscale: 0,
  blurType: 'off',
  blurAmount: 35,
  blurAngle: 0,
  directionalBothSides: false,
  tiltFocus: 35,
  tiltPosition: 50,
  tiltFeather: 15,
  lensFocus: 40,
  blurCenterX: 50,
  blurCenterY: 50,
  progressivePosition: 55,
  progressiveReverse: false,
  pfx: {
    vignette: { enabled: false, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: false, intensity: 25 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: 'pulse',
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  lights: { enabled: false, points: [] },
  mask: {
    enabled: false,
    tool: 'freehand',
    brushSize: 30,
    showOverlay: true,
    invert: false,
    dataUrl: null,
    shapes: [],
  },
};

/** Shallow-merge a partial override onto the hero defaults. */
export function makeConfig(overrides: Partial<AsciiConfig> = {}): AsciiConfig {
  return {
    ...HERO_ASCII_CONFIG,
    ...overrides,
    pfx: { ...HERO_ASCII_CONFIG.pfx, ...(overrides.pfx ?? {}) },
    lights: { ...HERO_ASCII_CONFIG.lights, ...(overrides.lights ?? {}) },
    mask: { ...HERO_ASCII_CONFIG.mask, ...(overrides.mask ?? {}) },
  };
}
