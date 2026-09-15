import { LiquidMetal } from '@paper-design/shaders-react'

/**
 * The paper-design "liquid logo" effect, applied to the company mark on the
 * loading screen only. Lazily imported by Loader and only mounted when WebGL
 * is available, motion is allowed, and the logo file actually loaded — the
 * header always uses the crisp static PNG.
 */
export default function LiquidLogo({ src }: { src: string }) {
  return (
    <LiquidMetal
      image={src}
      colorBack="#00000000"
      colorTint="#f2a900"
      repetition={3.2}
      softness={0.4}
      shiftRed={0.1}
      shiftBlue={-0.1}
      distortion={0.09}
      contour={0.82}
      angle={45}
      speed={0.5}
      fit="contain"
      style={{ width: '100%', aspectRatio: '1 / 1' }}
    />
  )
}
