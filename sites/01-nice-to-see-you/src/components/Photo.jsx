import { useState } from 'react'
import { IMG } from '../lib/site.js'

/**
 * The owner's photographs. The files are not on disk yet, so every frame holds
 * a warm solid tone and its own aspect ratio: the layout reads correctly, and
 * nothing shifts when the real image arrives. Never distorted — cover plus a
 * chosen object-position.
 */
export default function Photo({
  file,
  alt,
  width,
  height,
  tone,
  position = '50% 50%',
  ratio,
  sizes = '100vw',
  loading = 'lazy',
  fetchPriority,
  caption,
  className = '',
  frameClassName = '',
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <figure
      className={`photo ${loaded ? 'is-loaded' : ''} ${className}`.trim()}
      style={{ '--tone': tone, '--ar': ratio ?? `${width} / ${height}`, '--pos': position }}
    >
      <span className={`photo__frame ${frameClassName}`.trim()}>
        <img
          className={`photo__img ${loaded ? 'is-loaded' : ''}`}
          src={IMG(file)}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onLoad={() => setLoaded(true)}
          /* If the file is not there yet the holding tone simply stays. */
          onError={() => setLoaded(false)}
        />
      </span>
      {caption ? <figcaption className="caption">{caption}</figcaption> : null}
    </figure>
  )
}
