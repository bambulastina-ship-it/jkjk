/*
 * Loader for the vendored dashersw/liquid-glass-js (MIT — see
 * public/vendor/liquid-glass-js/LICENSE).
 *
 * It is not on npm and is written as classic scripts against a global
 * html2canvas, so it is loaded on demand: html2canvas is dynamically imported
 * (keeping ~45 kB gzipped off the first paint), pinned to `window`, and the
 * three scripts are injected in order.
 */

const BASE = `${import.meta.env.BASE_URL}vendor/liquid-glass-js/`

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-lg="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve()
      else {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', reject)
      }
      return
    }
    const el = document.createElement('script')
    el.src = src
    el.async = false
    el.dataset.lg = src
    el.addEventListener('load', () => {
      el.dataset.loaded = 'true'
      resolve()
    })
    el.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
    document.head.appendChild(el)
  })
}

function loadStyles(href) {
  if (document.querySelector(`link[data-lg="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.dataset.lg = href
  document.head.appendChild(link)
}

let pending

export function loadLiquidGlass() {
  if (pending) return pending

  pending = (async () => {
    if (!window.html2canvas) {
      const mod = await import('html2canvas')
      window.html2canvas = mod.default ?? mod
    }
    loadStyles(`${BASE}glass.css`)
    await loadScript(`${BASE}container.js`)
    await loadScript(`${BASE}button.js`)
    await loadScript(`${BASE}bridge.js`)
    const api = window.LiquidGlassJS
    if (!api?.Container) throw new Error('liquid-glass-js did not register')
    return api
  })().catch((err) => {
    pending = undefined
    throw err
  })

  return pending
}

/*
 * The library has no teardown of its own: kill the render loop by dropping the
 * GL reference it guards on, release the context, and unhook the instance from
 * the static registry so a later rebuild starts clean.
 */
export function destroyGlass(instance, { Container } = {}) {
  if (!instance) return
  try {
    const gl = instance.gl_refs?.gl || instance.gl
    if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext()
    instance.gl_refs = {}
    instance.gl = null
    instance.render = () => {}
    instance.element?.remove()
    const registry = Container?.instances
    if (Array.isArray(registry)) {
      const i = registry.indexOf(instance)
      if (i > -1) registry.splice(i, 1)
    }
  } catch {
    /* nothing useful to do if the context is already gone */
  }
}
