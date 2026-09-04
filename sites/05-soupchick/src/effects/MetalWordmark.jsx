import { Suspense, lazy, useEffect, useState } from 'react'

/*
 * Liquid Metal (@paper-design/shaders-react, Apache-2.0).
 *
 * The shader needs a high-contrast mask. No clean logo file was supplied —
 * the green-and-white chick roundel is only legible as a thumbnail on the
 * photographed menu — so nothing is traced or guessed at here. Instead the
 * name itself is drawn to a canvas in the site's own display face, white on
 * transparent, and handed to the shader: warm brass moving across the
 * SoupChick wordmark, on the green plate that opens the menu.
 *
 * The real text stays in the DOM underneath, so the plate reads identically
 * with the shader dead or the mask never built.
 *
 * TODO when the real artwork arrives: swap buildMask() for the supplied logo
 * PNG (white on transparent) — see README.
 */

const LiquidMetal = lazy(() =>
  import('@paper-design/shaders-react').then((m) => ({ default: m.LiquidMetal }))
)

const HEAD_STACK = '"Fraunces Var", "Iowan Old Style", Georgia, serif'
const WORD = 'SoupChick'

function buildMask({ width, height }) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // fit the word to 84% of the mask width at whatever size that takes
  const probe = 200
  ctx.font = `700 ${probe}px ${HEAD_STACK}`
  const measured = ctx.measureText(WORD).width || 1
  const size = (width * 0.84 / measured) * probe

  ctx.font = `700 ${size}px ${HEAD_STACK}`
  ctx.fillText(WORD, width / 2, height * 0.54)

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
          await document.fonts.load('700 200px "Fraunces Var"')
          await document.fonts.ready
        }
      } catch {
        /* the serif fallback stack is perfectly good for a mask */
      }
      if (cancelled) return
      const url = buildMask(isNarrow ? { width: 768, height: 288 } : { width: 1280, height: 400 })
      if (cancelled || !url) return
      setMask(url)
      // give the shader a moment to compile and upload before the plain text
      // underneath is faded out
      liveTimer = window.setTimeout(() => !cancelled && setLive(true), 1100)
    }

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => make(), { timeout: 800 })
      : window.setTimeout(make, 140)

    return () => {
      cancelled = true
      window.clearTimeout(liveTimer)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [isNarrow])

  return (
    <div className={`plate__inner${live ? ' is-live' : ''}`}>
      <p className="plate__static">SoupChick</p>
      {mask ? (
        <div className="plate__shader" aria-hidden="true">
          <Suspense fallback={null}>
            <LiquidMetal
              image={mask}
              style={{ width: '100%', height: '100%' }}
              colorBack="#571a0d"
              colorTint="#f2d9a4"
              speed={animate ? 0.4 : 0}
              softness={0.3}
              repetition={2.2}
              shiftRed={0.14}
              shiftBlue={0.1}
              distortion={0.05}
              contour={0.6}
              angle={54}
              shape="none"
              scale={0.96}
              maxPixelCount={1280 * 640}
              minPixelRatio={1}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
