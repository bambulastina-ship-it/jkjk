/* Small environment probes shared by every WebGL surface on the page. */

let webgl2Cache

export function hasWebGL2() {
  if (webgl2Cache !== undefined) return webgl2Cache
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    webgl2Cache = Boolean(gl)
    // Release the probe context straight away.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webgl2Cache = false
  }
  return webgl2Cache
}

export function hasWebGL1() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Cap device pixel ratio: harder on small screens, still crisp on desktop. */
export function cappedDpr() {
  if (typeof window === 'undefined') return 1
  const dpr = window.devicePixelRatio || 1
  const ceiling = window.innerWidth < 900 ? 1.25 : 1.5
  return Math.min(dpr, ceiling)
}

/** Coarse "is this device likely to struggle" check, used to skip extras. */
export function isLowPower() {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency
  return typeof cores === 'number' && cores > 0 && cores <= 2
}
