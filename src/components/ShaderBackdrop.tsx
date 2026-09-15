import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

/**
 * ShaderGradient (React Three Fiber + three) behind the contact band only.
 *
 * Deliberately slow and desaturated: navy on navy, speed 0.15, so it reads as
 * a subtly moving surface rather than a demo. A dark overlay sits on top of it
 * in CSS (.cta::after), and a static gradient sits underneath, so the band is
 * legible whether or not this ever mounts.
 */
export default function ShaderBackdrop() {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1}
      fov={40}
      pointerEvents="none"
      lazyLoad
      powerPreference="low-power"
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        uSpeed={0.15}
        uStrength={1.1}
        uDensity={1.2}
        uFrequency={4.5}
        color1="#0b2545"
        color2="#1c4878"
        color3="#13365f"
        cAzimuthAngle={180}
        cPolarAngle={80}
        cDistance={3}
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        brightness={0.9}
        grain="on"
        lightType="3d"
        reflection={0.1}
      />
    </ShaderGradientCanvas>
  )
}
