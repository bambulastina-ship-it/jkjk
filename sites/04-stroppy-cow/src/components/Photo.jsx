import { useState } from 'react'
import { BiscuitIcon } from './Icons.jsx'

/**
 * A fixed-ratio photo slot. The warm paper tone behind it is part of the
 * design, so the layout reads correctly (and never shifts) whether or not the
 * file is on disk yet. Images are never distorted — always object-fit: cover.
 */
export default function Photo({
  src,
  alt,
  ratio,
  position = 'center',
  className = '',
  loading = 'lazy',
  fetchPriority,
  sizes,
  label
}) {
  const [status, setStatus] = useState('loading')

  return (
    <figure
      className={`photo ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        sizes={sizes}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('missing')}
        style={{
          objectPosition: position,
          opacity: status === 'ready' ? 1 : 0,
          transition: 'opacity .5s ease'
        }}
      />
      {status === 'missing' && (
        <div className="photo__pending">
          <BiscuitIcon />
          <span>{label || 'Photograph to come'}</span>
          <code>{src.replace(/^\//, '')}</code>
        </div>
      )}
    </figure>
  )
}
