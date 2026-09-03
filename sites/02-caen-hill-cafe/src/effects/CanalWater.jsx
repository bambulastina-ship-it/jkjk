import { Suspense, lazy } from 'react'
import { dprCap } from '../lib/env.js'

/*
 * ShaderGradient — the hero's water.
 * `type="waterPlane"` is the whole reason it is here: a slow, low-strength
 * sheet of moving water in the sage / canal-green family, sitting behind the
 * hero type. Everything above it stays on solid, legible ground (see the
 * cream wash in `.hero__canvas::after`).
 *
 * lightType is forced to '3d' — the 'env' lighting path fetches HDR maps from
 * a remote base path, which is the wrong trade on a towpath with one bar of
 * signal.
 */

const ShaderGradientCanvas = lazy(() =>
  import('@shadergradient/react').then((m) => ({ default: m.ShaderGradientCanvas }))
)
const ShaderGradient = lazy(() =>
  import('@shadergradient/react').then((m) => ({ default: m.ShaderGradient }))
)

export default function CanalWater({ animate, isNarrow }) {
  return (
    <Suspense fallback={null}>
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        pixelDensity={dprCap(isNarrow)}
        fov={40}
        pointerEvents="none"
        lazyLoad
        rootMargin="120px"
        powerPreference="low-power"
      >
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate={animate ? 'on' : 'off'}
          uSpeed={0.08}
          uStrength={0.9}
          uDensity={1.1}
          uFrequency={4.5}
          uAmplitude={0}
          color1="#e6ecdd"
          color2="#a3b39a"
          color3="#2f5a4c"
          cAzimuthAngle={180}
          cPolarAngle={97}
          cDistance={3.2}
          cameraZoom={1}
          positionX={-0.6}
          positionY={0.1}
          positionZ={0}
          rotationX={46}
          rotationY={0}
          rotationZ={-60}
          lightType="3d"
          brightness={1.15}
          reflection={0.12}
          grain="off"
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </Suspense>
  )
}
