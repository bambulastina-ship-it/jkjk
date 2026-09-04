# Single-file preview builds

Each site is a normal multi-chunk Vite app. To produce ONE self-contained HTML
file (for a shareable preview), each site has a `vite.artifact.config.js` that
disables code splitting and inlines assets:

    cd sites/<site> && npx vite build --config vite.artifact.config.js
    python3 ../../tools/inline-preview.py <site> /path/out.html "<Title>"

`inline-preview.py` inlines the CSS (with woff2 fonts as data URIs), inlines the
app bundle, and pre-injects the vendored liquid-glass scripts carrying the
`data-lg` markers its loader checks, so the glass still initialises without
fetching anything.

These builds are for previewing only. Deploy the normal `npm run build` output —
it code-splits three.js and html2canvas into lazy chunks, which the single-file
build deliberately gives up.
