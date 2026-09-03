import { useRef } from 'react'
import { useInView } from '../lib/env.js'

/**
 * Slow fade with a small upward lift. Once only, no stagger, no bounce.
 * `delay` is used sparingly — a second beat, not a cascade.
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, rootMargin: '0px 0px -12% 0px' })

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
