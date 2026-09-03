import { Suspense, lazy } from 'react'
import { dprCap } from '../lib/env.js'

/*
 * ShaderGradient — the one place on this page it belongs.
 *
 * A slow warm wash behind the "come and find us" band at the foot of the
 * page: cream into oat into the stall's green, nothing else. No rainbow, and
 * nowhere near the prices — the menu sits on flat cream. A heavy cream veil
 * (.visit__veil) sits over it so every word above stays on legible ground.
 *
 * lightType is pinned to '3d': the 'env' path fetches remote HDR maps, which
 * is a poor trade for a decorative wash.
 */

const ShaderGradientCanvas = lazy(() =>
  import('@shadergradient/react').then((m) => ({ default: m.ShaderGradientCanvas }))
)
const ShaderGradient = lazy(() =>
  import('@shadergradient/react').then((m) => ({ default: m.ShaderGradient }))
)

export default function MarketWash({ animate, isNarrow }) {
  return (
    <Suspense fallback={null}>
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        pixelDensity={dprCap(isNarrow)}
        fov={42}
        pointerEvents="none"
        lazyLoad
        rootMargin="150px"
        powerPreference="low-power"
      >
        <ShaderGradient
          control="props"
          type="plane"
          animate={animate ? 'on' : 'off'}
          uSpeed={0.09}
          uStrength={1.4}
          uDensity={1.05}
          uFrequency={3.4}
          uAmplitude={0}
          color1="#f6ead3"
          color2="#dda850"
          color3="#2f6142"
          cAzimuthAngle={180}
          cPolarAngle={95}
          cDistance={3}
          cameraZoom={1}
          positionX={-0.4}
          positionY={0}
          positionZ={0}
          rotationX={48}
          rotationY={0}
          rotationZ={-58}
          lightType="3d"
          brightness={1.2}
          reflection={0.1}
          grain="off"
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </Suspense>
  )
}
