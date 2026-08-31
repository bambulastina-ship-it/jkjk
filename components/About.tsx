/**
 * About — the family story. Deliberately plain-spoken: the reviews praise
 * kindness, care and fair prices, not luxury, so the copy leans that way.
 */

import Reveal from './Reveal';
import { DaisyMark } from './Icons';

const PILLARS = [
  {
    title: 'Family owned',
    body: 'Lana, Cindy, Tim, Hellen and Loan — the same people, behind the same chairs, who will remember what you had last time.',
  },
  {
    title: 'Detail obsessed',
    body: 'Careful shaping, clean lines and a finish that holds. Our regulars tell us we work efficiently without ever rushing them.',
  },
  {
    title: 'Clean and calm',
    body: 'A tidy, comfortable room in the Windchime Center. No noise, no pressure — just a good hour of being looked after.',
  },
];

export default function About() {
  return (
    <section id="about" className="section-y bg-bone">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Statement and story sit side by side; the three pillars run the full
            width beneath them, so none of the three ends up in a 150px column. */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ochre-ink">
              <span className="h-px w-8 rule-fade" aria-hidden="true" />
              Our salon
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-ink">
              A small salon that treats you like a regular from the first visit.
            </h2>
          </Reveal>

          <Reveal delay={120} className="max-w-xl lg:pt-3">
            <div className="space-y-5 text-lg leading-relaxed text-muted">
              <p>
                Daisy Nails is a family-run salon in the Windchime Center on the
                northwest side of Colorado Springs. It has been the same small
                team for years, and most of the people who sit down in our chairs
                have sat in them before.
              </p>
              <p>
                We do manicures, pedicures, full sets, dip and ombré, nail art and
                facial waxing — the whole menu, done properly. Walk-ins are always
                welcome, and an appointment is appreciated if you would rather not
                wait.
              </p>
            </div>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-3 sm:gap-12">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90}>
              <DaisyMark width={24} height={24} className="text-ochre" />
              <h3 className="mt-5 font-display text-2xl text-ink">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
