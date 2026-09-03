/**
 * Builds the high-contrast mask that Liquid Metal needs.
 *
 * It is NOT a photograph and it is NOT an invented emblem: it is the business's
 * own name — the same words that are painted on the fascia board above the door
 * — set cleanly in type, white on transparent, on a canvas. That bitmap is what
 * the shader displaces.
 */

const FONT_STACK = "'Inter', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
const FONT_SIZE = 200
const TRACKING_EM = 0.12
const PAD_X_EM = 0.3
const PAD_Y_EM = 0.34
const LINE_GAP_RATIO = 0.44 // of cap height

/** The fascia reads as one line; narrow screens get two so it stays legible. */
export function wordmarkLines(viewportWidth) {
  return viewportWidth < 780 ? ['NICE TO', 'SEE YOU'] : ['NICE TO SEE YOU']
}

async function ensureFont() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.load(`500 ${FONT_SIZE}px 'Inter'`)
    await document.fonts.ready
  } catch {
    /* system fallback is fine */
  }
}

function measureTracked(ctx, text, tracking) {
  let width = 0
  for (const ch of text) width += ctx.measureText(ch).width + tracking
  return Math.max(0, width - tracking)
}

function drawTracked(ctx, text, x, y, tracking) {
  let cursor = x
  for (const ch of text) {
    ctx.fillText(ch, cursor, y)
    cursor += ctx.measureText(ch).width + tracking
  }
}

/**
 * @returns {Promise<{src: string, aspect: number, fontPct: number,
 *                    lineHeight: number, padPct: number, lines: string[]} | null>}
 */
export async function buildWordmarkMask(lines) {
  if (typeof document === 'undefined') return null
  await ensureFont()

  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) return null

  const font = `500 ${FONT_SIZE}px ${FONT_STACK}`
  probe.font = font

  const tracking = FONT_SIZE * TRACKING_EM
  const padX = FONT_SIZE * PAD_X_EM
  const padY = FONT_SIZE * PAD_Y_EM

  const capMetrics = probe.measureText('H')
  const capHeight = capMetrics.actualBoundingBoxAscent || FONT_SIZE * 0.72
  const lineGap = capHeight * LINE_GAP_RATIO

  const lineWidths = lines.map((line) => measureTracked(probe, line, tracking))
  const blockWidth = Math.max(...lineWidths)
  const blockHeight = capHeight * lines.length + lineGap * (lines.length - 1)

  const width = Math.round(blockWidth + padX * 2)
  const height = Math.round(blockHeight + padY * 2)
  if (!Number.isFinite(width) || width < 8 || height < 8) return null

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, width, height)
  ctx.font = font
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  lines.forEach((line, i) => {
    const baseline = padY + capHeight + i * (capHeight + lineGap)
    drawTracked(ctx, line, padX, baseline, tracking)
  })

  return {
    src: canvas.toDataURL('image/png'),
    aspect: width / height,
    // Numbers the CSS fallback text uses (via container-query units) so the
    // plain-HTML wordmark sits exactly where the metal one does.
    fontPct: (FONT_SIZE / width) * 100,
    lineHeight: (capHeight + lineGap) / FONT_SIZE,
    padPct: (padX / width) * 100,
    lines,
  }
}
