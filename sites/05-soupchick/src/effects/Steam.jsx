import { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dprCap } from '../lib/env.js'

/*
 * React Three Fiber — its own scene, with its own job.
 *
 * A plume of steam rising off the soup. Two fbm layers scroll upward at
 * different rates through a hand-written fragment shader, with a soft column
 * mask so the plume gathers over the middle of the bowl and thins out before
 * it reaches the top of the frame. Screen-blended over the photograph, so on
 * the cream fallback tone it stays a faint warm haze rather than a grey smear.
 *
 * Deliberately not a ShaderGradient passenger: this is a bespoke shader on a
 * single screen-filling quad, cheap enough to sit inside a photo frame.
 */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const frag = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uTint;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // drift sideways a little more the higher it gets, the way steam does
    float sway = sin(uv.y * 3.1 + uTime * 0.35) * 0.09 * uv.y;
    vec2 q = vec2(uv.x * 1.9 + sway, uv.y * 1.35 - uTime * 0.075);

    float n = fbm(q * 2.1);
    n = fbm(q * 2.1 + vec2(n * 0.7, n * 0.4));

    float column = smoothstep(0.52, 0.06, abs(uv.x - 0.46));
    float foot = smoothstep(0.16, 0.44, uv.y);
    float head = smoothstep(1.02, 0.6, uv.y);

    float a = pow(n, 2.2) * column * foot * head * uOpacity;
    gl_FragColor = vec4(uTint, clamp(a, 0.0, 1.0));
  }
`

function Plume({ animate }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 2.4 },
      uOpacity: { value: 1.25 },
      uTint: { value: new THREE.Color('#fbf1de') },
    }),
    []
  )

  useFrame((_, delta) => {
    if (!animate) return
    uniforms.uTime.value += Math.min(delta, 0.05)
  })

  return (
    <mesh scale={[6.4, 4.2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Steam({ animate, isNarrow }) {
  return (
    <div className="steam" aria-hidden="true">
      <Canvas
        frameloop={animate ? 'always' : 'demand'}
        dpr={[1, Math.min(dprCap(isNarrow), 1.25)]}
        camera={{ position: [0, 0, 3.2], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <Plume animate={animate} />
      </Canvas>
    </div>
  )
}
