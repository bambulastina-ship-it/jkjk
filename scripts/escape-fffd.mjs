/**
 * The artifact host rejects raw U+FFFD bytes. ShaderGradient's bundled
 * URI-decoding helper contains five of them as intentional literals inside
 * template strings. Replacing each with its � escape is byte-for-byte
 * equivalent at runtime and leaves the file pure ASCII.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'dist/assets'
let total = 0
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js') && !f.endsWith('.css')) continue
  const p = join(dir, f)
  const src = readFileSync(p, 'utf8')
  const n = (src.match(/�/g) || []).length
  if (!n) continue
  writeFileSync(p, src.replaceAll('�', '\\uFFFD'), 'utf8')
  console.log(`${f}: escaped ${n}`)
  total += n
}
console.log(`total ${total}`)
