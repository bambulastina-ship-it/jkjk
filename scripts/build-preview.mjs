/**
 * ============================================================================
 * Single-file preview builder
 * ----------------------------------------------------------------------------
 * Takes the Next.js static export in `out/` and folds it into ONE self-contained
 * HTML file with no external requests at all: stylesheets, scripts, webfonts and
 * images are all inlined (fonts and images as data: URIs).
 *
 * This exists so the site can be shared as a single link for review, without
 * standing up a host. It is a preview artefact, not the deployment target —
 * the real site should be deployed from the Next.js app itself.
 *
 * Run: STATIC_EXPORT=1 npx next build && node scripts/build-preview.mjs
 * ==========================================================================*/

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const DEST = process.argv[2] ?? 'preview/daisy-nails-preview.html';

const MIME = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

/** Read a file referenced by a root-relative URL from the export directory. */
async function readAsset(url) {
  const clean = url.split('?')[0].split('#')[0];
  const file = path.join(OUT, clean.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  return readFile(file);
}

async function dataUri(url) {
  const buf = await readAsset(url);
  if (!buf) return null;
  const ext = path.extname(url.split('?')[0]).toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

let html = await readFile(path.join(OUT, 'index.html'), 'utf8');
const report = { css: 0, js: 0, fonts: 0, images: 0 };

/* --- 1. Inline every asset, by global path substitution ------------------ */
// Rather than matching each syntax that can carry a URL (src, srcset, CSS
// url(), and the escaped strings inside the React streaming payload), collect
// every asset in the export and replace its root-relative path wherever it
// appears. These paths contain no characters that JSON- or CSS-escape, so the
// literal string is identical in every context.
//
// This runs BEFORE the stylesheet and script bodies are inlined, deliberately:
// substituting into a minified bundle after the fact is how you end up with a
// megabyte of base64 spliced through someone's webpack runtime.
async function collect(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(full, acc);
    else acc.push(full);
  }
  return acc;
}

const assets = (await collect(OUT))
  .filter((f) => MIME[path.extname(f).toLowerCase()])
  .map((f) => '/' + path.relative(OUT, f).split(path.sep).join('/'))
  // Longest first, so a shorter path can never clobber a longer one that
  // contains it as a prefix.
  .sort((a, b) => b.length - a.length);

for (const url of assets) {
  if (!html.includes(url)) continue;
  const d = await dataUri(url);
  if (!d) continue;
  // Only substitute where the path STARTS a URL. Without this guard the
  // absolute OG URL (…daisynailscoloradosprings.com/img/og.jpg) would match on
  // its tail and get a data URI glued onto the domain.
  const re = new RegExp(`(^|[^A-Za-z0-9._/-])${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
  html = html.replace(re, (_m, lead) => lead + d);
  if (url.startsWith('/img/')) report.images++;
  else report.fonts++;
}

/* --- 2. Inline stylesheets ----------------------------------------------- */
const linkRe = /<link[^>]+rel="stylesheet"[^>]*>/g;
for (const tag of html.match(linkRe) ?? []) {
  const href = /href="([^"]+)"/.exec(tag)?.[1];
  if (!href || !href.startsWith('/')) continue;
  let css = (await readAsset(href))?.toString('utf8');
  if (!css) continue;

  // Step 1 works on the HTML; the stylesheet is still a separate file at that
  // point, so its own url() references are resolved here.
  const urls = [...css.matchAll(/url\((\/_next\/[^)"']+)\)/g)].map((m) => m[1]);
  for (const u of new Set(urls)) {
    const d = await dataUri(u);
    if (!d) continue;
    css = css.split(`url(${u})`).join(`url(${d})`);
    report.fonts++;
  }
  // NOTE: the replacement MUST go through a function. A string replacement
  // would interpret `$&`, `$'` and friends inside the asset body as replacement
  // patterns — minified bundles are full of `$`, and the result is silently
  // corrupted output.
  const styleTag = `<style>${css}</style>`;
  html = html.replace(tag, () => styleTag);
  report.css++;
}

/* --- 3. Inline scripts, preserving document order ------------------------ */
// Order matters: the webpack runtime and its chunks must execute in the same
// sequence the export emitted them in.
const scriptRe = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
const scriptTags = [...html.matchAll(scriptRe)];
for (const [tag, src] of scriptTags) {
  if (!src.startsWith('/')) continue;
  const js = (await readAsset(src))?.toString('utf8');
  if (!js) continue;
  // The script bodies are emitted verbatim; guard the one sequence that would
  // otherwise terminate the enclosing <script> element early.
  const body = js
    // Would otherwise close the enclosing <script> element early.
    .split('</script').join('<\\/script')
    // A literal U+FFFD survives fine in a file but is rejected by some HTML
    // pipelines. Inside JS the escape is exactly equivalent, and minified
    // bundles have no comments, so every occurrence is in a string or regex.
    .replace(/\uFFFD/g, '\\uFFFD');
  const inlined = `<script>${body}</script>`;
  html = html.replace(tag, () => inlined); // function replacer — see note above
  report.js++;
}

/* --- 4. Preview-only substitutions ---------------------------------------- */
// (a) The React payload still names the stylesheet by path. The CSS is already
// inlined above, so point that reference at an empty data URI: same effect,
// minus a 404 in the console.
html = html.replace(/\/_next\/static\/css\/[A-Za-z0-9]+\.css/g, 'data:text/css,');

// (b) The Google Maps embed is a cross-origin frame. It works on a real host,
// but a shared single-file preview is usually viewed under a strict frame
// policy, where it renders as an empty grey box that reads as "broken site"
// rather than "blocked frame". Swap in a labelled panel.
//
// This runs AFTER hydration, appended at the end of the body. Editing the
// server HTML instead would change markup React expects to find and trip a
// hydration mismatch (React error #418), after which React simply restores the
// original iframe. Mutating a static subtree post-hydration is safe: React
// never re-renders it. PREVIEW ONLY — the app still ships the real iframe.
const mapFallback = `<script>
addEventListener('load', function () {
  setTimeout(function () {
    document.querySelectorAll('iframe[src*="google.com/maps"]').forEach(function (f) {
      var d = document.createElement('div');
      d.setAttribute('style', 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:380px;height:100%;width:100%;background:#f5f1e8;color:#6e6659;font-size:14px;line-height:1.55;text-align:center;padding:24px');
      d.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c08a2e" stroke-width="1.5" aria-hidden="true"><path d="M20 10.4c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.2" r="2.8"/></svg>'
        + '<strong style="color:#17150f;font-size:15px">409 Windchime Pl, Colorado Springs, CO 80919</strong>'
        + '<span>The interactive map loads on the deployed site.<br>Shared previews block embedded frames.</span>';
      f.replaceWith(d);
    });
  }, 300);
});
<\/script>`;
html = html.replace('</body>', () => mapFallback + '</body>');

/* --- 5. Strip anything that would still hit the network ------------------ */
// Preload/prefetch hints point at files that no longer exist as separate
// resources, and would just log failed requests in the console.
html = html.replace(/<link[^>]+rel="(?:preload|prefetch|modulepreload)"[^>]*>/g, '');

const bytes = Buffer.byteLength(html, 'utf8');
await writeFile(DEST, html);
console.log(
  `${DEST}\n  css:${report.css} js:${report.js} fonts:${report.fonts} images:${report.images}` +
    `\n  ${(bytes / 1024 / 1024).toFixed(2)} MB`,
);
// Any surviving root-relative asset path means something will 404 at runtime.
const leftovers = [...new Set(
  [...html.matchAll(/["'(\\]{1,2}(\/(?:_next|img)\/[^"')\\\s]+)/g)].map((m) => m[1]),
)];
console.log(
  leftovers.length
    ? `  WARNING unresolved (${leftovers.length}): ${leftovers.slice(0, 5).join(', ')}`
    : '  no unresolved local refs',
);
