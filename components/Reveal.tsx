'use client';

/**
 * Scroll-reveal wrapper. One IntersectionObserver per element, disconnected as
 * soon as it fires — a reveal is a one-shot, so there is nothing to keep
 * watching. The motion itself lives in CSS (`.reveal` / `.is-visible`), which
 * is also where `prefers-reduced-motion` collapses it to an instant reveal.
 */

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger, in ms, for items revealed as a group. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser cannot observe, show the content rather than hiding it.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const show = (withDelay: boolean) => {
      el.style.transitionDelay = withDelay ? `${delay}ms` : '0ms';
      el.classList.add('is-visible');
    };

    // If this element is already at or above the viewport by the time it
    // hydrates, it was scrolled past before the observer existed — reveal it
    // immediately rather than waiting for an intersection that will never come.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      show(false);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show(true);
        io.disconnect();
      },
      // Fire a little before the element reaches the viewport edge, so the
      // transition is already underway by the time it is properly in view.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
