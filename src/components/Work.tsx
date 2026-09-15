import { useEffect, useRef, useState } from 'react'
import { site } from '../site'
import { Close, ArrowRight } from './Icons'

export default function Work() {
  const [open, setOpen] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  return (
    <section className="section section--tint" id="work">
      <div className="wrap">
        <div className="work__head" data-reveal>
          <div>
            <p className="eyebrow">Recent work</p>
            <h2>Jobs we have finished</h2>
          </div>
          <a
            className="btn btn--outline btn--sm"
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            More on Instagram
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="work__grid">
          {site.work.map((w, i) => (
            <button
              className="work__item reveal"
              key={w.src}
              data-reveal
              onClick={() => setOpen(i)}
              aria-label={`${w.caption} ${i + 1} — open larger image`}
            >
              <img src={w.src} alt={`${w.caption} by ${site.legalName}`} loading="lazy" decoding="async" />
              <figcaption aria-hidden="true">{w.caption}</figcaption>
            </button>
          ))}
        </div>
      </div>

      <dialog className="lightbox" ref={dialogRef} onClose={() => setOpen(null)}>
        <button className="lightbox__close" onClick={() => setOpen(null)} aria-label="Close image">
          <Close />
        </button>
        {open !== null && (
          <img src={site.work[open].src} alt={`${site.work[open].caption} by ${site.legalName}`} />
        )}
      </dialog>
    </section>
  )
}
