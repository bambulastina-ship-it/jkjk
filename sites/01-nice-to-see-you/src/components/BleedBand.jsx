import Photo from './Photo.jsx'

/**
 * Full-bleed band: the one landscape photograph, edge to edge, with a single
 * line of display type sitting in the shadow at the bottom.
 */
export default function BleedBand() {
  return (
    <section className="bleed" aria-label="The coffee">
      <Photo
        className="bleed__photo"
        file="espresso.jpg"
        alt="A matte-dark cup and saucer branded NICE TO SEE YOU Cafe in white lettering, holding coffee with a golden crema, on dark wood with a glass of water and a jar of coffee beans blurred behind."
        width={1600}
        height={1200}
        ratio="4 / 3"
        tone="#2e251d"
        position="50% 50%"
        sizes="100vw"
      />
      <div className="bleed__overlay">
        <div className="shell bleed__overlay-inner">
          <p className="bleed__quote">A cup with the shop&rsquo;s own name on&nbsp;it.</p>
        </div>
      </div>
    </section>
  )
}
