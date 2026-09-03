import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dprCap } from '../lib/env.js'

/*
 * React Three Fiber — its own scene, not a passenger of ShaderGradient.
 *
 * A staircase of still pounds: eight flat sheets of water stepping away from
 * the camera, each one gently displaced by two crossing sine waves in the
 * vertex shader and lit by a slow travelling sheen in the fragment shader.
 * It is an abstraction of the setting — a flight of water going downhill —
 * and deliberately makes no claim about how many locks there are.
 */

const STEPS = 8

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 p = position;
    float w =
      sin(p.x * 2.6 + uTime * 0.42 + uOffset) * 0.035 +
      sin(p.y * 5.0 - uTime * 0.27 + uOffset * 1.7) * 0.022;
    p.z += w;
    vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const frag = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uOffset;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    float edgeX = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
    float edgeY = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    float mask = edgeX * edgeY;

    float sheen = smoothstep(0.15, 1.0, sin(vUv.x * 3.0 - uTime * 0.18 + uOffset) * 0.5 + 0.5);
    float lift = clamp(vWave * 12.0 + 0.5, 0.0, 1.0);

    vec3 col = mix(uColorB, uColorA, lift * 0.6 + sheen * 0.4);
    gl_FragColor = vec4(col, mask * uOpacity);
  }
`

function Flight({ animate }) {
  const light = useMemo(() => new THREE.Color('#cdd9c4'), [])
  const dark = useMemo(() => new THREE.Color('#20463b'), [])

  const steps = useMemo(
    () =>
      Array.from({ length: STEPS }, (_, i) => ({
        key: i,
        position: [(i % 2 ? 0.08 : -0.08) * i, 0.95 - i * 0.3, 2.1 - i * 0.62],
        uniforms: {
          uTime: { value: i * 1.7 },
          uOffset: { value: i * 0.9 },
          uColorA: { value: light },
          uColorB: { value: dark },
          uOpacity: { value: 0.5 - i * 0.035 },
        },
      })),
    [light, dark]
  )

  const group = useRef(null)

  useFrame((state, delta) => {
    if (!animate) return
    const d = Math.min(delta, 0.05)
    for (const step of steps) step.uniforms.uTime.value += d
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.05
    }
  })

  return (
    <group ref={group} rotation={[-Math.PI / 2.35, 0, 0]}>
      {steps.map((step) => (
        <mesh key={step.key} position={step.position}>
          <planeGeometry args={[3.6, 0.95, 32, 10]} />
          <shaderMaterial
            vertexShader={vert}
            fragmentShader={frag}
            uniforms={step.uniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function LockFlight({ animate, isNarrow }) {
  return (
    <Canvas
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, dprCap(isNarrow)]}
      camera={{ position: [0, 0.15, 4.6], fov: 34 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Flight animate={animate} />
    </Canvas>
  )
}
