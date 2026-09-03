import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Safe from './Safe.jsx'
import {
  cappedDpr,
  hasWebGL2,
  useDocumentVisible,
  useMediaQuery,
  usePrefersReducedMotion,
} from '../lib/env.js'

/**
 * REACT THREE FIBER — its own scene, not a passenger under ShaderGradient.
 *
 * A slow dark liquid surface lit by a single warm key: the crema on a black
 * coffee, seen at a shallow angle. It is the ground the customer quotes sit on,
 * and it is the only place on the page where the amber moves.
 *
 * Custom GLSL, one plane, no textures, no post-processing. It renders only
 * while its section is on screen and the tab is visible.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  // Ashima simplex noise (2D)
  vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec2 mod289(vec2 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
           + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Two slow octaves drifting against each other — a liquid, not a landscape.
  float surface(vec2 p, float t){
    float a = snoise(p * 0.85 + vec2(t * 0.055, t * 0.031));
    float b = snoise(p * 1.90 - vec2(t * 0.037, t * 0.062));
    float c = snoise(p * 3.70 + vec2(t * 0.021, -t * 0.044));
    return a * 0.62 + b * 0.28 + c * 0.10;
  }

  void main(){
    vUv = uv;
    vec3 pos = position;
    float e = 0.075;
    float h  = surface(pos.xy, uTime);
    float hx = surface(pos.xy + vec2(e, 0.0), uTime);
    float hy = surface(pos.xy + vec2(0.0, e), uTime);

    pos.z += h * uAmp;

    // analytic normal from the two neighbours
    vec3 tx = normalize(vec3(e, 0.0, (hx - h) * uAmp));
    vec3 ty = normalize(vec3(0.0, e, (hy - h) * uAmp));
    vNormal = normalize(mat3(modelMatrix) * normalize(cross(tx, ty)));

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  uniform vec3 uAmber;
  uniform vec3 uCamera;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main(){
    vec3 n = normalize(vNormal);
    vec3 v = normalize(uCamera - vPos);
    vec3 l = normalize(vec3(-0.55, 0.72, 0.42));

    float lambert = max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), v), 0.0), 26.0);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.2);

    vec3 col = uInk;
    col += uAmber * (lambert * 0.26);
    col += uAmber * (spec * 1.45);
    col += uAmber * (fres * 0.34);

    // fade the far edge and the corners so the plane has no visible border
    float edge = smoothstep(0.0, 0.30, vUv.y) * smoothstep(1.0, 0.62, vUv.y);
    float side = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x);
    float a = clamp(edge * side, 0.0, 1.0);

    gl_FragColor = vec4(col, a);
  }
`

function Crema({ segments, amplitude, animate }) {
  const material = useRef(null)
  const { camera, invalidate } = useThree()

  // R3F leaves the default camera looking straight down -Z. Aim it at the
  // surface so the plane fills the lower two thirds of the frame instead of
  // grazing the very bottom edge.
  useLayoutEffect(() => {
    camera.lookAt(0, -0.35, 0)
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 6.0 },
      uAmp: { value: amplitude },
      uInk: { value: new THREE.Color('#1b1512') },
      uAmber: { value: new THREE.Color('#e08b3c') },
      uCamera: { value: new THREE.Vector3() },
    }),
    [amplitude]
  )

  useFrame((state, delta) => {
    const u = material.current?.uniforms
    if (!u) return
    if (animate) u.uTime.value += Math.min(delta, 0.05) * 0.85
    u.uCamera.value.copy(camera.position)
  })

  return (
    <mesh rotation={[-Math.PI / 2.02, 0, 0]} position={[0, -0.32, 0]}>
      <planeGeometry args={[9, 9, segments, segments]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default function CremaField({ active }) {
  const reduced = usePrefersReducedMotion()
  const small = useMediaQuery('(max-width: 700px)')
  const visible = useDocumentVisible()

  if (!hasWebGL2()) return null

  const animate = active && visible && !reduced
  // 'never' parks the loop entirely when the section is off screen or the tab
  // is hidden; 'demand' gives reduced-motion users a single static frame.
  const frameloop = reduced ? 'demand' : animate ? 'always' : 'never'

  return (
    <div className="voices__canvas" aria-hidden="true">
      <Safe>
        <Canvas
          frameloop={frameloop}
          dpr={cappedDpr(small)}
          camera={{ position: [0, 0.92, 2.15], fov: 40 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
          style={{ background: 'transparent' }}
        >
          <Crema
            segments={small ? 84 : 140}
            amplitude={small ? 0.16 : 0.2}
            animate={animate}
          />
        </Canvas>
      </Safe>
    </div>
  )
}
