import { Suspense, lazy, useEffect, useState } from 'react'

/*
 * Liquid Metal (@paper-design/shaders-react, Apache-2.0).
 *
 * The shader wants a high-contrast mask, so the café's own name is set in
 * type on a canvas — white on transparent, the same Bitter face used for the
 * headings — and fed in as the mask. No invented logo device, no emblem: it
 * is the business name, and the metal reads as light moving on water.
 *
 * The real text stays in the DOM underneath for screen readers and for the
 * no-WebGL case.
 */

const LiquidMetal = lazy(() =>
  import('@paper-design/shaders-react').then((m) => ({ default: m.LiquidMetal }))
)

const HEAD_STACK = '"Bitter Var", Georgia, "Times New Roman", serif'

function fitLine(ctx, text, targetWidth, weight, tracking) {
  const probe = 100
  ctx.letterSpacing = `${tracking * probe}px`
  ctx.font = `${weight} ${probe}px ${HEAD_STACK}`
  const w = ctx.measureText(text).width || 1
  return (targetWidth / w) * probe
}

function drawLine(ctx, text, size, tracking, weight, cx, baseline) {
  ctx.letterSpacing = `${tracking * size}px`
  ctx.font = `${weight} ${size}px ${HEAD_STACK}`
  // letterSpacing adds trailing space after the final glyph; nudge back to centre
  const trail = (tracking * size) / 2
  ctx.fillText(text, cx - trail, baseline)
}

function buildMask({ width, height }) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const cx = width / 2
  const supportsTracking = 'letterSpacing' in ctx

  const t1 = supportsTracking ? 0.02 : 0
  const t2 = supportsTracking ? 0.24 : 0

  const size1 = fitLine(ctx, 'CAEN HILL', width * 0.84, 600, t1)
  const size2 = fitLine(ctx, 'CAFE', width * 0.5, 500, t2)

  drawLine(ctx, 'CAEN HILL', size1, t1, 600, cx, height * 0.52)
  drawLine(ctx, 'CAFE', size2, t2, 500, cx, height * 0.86)

  return canvas.toDataURL('image/png')
}

export default function MetalWordmark({ animate, isNarrow }) {
  const [mask, setMask] = useState(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    let liveTimer

    const make = async () => {
      try {
        if (document.fonts?.load) {
          await document.fonts.load('600 100px "Bitter Var"')
          await document.fonts.ready
        }
      } catch {
        /* fall back to the serif stack */
      }
      if (cancelled) return
      const url = buildMask(
        isNarrow ? { width: 820, height: 512 } : { width: 1024, height: 512 }
      )
      if (cancelled || !url) return
      setMask(url)
      // the shader pre-processes the mask off the main thread's critical path;
      // hold the real text until that has had time to land
      liveTimer = window.setTimeout(() => !cancelled && setLive(true), 1200)
    }

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => make(), { timeout: 800 })
      : window.setTimeout(make, 120)

    return () => {
      cancelled = true
      window.clearTimeout(liveTimer)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [isNarrow])

  return (
    <div className={`wordmark${live ? ' is-live' : ''}`}>
      <p className="wordmark__fallback">
        <span>CAEN HILL</span>
        <span>CAFE</span>
      </p>
      {mask ? (
        <div className="wordmark__shader" aria-hidden="true">
          <Suspense fallback={null}>
            <LiquidMetal
              image={mask}
              style={{ width: '100%', height: '100%' }}
              colorBack="#142a24"
              colorTint="#dfe5d7"
              speed={animate ? 0.45 : 0}
              softness={0.34}
              repetition={2.4}
              shiftRed={0.12}
              shiftBlue={0.2}
              distortion={0.06}
              contour={0.55}
              angle={68}
              shape="none"
              scale={0.94}
              maxPixelCount={1280 * 720}
              minPixelRatio={1}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
