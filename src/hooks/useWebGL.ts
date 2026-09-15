import { useEffect, useState } from 'react'

/**
 * Feature-detect WebGL once. Shader components are gated on this so a machine
 * without a GPU context (or with WebGL disabled) falls back to static CSS
 * instead of rendering a blank canvas.
 */
export function useWebGL(): boolean {
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let supported = false
    try {
      const canvas = document.createElement('canvas')
      supported = Boolean(
        canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl'),
      )
    } catch {
      supported = false
    }
    setOk(supported)
  }, [])

  return ok
}
