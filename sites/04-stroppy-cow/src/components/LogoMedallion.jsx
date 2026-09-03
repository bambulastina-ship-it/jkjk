import { useEffect, useState } from 'react'
import { LiquidMetal } from '@paper-design/shaders-react'
import { hasWebGL2 } from '../lib/env.js'
import { useInView, useReducedMotion } from '../lib/hooks.js'
import { Roundel } from './Icons.jsx'

/**
 * Turns the black-and-white logo into the alpha mask LiquidMetal expects.
 *
 * The shader's pre-pass (`toProcessedLiquidMetal`) reads the ALPHA channel
 * only, so an opaque black-on-white PNG would come through as a solid square.
 * We threshold luminance into alpha instead: ink becomes opaque, paper becomes
 * transparent, and a logo that already has transparency is preserved because
 * the existing alpha is multiplied back in.
 */
function useInkMask(src) {
  const [state, setState] = useState({ status: 'loading', url: null })

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      if (cancelled) return
      try {
        const natural = Math.max(img.naturalWidth, img.naturalHeight) || 1
        const scale = Math.min(1, 640 / natural)
        const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale))
        const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale))

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('no 2d context')
        ctx.drawImage(img, 0, 0, w, h)

        const frame = ctx.getImageData(0, 0, w, h)
        const px = frame.data
        for (let i = 0; i < px.length; i += 4) {
          const alpha = px[i + 3] / 255
          const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255
          // Soft threshold around mid grey so halftone dots survive cleanly.
          let cover = (1 - lum - 0.4) / 0.18
          cover = cover < 0 ? 0 : cover > 1 ? 1 : cover
          px[i] = 0
          px[i + 1] = 0
          px[i + 2] = 0
          px[i + 3] = Math.round(cover * alpha * 255)
        }
        ctx.putImageData(frame, 0, 0)

        canvas.toBlob((blob) => {
          if (cancelled || !blob) {
            if (!cancelled) setState({ status: 'error', url: null })
            return
          }
          // Deliberately not revoked: the shader processes it asynchronously
          // and the medallion lives for the lifetime of the page.
          setState({ status: 'ready', url: URL.createObjectURL(blob) })
        }, 'image/png')
      } catch {
        setState({ status: 'error', url: null })
      }
    }

    img.onerror = () => {
      if (!cancelled) setState({ status: 'error', url: null })
    }

    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return state
}

/**
 * The signature moment: the real circular logo, alive once, in the hero.
 * Falls back to the flat logo file, and then to a plain roundel, so the
 * medallion still looks deliberate with every canvas dead.
 */
export default function LogoMedallion({ src = '/images/logo.png' }) {
  const mask = useInkMask(src)
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ threshold: 0.05, rootMargin: '120px' })
  const canShade = hasWebGL2() && mask.status === 'ready'

  const flat = mask.status === 'ready' && !hasWebGL2()
  const dead = mask.status === 'error'

  return (
    <div className="medal" ref={ref}>
      {canShade && (
        <>
          <LiquidMetal
            className="medal__shader"
            image={mask.url}
            colorBack="#131110"
            colorTint="#8aa8e6"
            speed={reduced || !inView ? 0 : 0.55}
            scale={0.94}
            softness={0.22}
            repetition={2.6}
            shiftRed={0.22}
            shiftBlue={0.24}
            distortion={0.05}
            contour={0.55}
            angle={55}
            minPixelRatio={1}
            maxPixelCount={640 * 640}
          />
          <span className="vh">The Stroppy Cow Biscuit Company logo</span>
        </>
      )}

      {flat && (
        <img
          className="medal__img"
          src={src}
          alt="The Stroppy Cow Biscuit Company logo: a Highland cow inside a circular black and white mark"
          decoding="async"
        />
      )}

      {(dead || mask.status === 'loading') && (
        <div className="medal__fallback">
          <Roundel ring="#F4EEE4" mid="#1355CE" core="#F4EEE4" />
          <span className="vh">The Stroppy Cow Biscuit Company</span>
        </div>
      )}
    </div>
  )
}
