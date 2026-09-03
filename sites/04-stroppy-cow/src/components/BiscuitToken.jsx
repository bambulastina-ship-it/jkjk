import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { cappedDpr, hasWebGL2 } from '../lib/env.js'
import { useInView, usePageVisible, useReducedMotion } from '../lib/hooks.js'
import { Roundel } from './Icons.jsx'

const PAPER = '#efe6d6'
const INK = '#171412'
const BLUE = '#1355ce'

function Face({ z, flip = false }) {
  return (
    <group position-z={z} rotation-y={flip ? Math.PI : 0}>
      <mesh>
        <ringGeometry args={[0.62, 0.86, 84]} />
        <meshStandardMaterial color={BLUE} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position-z={0.001}>
        <ringGeometry args={[0.3, 0.45, 72]} />
        <meshStandardMaterial color={INK} roughness={0.6} />
      </mesh>
      <mesh position-z={0.002}>
        <circleGeometry args={[0.16, 48]} />
        <meshStandardMaterial color={BLUE} roughness={0.45} />
      </mesh>
    </group>
  )
}

function Token({ animate }) {
  const group = useRef(null)

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.getElapsedTime()
    const targetY = (animate ? Math.sin(t * 0.38) * 0.62 : 0.42) + state.pointer.x * 0.3
    const targetX = (animate ? Math.sin(t * 0.27) * 0.1 : 0.06) - state.pointer.y * 0.18
    const k = Math.min(1, delta * 3.2)
    g.rotation.y += (targetY - g.rotation.y) * k
    g.rotation.x += (targetX - g.rotation.x) * k
  })

  return (
    <group ref={group} rotation={[0.06, 0.42, 0]}>
      <mesh rotation-x={Math.PI / 2} castShadow={false}>
        <cylinderGeometry args={[1, 1, 0.17, 96]} />
        <meshStandardMaterial color={PAPER} roughness={0.78} metalness={0.04} />
      </mesh>
      <Face z={0.086} />
      <Face z={-0.086} flip />
    </group>
  )
}

/**
 * React Three Fiber doing a job of its own: a small pressed token that echoes
 * the circular logo and the roundels on the iced planes. It idles slowly and
 * leans towards the pointer; it holds a still pose under reduced motion, and
 * stops rendering entirely when scrolled away or the tab is hidden.
 */
export default function BiscuitToken() {
  const [ref, inView] = useInView({ threshold: 0.2, rootMargin: '80px' })
  const visible = usePageVisible()
  const reduced = useReducedMotion()
  const supported = hasWebGL2()
  const animate = inView && visible && !reduced

  return (
    <div className="token" ref={ref} aria-hidden="true">
      {supported ? (
        <Canvas
          flat
          dpr={[1, cappedDpr()]}
          camera={{ position: [0, 0, 4.6], fov: 32 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          frameloop={animate ? 'always' : 'demand'}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[2.6, 3.2, 4]} intensity={1.5} />
          <directionalLight position={[-3.4, -1.2, 2]} intensity={0.55} color="#9fb6e8" />
          <Suspense fallback={null}>
            <Token animate={animate} />
          </Suspense>
        </Canvas>
      ) : (
        <div className="token__static">
          <Roundel ring="#131110" mid="#1355CE" core="#131110" />
        </div>
      )}
    </div>
  )
}
