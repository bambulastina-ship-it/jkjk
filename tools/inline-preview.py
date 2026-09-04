import base64, pathlib, re, sys

site = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2]); title = sys.argv[3]
d = site / 'dist-single'
html = (d / 'index.html').read_text()

# --- CSS (+ fonts as data URIs) ---
css = ''
for m in re.finditer(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>', html):
    css += (d / m.group(1).lstrip('./')).read_text() + '\n'

def font_data_uri(m):
    raw = m.group(1)
    p = d / raw.lstrip('./').lstrip('/')
    if not p.exists():
        return m.group(0)
    b64 = base64.b64encode(p.read_bytes()).decode()
    return f"url(data:font/woff2;base64,{b64})"
css = re.sub(r'url\(["\']?([^"\')]+\.woff2)["\']?\)', font_data_uri, css)

# --- vendor liquid-glass (classic scripts, pre-marked so the loader skips fetching) ---
vend = site / 'public' / 'vendor' / 'liquid-glass-js'
glass_css = (vend / 'glass.css').read_text() if (vend / 'glass.css').exists() else ''
order = ['container.js', 'button.js', 'bridge.js', 'expose.js']
vendor_tags = []
for name in order:
    f = vend / name
    if not f.exists():
        continue
    body = f.read_text().replace('</script', r'<\/script')
    src = f'./vendor/liquid-glass-js/{name}'
    vendor_tags.append(f'<script data-lg="{src}" data-loaded="true">\n{body}\n</script>')
if glass_css:
    vendor_tags.insert(0, f'<link rel="stylesheet" data-lg="./vendor/liquid-glass-js/glass.css">')

# --- app bundle ---
js = ''
for m in re.finditer(r'<script[^>]+type="module"[^>]+src="([^"]+)"[^>]*>\s*</script>', html):
    js += (d / m.group(1).lstrip('./')).read_text() + '\n'
js = js.replace('</script', '<\\/script').replace('\ufffd', '\\uFFFD')

# --- body markup ---
bm = re.search(r'<body[^>]*>(.*?)</body>', html, re.S)
body_html = bm.group(1) if bm else '<div id="root"></div>'
body_html = re.sub(r'<script[^>]*src="[^"]*"[^>]*>\s*</script>', '', body_html)
body_html = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', '', body_html)

parts = [
    f'<title>{title}</title>',
    f'<style>\n{glass_css}\n</style>',
    f'<style>\n{css}\n</style>',
    body_html.strip(),
    *vendor_tags,
    f'<script type="module">\n{js}\n</script>',
]
out.write_text('\n'.join(parts))
print(f'{out.name}: {out.stat().st_size/1_048_576:.2f} MB')