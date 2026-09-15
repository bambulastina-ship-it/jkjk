// Asserts every foreground/background pair actually used in the design meets
// WCAG AA (4.5:1 for body text, 3:1 for large text / UI borders).
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n>>16)&255, (n>>8)&255, n&255] }
const lin = (c) => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4) }
const lum = (h) => { const [r,g,b] = hex(h).map(lin); return 0.2126*r + 0.7152*g + 0.0722*b }
const ratio = (a, b) => { const [x,y] = [lum(a), lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05) }

const T = {
  navy900:'#0b2545', navy800:'#0f2d54', amber500:'#f2a900', amber400:'#ffc233',
  amber700:'#8a5c00', ink:'#14202e', slate700:'#334155', slate600:'#475569',
  bg:'#f8fafc', card:'#ffffff', white:'#ffffff', slate100:'#eef2f6',
}
const pairs = [
  ['body text on page',        T.slate700, T.bg,       4.5],
  ['body text on card',        T.slate700, T.card,     4.5],
  ['muted text on card',       T.slate600, T.card,     4.5],
  ['muted text on tint',       T.slate600, T.slate100, 4.5],
  ['heading on page',          T.navy900,  T.bg,       4.5],
  ['eyebrow amber on page',    T.amber700, T.bg,       4.5],
  ['eyebrow amber on tint',    T.amber700, T.slate100, 4.5],
  ['primary btn label',        T.ink,      T.amber500, 4.5],
  ['primary btn hover label',  T.ink,      T.amber400, 4.5],
  ['white on navy hero',       T.white,    T.navy900,  4.5],
  ['white on navy band',       T.white,    T.navy800,  4.5],
  ['amber accent on navy',     T.amber500, T.navy900,  4.5],
]
let bad = 0
for (const [name, fg, bgc, min] of pairs) {
  const r = ratio(fg, bgc)
  const ok = r >= min
  if (!ok) bad++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1  (min ${min})  ${name}`)
}
console.log(bad ? `\n${bad} contrast failure(s)` : '\nall contrast pairs pass WCAG AA')
process.exitCode = bad ? 1 : 0
