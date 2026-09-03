import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import Safe from './Safe.jsx'
import {
  hasWebGL2,
  useDocumentVisible,
  useMediaQuery,
  usePrefersReducedMotion,
} from '../lib/env.js'

/**
 * SHADERGRADIENT — the closing panel only.
 *
 * Kept dark and almost still: near-black, a burnt umber and one ember of the
 * house amber, drifting slowly behind the address. No rainbow. It sits under a
 * heavy scrim so the address, the phone number and the button stay on solid,
 * legible ground.
 *
 * `lightType="3d"` deliberately — the "env" path pulls three remote HDR maps.
 * The canvas is mounted only while the section is on screen and the tab is
 * visible, so it never shares the GPU with the R3F scene further up the page.
 */
export default function VisitBackdrop({ active }) {
  const reduced = usePrefersReducedMotion()
  const small = useMediaQuery('(max-width: 700px)')
  const visible = useDocumentVisible()

  if (!hasWebGL2()) return null
  if (!active || !visible) return null

  return (
    <div className="visit__canvas" aria-hidden="true">
      <Safe>
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0 }}
          pixelDensity={small ? 1 : 1.4}
          fov={40}
          pointerEvents="none"
          lazyLoad={false}
          powerPreference="low-power"
        >
          <ShaderGradient
            control="props"
            type="waterPlane"
            /* reduced motion keeps the frame, drops the movement */
            animate={reduced ? 'off' : 'on'}
            uTime={4.2}
            uSpeed={0.09}
            uStrength={1.6}
            uDensity={1.1}
            uFrequency={0}
            uAmplitude={0}
            color1="#0b0a09"
            color2="#3a2413"
            color3="#b4600f"
            cDistance={3.1}
            cAzimuthAngle={180}
            cPolarAngle={96}
            cameraZoom={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            rotationX={46}
            rotationY={0}
            rotationZ={-62}
            lightType="3d"
            brightness={0.85}
            grain="on"
            grainBlending={0.2}
            reflection={0.1}
            range="disabled"
            enableTransition={false}
          />
        </ShaderGradientCanvas>
      </Safe>
    </div>
  )
}
