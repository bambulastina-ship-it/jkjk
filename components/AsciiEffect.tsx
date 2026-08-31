'use client';

/**
 * ============================================================================
 * <AsciiEffect /> — the "Ink Garden" canvas effect, as a reusable component
 * ----------------------------------------------------------------------------
 * Wraps the Canvas2D pipeline in `lib/ascii/pipeline.ts` and owns everything
 * environmental: sizing, motion preference, visibility and frame pacing.
 *
 * USAGE
 *   <AsciiEffect src="/img/daisy-hero.webp" alt="…" className="absolute inset-0" />
 *
 *   // Tweak the look by merging onto the hero defaults:
 *   <AsciiEffect
 *     src="/img/daisy-hero.webp"
 *     config={makeConfig({ renderMode: 'dots', cellSize: 14, coverage: 70 })}
 *   />
 *
 * BEHAVIOUR GUARANTEES
 *   - Reduced motion: renders exactly one static frame and never starts a loop.
 *   - Off-screen: the RAF loop is suspended by an IntersectionObserver, so a
 *     hero that has scrolled away costs nothing.
 *   - Backgrounded tab: the loop stops on `visibilitychange`.
 *   - Mobile: devicePixelRatio is capped and small viewports are frame-capped.
 *   - First paint: the image is fetched and the canvas is built after mount, so
 *     the effect never blocks hydration or the LCP text.
 *
 * ACCESSIBILITY
 *   The canvas is decorative. It is marked aria-hidden and the meaningful
 *   description of the underlying photograph is exposed via the `alt` prop on a
 *   visually-hidden element, so screen readers get the content without being
 *   read a wall of canvas.
 * ==========================================================================*/

import { useEffect, useRef, useState } from 'react';
import { AsciiRenderer } from '@/lib/ascii/pipeline';
import { HERO_ASCII_CONFIG, type AsciiConfig } from '@/lib/ascii/types';

export interface AsciiEffectProps {
  /** Source photograph. Anything an <img> can load. */
  src: string;
  /** Description of the source photo, for assistive tech. */
  alt?: string;
  /** Effect configuration. Defaults to the hero config. */
  config?: AsciiConfig;
  className?: string;
  /**
   * Cap on devicePixelRatio. 1.5 keeps a full-bleed hero cheap on phones while
   * staying visually crisp — the effect is a coarse grid, so extra pixels buy
   * very little.
   */
  maxDpr?: number;
  /**
   * Frame cap below `mobileBreakpoint`. The effect reads fine at 30fps and
   * halving the frame rate roughly halves its cost on weak hardware.
   */
  mobileFps?: number;
  mobileBreakpoint?: number;
  /** Fired once the source image has decoded and the first frame is drawn. */
  onReady?: () => void;
}

export default function AsciiEffect({
  src,
  alt,
  config = HERO_ASCII_CONFIG,
  className,
  maxDpr = 1.5,
  mobileFps = 30,
  mobileBreakpoint = 768,
  onReady,
}: AsciiEffectProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  // Keep the latest callback without making it a dependency of the main effect.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let renderer: AsciiRenderer;
    try {
      renderer = new AsciiRenderer(canvas, config, { maxDpr });
    } catch {
      // No Canvas2D (very old or locked-down engine): leave the static poster.
      return;
    }

    let rafId = 0;
    let disposed = false;
    let visible = true;
    let tabVisible = true;
    let started = 0;
    let lastFrame = 0;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /** Resize to the host box and redraw. */
    const measure = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      renderer.resize(rect.width, rect.height, window.devicePixelRatio || 1);
    };

    const drawStatic = () => {
      measure();
      // A fixed, non-zero time gives a composed frame rather than the trough of
      // whatever animation cycle t=0 happens to land on.
      renderer.render(1.15);
    };

    const loop = (now: number) => {
      if (disposed) return;
      rafId = requestAnimationFrame(loop);
      if (!visible || !tabVisible) return;

      // Frame-cap small viewports.
      const cap =
        window.innerWidth < mobileBreakpoint && mobileFps > 0 ? 1000 / mobileFps : 0;
      if (cap > 0 && now - lastFrame < cap) return;
      lastFrame = now;

      if (!started) started = now;
      renderer.render((now - started) / 1000);
    };

    const start = () => {
      if (disposed || rafId) return;
      lastFrame = 0;
      rafId = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    /* --- Source image ---------------------------------------------------- */
    const img = new Image();
    img.decoding = 'async';
    // Same-origin in this project, but harmless and required if the source ever
    // moves to a CDN — getImageData would otherwise taint the canvas.
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (disposed) return;
      renderer.setImage(img);
      setReady(true);
      onReadyRef.current?.();
      if (reduceMotion || !config.animated) {
        drawStatic();
      } else {
        measure();
        start();
      }
    };
    img.onerror = () => {
      // Leave the CSS poster background in place; nothing else to do.
    };
    img.src = src;

    /* --- Resize (debounced) ---------------------------------------------- */
    // Re-sampling the grid is the expensive part of a resize, so coalesce
    // bursts (drag-resizing, mobile URL-bar collapse) into one rebuild.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (disposed || !renderer.ready) return;
        if (reduceMotion || !config.animated) drawStatic();
        else measure();
      }, 120);
    });
    ro.observe(host);

    /* --- Visibility ------------------------------------------------------ */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (reduceMotion || !config.animated) return;
        if (visible) start();
        else stop();
      },
      // A small negative margin means we stop a moment before it fully leaves.
      { rootMargin: '80px' },
    );
    io.observe(host);

    const onVisibility = () => {
      tabVisible = document.visibilityState === 'visible';
      if (reduceMotion || !config.animated) return;
      if (tabVisible && visible) start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* --- Live motion-preference changes ---------------------------------- */
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      if (mq.matches) {
        stop();
        drawStatic();
      } else if (config.animated) {
        started = 0;
        start();
      }
    };
    mq.addEventListener?.('change', onMotionChange);

    return () => {
      disposed = true;
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      mq.removeEventListener?.('change', onMotionChange);
      img.onload = null;
      img.onerror = null;
      renderer.dispose();
    };
  }, [src, config, maxDpr, mobileFps, mobileBreakpoint]);

  return (
    <div ref={hostRef} className={className}>
      {/* The canvas itself is decorative — the description below carries the
          meaning, so aria-hidden goes on the canvas and NOT on the wrapper
          (hiding the wrapper would hide the description with it). */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block h-full w-full"
        style={{
          // Fade the canvas in once the first frame exists, so there is no
          // flash of an empty box between hydration and decode.
          opacity: ready ? 1 : 0,
          transition: 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {alt ? <span className="sr-only">{alt}</span> : null}
    </div>
  );
}
