import { cloneElement } from 'react'
import { useInView } from '../lib/env.js'

/*
 * Brisk drift-in reveal. Latches on first intersection and then stops
 * observing; `prefers-reduced-motion` is handled in CSS, where `.rise` simply
 * starts at its resting state.
 */
export default function Rise({ children, delay = 0 }) {
  const [ref, inView] = useInView({ rootMargin: '0px 0px -8% 0px', threshold: 0.05, once: true })

  return cloneElement(children, {
    ref,
    className: `${children.props.className ? `${children.props.className} ` : ''}rise${
      inView ? ' is-in' : ''
    }`,
    style: delay ? { ...children.props.style, '--rise-delay': `${delay}ms` } : children.props.style,
  })
}
