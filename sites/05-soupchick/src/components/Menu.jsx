import { menu } from '../data/menu.js'

/*
 * The menu, set as real text.
 *
 * Structure: one <section> per course group, each labelled by its own <h3>,
 * with a <dl> of name → price pairs. A definition list is the honest markup
 * here — a screen reader reads "Ham & Cheese, five pounds fifty" as a pair,
 * and the dotted leader is drawn in CSS so nothing decorative lands in the
 * accessibility tree.
 *
 * This is INFORMATION. There is no ordering, no basket, no total anywhere on
 * this page.
 */

function Row({ item }) {
  return (
    <div className="menu-row">
      <dt>
        <span className="menu-name">{item.name}</span>
        {item.desc ? <span className="menu-desc">{item.desc}</span> : null}
      </dt>
      <dd>
        {item.qual ? <span className="qual">{item.qual}</span> : null}
        {item.price}
      </dd>
    </div>
  )
}

export default function Menu() {
  return (
    <div className="menu__card">
      {menu.map((section) => (
        <section
          key={section.id}
          className="menu__section"
          aria-labelledby={`menu-${section.id}`}
        >
          <div className="menu__section-head">
            <h3 id={`menu-${section.id}`}>{section.title}</h3>
          </div>
          {section.note ? <p className="menu__section-note">{section.note}</p> : null}
          <dl className={`menu-list${section.split ? ' menu-list--split' : ''}`}>
            {section.items.map((item) => (
              <Row key={`${section.id}-${item.name}`} item={item} />
            ))}
          </dl>
          {section.foot ? <p className="menu__section-foot">{section.foot}</p> : null}
        </section>
      ))}
    </div>
  )
}
