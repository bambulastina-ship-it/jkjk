import { useState } from 'react'

/*
 * Fixed aspect-ratio photo frame.
 *
 * The two supplied photographs are not on disk yet, so the frame carries a
 * soft sage tone of its own and drops the <img> out cleanly if the file is
 * missing — the band keeps its proportions either way, and nothing shifts
 * when the real file lands.
 */
export default function Photo({ variant, src, alt, width, height, eager = false }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`frame frame--${variant}${failed ? ' is-missing' : ''}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
