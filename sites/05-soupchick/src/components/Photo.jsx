import { useState } from 'react'

/*
 * Fixed aspect-ratio photo frame.
 *
 * None of the four photographs are on disk yet, so the frame carries a warm
 * bread-crust gradient of its own and drops the <img> out cleanly when the
 * file is missing. The band keeps its proportions either way, so nothing
 * shifts on the page when the real files land.
 */
export default function Photo({
  shape = 'wide',
  tone = '',
  src,
  alt,
  width,
  height,
  eager = false,
  children,
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`frame frame--${shape}${tone ? ` frame--${tone}` : ''}${
        failed ? ' is-missing' : ''
      }`}
    >
      {failed ? null : (
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
      )}
      {children}
    </div>
  )
}
