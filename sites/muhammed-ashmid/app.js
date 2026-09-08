/* ============================================================================
   Muhammed Ashmid — app.js
   No framework, no build step, no backend. Vanilla + three.js r155 (vendored).

   ---------------------------------------------------------------------------
   PORTED EFFECTS — what came from where
   ---------------------------------------------------------------------------
   1. ShaderGradient  — https://github.com/ruucm/shadergradient
      Ported: the *look* — an organic, endlessly flowing colour field built from
      domain-warped fractal noise, not a CSS gradient. ShaderGradient ships as a
      React/R3F component; React is not used here, so the effect was rewritten
      as a hand-written GLSL fragment shader (simplex noise -> fbm -> two-stage
      domain warp -> palette ramp -> vignette + grain) drawn on a full-screen
      triangle by plain three.js. See BG_FRAG below.

   2. Liquid Logo — https://github.com/paper-design/liquid-logo
      Ported: the idea of a mark that behaves like liquid metal rather than flat
      artwork. Reimplemented with an SVG feTurbulence + feDisplacementMap pair
      (#liquid-mark in index.html) whose displacement scale and noise frequency
      are driven per-frame by hover state AND scroll velocity, over a bronze
      gradient fill with an animated specular sweep. See initLiquidMark().

   3. Liquid Glass JS — https://github.com/rdev/liquid-glass
      Ported: the real trick of that library — instead of only blurring, it
      generates a per-element *displacement map* from the signed distance field
      of the element's rounded rectangle, then feeds it to feImage +
      feDisplacementMap so the backdrop is optically bent at the edges like a
      thick glass lens. That map generator is reimplemented here in canvas 2D
      (sdRoundRect + analytic gradient) and wired into backdrop-filter. Glossy
      light borders and the specular sweep are CSS. See initLiquidGlass().

   4. React Three Fiber / drei MeshDistortMaterial
      — https://github.com/pmndrs/react-three-fiber
      — https://github.com/pmndrs/drei
      Ported: drei's MeshDistortMaterial concept — a mesh whose vertices are
      pushed along their normals by animated 3D simplex noise — plus R3F's
      pointer-reactive scene. Rewritten as a plain three.js ShaderMaterial with
      a hand-written vertex displacement + fresnel fragment, on a wireframe
      icosahedron and a drifting point field. See initHeroGL().

   PERFORMANCE FLOOR
   - devicePixelRatio capped at 2.
   - The WebGL loop is created only on fine pointers at >=981px; everything
     else gets the CSS-only gradient (.hero__fallback) and no GPU loop at all.
   - IntersectionObserver + visibilitychange stop the loop when it is off-screen
     or the tab is hidden. One rAF, cancelled on pause.
   - prefers-reduced-motion: a single static frame is drawn, then the loop stops.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var wide = function () { return window.innerWidth >= 981; };
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* ==========================================================================
     0. Small stuff
     ========================================================================== */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ==========================================================================
     1. NAV — stuck state, mobile sheet
     ========================================================================== */
  (function initNav() {
    var nav = $('#nav');
    var burger = $('#burger');
    var sheet = $('#sheet');
    if (!nav) return;

    var stuck = false;
    var onScroll = function () {
      var s = window.scrollY > 18;
      if (s !== stuck) { stuck = s; nav.classList.toggle('is-stuck', s); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!burger || !sheet) return;
    var close = function () {
      burger.setAttribute('aria-expanded', 'false');
      sheet.hidden = true;
    };
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      sheet.hidden = open;
    });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', close); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080) close(); });
  }());

  /* ==========================================================================
     2. SCROLL REVEAL — weighted easing, staggered by data-delay
     ========================================================================== */
  (function initReveal() {
    var items = $$('[data-reveal]');
    items.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-delay') || '0');
      el.style.setProperty('--d', String(d));
    });
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }());

  /* ==========================================================================
     3. LIQUID GLASS  (ported from liquid-glass-js)
     --------------------------------------------------------------------------
     For each .glass--refract element we build a displacement map: the signed
     distance field of its rounded rectangle, converted into a normal-ish
     vector field encoded in R (x) and G (y). feDisplacementMap then samples the
     backdrop with that offset, so light appears to bend through the edge of the
     panel instead of stopping at it. The map is regenerated on resize only.
     ========================================================================== */
  var glass = (function initLiquidGlass() {
    var defs = $('#lg-defs');
    var supported = false;
    try {
      supported = !!(window.CSS && CSS.supports &&
        CSS.supports('backdrop-filter', 'url(#x) blur(4px)'));
    } catch (e) { supported = false; }

    if (!defs || !supported) return { refresh: function () {} };
    doc.documentElement.classList.add('lg-on');

    // signed distance to a rounded rectangle centred on the origin
    function sdRound(px, py, hx, hy, r) {
      var qx = Math.abs(px) - hx + r;
      var qy = Math.abs(py) - hy + r;
      var mx = Math.max(qx, 0), my = Math.max(qy, 0);
      return Math.sqrt(mx * mx + my * my) + Math.min(Math.max(qx, qy), 0) - r;
    }

    function buildMap(w, h, radius, band, strength) {
      // low-res is plenty: the field is smooth and feImage stretches it
      var scale = Math.min(1, 220 / Math.max(w, h));
      var mw = Math.max(8, Math.round(w * scale));
      var mh = Math.max(8, Math.round(h * scale));
      var c = doc.createElement('canvas');
      c.width = mw; c.height = mh;
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(mw, mh);
      var d = img.data;
      var hx = mw / 2, hy = mh / 2;
      var r = Math.max(1, radius * scale);
      var b = Math.max(2, band * scale);
      var eps = 0.75;

      for (var y = 0; y < mh; y++) {
        for (var x = 0; x < mw; x++) {
          var px = x + 0.5 - hx, py = y + 0.5 - hy;
          var s = sdRound(px, py, hx, hy, r);
          // finite-difference gradient => outward normal of the edge
          var gx = sdRound(px + eps, py, hx, hy, r) - sdRound(px - eps, py, hx, hy, r);
          var gy = sdRound(px, py + eps, hx, hy, r) - sdRound(px, py - eps, hx, hy, r);
          var gl = Math.hypot(gx, gy) || 1;
          gx /= gl; gy /= gl;

          // t rises from 0 in the middle to 1 right at the border
          var t = 1 - Math.min(1, Math.max(0, (-s) / b));
          t = t * t * (3 - 2 * t);          // smoothstep
          if (s > 0) t = 0;                  // outside the shape: no push

          var ox = Math.max(-1, Math.min(1, gx * t * strength));
          var oy = Math.max(-1, Math.min(1, gy * t * strength));
          var i = (y * mw + x) * 4;
          d[i] = Math.round(128 + ox * 127);
          d[i + 1] = Math.round(128 + oy * 127);
          d[i + 2] = 128;
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      return c.toDataURL();
    }

    var NS = 'http://www.w3.org/2000/svg';
    var XNS = 'http://www.w3.org/1999/xlink';
    var registry = [];
    var uid = 0;

    var PRESETS = {
      nav:      { radius: 999, band: 22, strength: 1.0, scale: 26, blur: 9 },
      card:     { radius: 20,  band: 26, strength: 1.0, scale: 30, blur: 11 },
      portrait: { radius: 26,  band: 34, strength: 1.0, scale: 38, blur: 10 },
      shot:     { radius: 24,  band: 32, strength: 1.0, scale: 34, blur: 10 }
    };

    function attach(el) {
      var kind = el.getAttribute('data-glass') || 'card';
      var p = PRESETS[kind] || PRESETS.card;
      var id = 'lg-f-' + (uid++);

      var f = doc.createElementNS(NS, 'filter');
      f.setAttribute('id', id);
      f.setAttribute('filterUnits', 'userSpaceOnUse');
      f.setAttribute('color-interpolation-filters', 'sRGB');

      var im = doc.createElementNS(NS, 'feImage');
      im.setAttribute('result', 'map');
      im.setAttribute('preserveAspectRatio', 'none');

      var dm = doc.createElementNS(NS, 'feDisplacementMap');
      dm.setAttribute('in', 'SourceGraphic');
      dm.setAttribute('in2', 'map');
      dm.setAttribute('xChannelSelector', 'R');
      dm.setAttribute('yChannelSelector', 'G');
      dm.setAttribute('scale', String(p.scale));

      f.appendChild(im); f.appendChild(dm);
      defs.appendChild(f);

      var rec = { el: el, p: p, filter: f, feImage: im, w: 0, h: 0 };
      registry.push(rec);
      el.style.backdropFilter = 'blur(' + p.blur + 'px) saturate(160%) url(#' + id + ')';
      el.style.webkitBackdropFilter = 'blur(' + p.blur + 'px) saturate(160%)';
      return rec;
    }

    function sync(rec) {
      var r = rec.el.getBoundingClientRect();
      var w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return;
      if (w === rec.w && h === rec.h) return;
      rec.w = w; rec.h = h;
      rec.filter.setAttribute('x', '0');
      rec.filter.setAttribute('y', '0');
      rec.filter.setAttribute('width', String(w));
      rec.filter.setAttribute('height', String(h));
      rec.feImage.setAttribute('x', '0');
      rec.feImage.setAttribute('y', '0');
      rec.feImage.setAttribute('width', String(w));
      rec.feImage.setAttribute('height', String(h));
      var url = buildMap(w, h, rec.p.radius, rec.p.band, rec.p.strength);
      rec.feImage.setAttribute('href', url);
      rec.feImage.setAttributeNS(XNS, 'xlink:href', url);
    }

    $$('.glass--refract').forEach(attach);
    var refresh = function () { registry.forEach(sync); };
    refresh();

    var t = 0;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(refresh, 180);
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh).catch(function () {});
    return { refresh: refresh };
  }());

  /* ==========================================================================
     4. LIQUID LOGO  (ported from paper-design/liquid-logo)
     --------------------------------------------------------------------------
     The mark is real SVG text filled with an animated bronze gradient. The
     liquid comes from feTurbulence -> feDisplacementMap: displacement scale and
     turbulence frequency are driven by (a) hover and (b) scroll velocity, both
     smoothed with a spring-ish lerp so the metal settles instead of snapping.
     ========================================================================== */
  (function initLiquidMark() {
    var turb = $('#liquid-mark-turb');
    var disp = $('#liquid-mark-disp');
    var mark = $('.mark');
    if (!turb || !disp || !mark) return;
    if (reduced) { disp.setAttribute('scale', '0'); return; }

    var hover = 0, hoverT = 0;   // 0..1
    var vel = 0;                 // smoothed scroll velocity
    var lastY = window.scrollY;
    var phase = 0;
    var running = false;
    var raf = 0;

    mark.addEventListener('pointerenter', function () { hoverT = 1; kick(); });
    mark.addEventListener('pointerleave', function () { hoverT = 0; kick(); });
    mark.addEventListener('focus', function () { hoverT = 1; kick(); }, true);
    mark.addEventListener('blur', function () { hoverT = 0; kick(); }, true);

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var dv = Math.min(1, Math.abs(y - lastY) / 42);
      lastY = y;
      if (dv > vel) vel = dv;
      kick();
    }, { passive: true });

    function kick() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }

    function tick() {
      hover += (hoverT - hover) * 0.14;
      vel *= 0.9;
      phase += 0.016;

      var amt = Math.min(1, hover + vel * 0.85);
      var scale = amt * 11;
      disp.setAttribute('scale', scale.toFixed(2));

      var fx = 0.0055 + 0.004 * Math.sin(phase * 0.9) + amt * 0.006;
      var fy = 0.013 + 0.005 * Math.cos(phase * 0.7) + amt * 0.010;
      turb.setAttribute('baseFrequency', fx.toFixed(5) + ' ' + fy.toFixed(5));

      if (amt < 0.002 && hoverT === 0) {
        disp.setAttribute('scale', '0');
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden && raf) { cancelAnimationFrame(raf); running = false; }
    });
  }());

  /* ==========================================================================
     5. TILT — images lean toward the cursor (fine pointers only)
     ========================================================================== */
  (function initTilt() {
    if (reduced || !fine) return;
    $$('[data-tilt]').forEach(function (host) {
      var frame = $('.portrait__frame', host) || $('.shot__frame', host);
      if (!frame) return;
      var rx = 0, ry = 0, tx = 0, ty = 0, raf = 0, on = false;

      function loop() {
        rx += (tx - rx) * 0.09;
        ry += (ty - ry) * 0.09;
        frame.style.transform =
          'perspective(1200px) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg) translateZ(0)';
        if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01) {
          raf = requestAnimationFrame(loop);
        } else { raf = 0; on = false; }
      }
      function start() { if (!raf) { on = true; raf = requestAnimationFrame(loop); } }

      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        ty = nx * 7.5;
        tx = -ny * 6;
        start();
      });
      host.addEventListener('pointerleave', function () { tx = 0; ty = 0; start(); });
      void on;
    });
  }());

  /* ==========================================================================
     6. HERO WEBGL — ShaderGradient field + R3F-style distorted mesh
     ========================================================================== */
  var BG_VERT = [
    'varying vec2 vUv;',
    'void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'
  ].join('\n');

  /* Domain-warped fbm. This is the ShaderGradient look, hand-written. */
  var BG_FRAG = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform float uT;',
    'uniform vec2  uRes;',
    'uniform vec2  uM;',
    'vec2 hash2(vec2 p){',
    '  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));',
    '  return -1.0 + 2.0*fract(sin(p)*43758.5453123);',
    '}',
    'float noise(vec2 p){',
    '  const float K1 = 0.366025404; const float K2 = 0.211324865;',
    '  vec2 i = floor(p + (p.x+p.y)*K1);',
    '  vec2 a = p - i + (i.x+i.y)*K2;',
    '  vec2 o = (a.x > a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);',
    '  vec2 b = a - o + K2;',
    '  vec2 c = a - 1.0 + 2.0*K2;',
    '  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);',
    '  vec3 n = h*h*h*h*vec3(dot(a,hash2(i)), dot(b,hash2(i+o)), dot(c,hash2(i+1.0)));',
    '  return dot(n, vec3(70.0));',
    '}',
    'float fbm(vec2 p){',
    '  float v = 0.0; float a = 0.5;',
    '  for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; }',
    '  return v;',
    '}',
    'void main(){',
    '  vec2 uv = vUv;',
    '  vec2 p = uv; p.x *= uRes.x / max(uRes.y, 1.0);',
    '  float t = uT * 0.045;',
    '  vec2 q = vec2(fbm(p*1.55 + t), fbm(p*1.55 + vec2(5.2,1.3) - t*0.8));',
    '  vec2 r = vec2(fbm(p*1.85 + 3.4*q + vec2(1.7,9.2) + t*1.15),',
    '                fbm(p*1.85 + 3.4*q + vec2(8.3,2.8) - t*0.85));',
    '  float f = fbm(p*1.35 + 3.6*r);',
    '  vec3 c1 = vec3(0.016,0.086,0.063);',   // #041610
    '  vec3 c2 = vec3(0.039,0.200,0.145);',   // #0A3325
    '  vec3 c3 = vec3(0.067,0.290,0.204);',   // #114A34
    '  vec3 c4 = vec3(0.784,0.616,0.400);',   // #C89D66 bronze
    '  vec3 c5 = vec3(0.914,0.808,0.620);',   // #E9CE9E gold
    '  vec3 col = mix(c1, c2, smoothstep(-0.40, 0.62, f));',
    '  col = mix(col, c3, clamp(r.x*0.85 + 0.28, 0.0, 1.0) * 0.55);',
    '  col = mix(col, c4, pow(smoothstep(0.18, 0.92, f + r.y*0.55), 2.3) * 0.62);',
    '  col = mix(col, c5, pow(smoothstep(0.66, 1.10, f + q.y*0.42), 3.0) * 0.42);',
    '  float aspect = uRes.x / max(uRes.y, 1.0);',
    '  float md = length((uv - uM) * vec2(aspect, 1.0));',
    '  col += c4 * (1.0 - smoothstep(0.0, 0.5, md)) * 0.085;',
    '  float vig = 1.0 - 0.62 * pow(length((uv - 0.5) * vec2(1.05, 1.25)), 2.1);',
    '  col *= clamp(vig, 0.0, 1.0);',
    '  col *= mix(0.62, 1.0, smoothstep(0.0, 0.55, uv.y));',   // ground the base
    '  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);',
    '  col += (g - 0.5) * 0.022;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  /* Ashima / Gustavson simplex noise (public domain), used for the
     MeshDistortMaterial-style vertex displacement. */
  var SNOISE = [
    'vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}',
    'vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}',
    'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
    'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}',
    'float snoise(vec3 v){',
    '  const vec2 C = vec2(1.0/6.0, 1.0/3.0);',
    '  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',
    '  vec3 i  = floor(v + dot(v, C.yyy));',
    '  vec3 x0 = v - i + dot(i, C.xxx);',
    '  vec3 g = step(x0.yzx, x0.xyz);',
    '  vec3 l = 1.0 - g;',
    '  vec3 i1 = min(g.xyz, l.zxy);',
    '  vec3 i2 = max(g.xyz, l.zxy);',
    '  vec3 x1 = x0 - i1 + C.xxx;',
    '  vec3 x2 = x0 - i2 + C.yyy;',
    '  vec3 x3 = x0 - D.yyy;',
    '  i = mod289(i);',
    '  vec4 p = permute(permute(permute(',
    '      i.z + vec4(0.0, i1.z, i2.z, 1.0))',
    '    + i.y + vec4(0.0, i1.y, i2.y, 1.0))',
    '    + i.x + vec4(0.0, i1.x, i2.x, 1.0));',
    '  float n_ = 0.142857142857;',
    '  vec3 ns = n_ * D.wyz - D.xzx;',
    '  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);',
    '  vec4 x_ = floor(j * ns.z);',
    '  vec4 y_ = floor(j - 7.0 * x_);',
    '  vec4 x = x_ *ns.x + ns.yyyy;',
    '  vec4 y = y_ *ns.x + ns.yyyy;',
    '  vec4 h = 1.0 - abs(x) - abs(y);',
    '  vec4 b0 = vec4(x.xy, y.xy);',
    '  vec4 b1 = vec4(x.zw, y.zw);',
    '  vec4 s0 = floor(b0)*2.0 + 1.0;',
    '  vec4 s1 = floor(b1)*2.0 + 1.0;',
    '  vec4 sh = -step(h, vec4(0.0));',
    '  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;',
    '  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;',
    '  vec3 p0 = vec3(a0.xy, h.x);',
    '  vec3 p1 = vec3(a0.zw, h.y);',
    '  vec3 p2 = vec3(a1.xy, h.z);',
    '  vec3 p3 = vec3(a1.zw, h.w);',
    '  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));',
    '  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;',
    '  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
    '  m = m * m;',
    '  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));',
    '}'
  ].join('\n');

  var MESH_VERT = SNOISE + [
    '',
    'uniform float uT;',
    'uniform float uDistort;',
    'varying float vD;',
    'varying vec3  vN;',
    'varying vec3  vP;',
    'void main(){',
    '  float n1 = snoise(position * 1.15 + vec3(0.0, 0.0, uT * 0.14));',
    '  float n2 = snoise(position * 2.70 - vec3(uT * 0.09));',
    '  float d  = n1 * 0.30 + n2 * 0.11;',
    '  vD = d;',
    '  vec3 pos = position + normal * d * uDistort;',
    '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
    '  vP = mv.xyz;',
    '  vN = normalize(normalMatrix * normal);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var MESH_FRAG = [
    'precision highp float;',
    'uniform vec3 uA;',
    'uniform vec3 uB;',
    'uniform float uAlpha;',
    'varying float vD;',
    'varying vec3  vN;',
    'varying vec3  vP;',
    'void main(){',
    '  vec3 V = normalize(-vP);',
    '  float fres = pow(1.0 - abs(dot(normalize(vN), V)), 2.0);',
    '  vec3 c = mix(uA, uB, clamp(vD * 1.9 + 0.5, 0.0, 1.0));',
    '  float a = (0.14 + fres * 0.72) * uAlpha;',
    '  gl_FragColor = vec4(c * a, a);',
    '}'
  ].join('\n');

  var PT_VERT = [
    'uniform float uT;',
    'attribute float aSeed;',
    'varying float vA;',
    'void main(){',
    '  vec3 p = position;',
    '  p.y += sin(uT * 0.25 + aSeed * 6.28318) * 0.28;',
    '  p.x += cos(uT * 0.19 + aSeed * 4.71) * 0.22;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  vA = 0.25 + 0.75 * fract(aSeed * 7.13);',
    '  gl_PointSize = (1.0 + 2.2 * fract(aSeed * 3.7)) * (170.0 / max(-mv.z, 0.001));',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var PT_FRAG = [
    'precision mediump float;',
    'uniform vec3 uC;',
    'varying float vA;',
    'void main(){',
    '  vec2 d = gl_PointCoord - 0.5;',
    '  float m = 1.0 - smoothstep(0.16, 0.5, length(d));',
    '  float a = m * vA * 0.5;',
    '  gl_FragColor = vec4(uC * a, a);',
    '}'
  ].join('\n');

  (function initHeroGL() {
    var canvas = $('#gl');
    var hero = $('#hero');
    if (!canvas || !hero) return;
    if (!window.THREE) return;
    if (!fine || !wide()) return;                 // phones keep the CSS gradient

    var gl;
    try {
      gl = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: false,
        powerPreference: 'high-performance', stencil: false, depth: true
      });
    } catch (e) { return; }
    if (!gl) return;

    var DPR = Math.min(window.devicePixelRatio || 1, 2);   // hard cap at 2
    gl.setPixelRatio(DPR);
    gl.autoClear = false;
    gl.setClearColor(0x041610, 1);

    /* --- background pass: ShaderGradient port on a full-screen triangle --- */
    var bgScene = new THREE.Scene();
    var bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var bgUniforms = {
      uT: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uM: { value: new THREE.Vector2(0.5, 0.55) }
    };
    var bgGeo = new THREE.PlaneGeometry(2, 2);
    var bgMat = new THREE.ShaderMaterial({
      uniforms: bgUniforms, vertexShader: BG_VERT, fragmentShader: BG_FRAG,
      depthTest: false, depthWrite: false
    });
    bgScene.add(new THREE.Mesh(bgGeo, bgMat));

    /* --- foreground: drei MeshDistortMaterial port + point field --- */
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    cam.position.set(0, 0, 7.2);

    var group = new THREE.Group();
    scene.add(group);

    var meshUniforms = {
      uT: { value: 0 },
      uDistort: { value: 1.0 },
      uA: { value: new THREE.Color(0xC89D66) },
      uB: { value: new THREE.Color(0xE9CE9E) },
      uAlpha: { value: 1.0 }
    };
    var shellGeo = new THREE.IcosahedronGeometry(2.35, 5);
    var shellMat = new THREE.ShaderMaterial({
      uniforms: meshUniforms, vertexShader: MESH_VERT, fragmentShader: MESH_FRAG,
      wireframe: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);

    var innerUniforms = {
      uT: { value: 0 },
      uDistort: { value: 0.72 },
      uA: { value: new THREE.Color(0x114A34) },
      uB: { value: new THREE.Color(0x1E6B4A) },
      uAlpha: { value: 0.85 }
    };
    var innerMat = new THREE.ShaderMaterial({
      uniforms: innerUniforms, vertexShader: MESH_VERT, fragmentShader: MESH_FRAG,
      wireframe: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var inner = new THREE.Mesh(new THREE.IcosahedronGeometry(3.5, 3), innerMat);
    inner.rotation.set(0.6, 0.3, 0);
    group.add(inner);

    // drifting bronze motes
    var N = 700;
    var pos = new Float32Array(N * 3);
    var seed = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var rr = 3.2 + Math.random() * 5.4;
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = rr * Math.cos(ph) * 0.72;
      pos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th) * 0.5 - 1.0;
      seed[i] = Math.random();
    }
    var ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ptGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    var ptUniforms = { uT: { value: 0 }, uC: { value: new THREE.Color(0xE9CE9E) } };
    var points = new THREE.Points(ptGeo, new THREE.ShaderMaterial({
      uniforms: ptUniforms, vertexShader: PT_VERT, fragmentShader: PT_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(points);

    /* --- sizing --- */
    function resize() {
      var w = hero.clientWidth || window.innerWidth;
      var h = hero.clientHeight || window.innerHeight;
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      gl.setSize(w, h, false);
      bgUniforms.uRes.value.set(w, h);
      cam.aspect = w / h;
      // keep the halo bigger than the portrait on wide screens, tighter on小 ones
      var fit = Math.min(1.25, Math.max(0.72, w / 1600));
      group.scale.setScalar(fit);
      points.scale.setScalar(fit);
      cam.updateProjectionMatrix();
    }
    resize();

    /* --- pointer parallax --- */
    var mx = 0.5, my = 0.55, tmx = 0.5, tmy = 0.55;
    window.addEventListener('pointermove', function (e) {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    /* --- loop, with hard pause rules --- */
    var raf = 0, running = false, visible = true, t0 = performance.now(), tt = 0;

    function frame(now) {
      raf = 0;
      tt = (now - t0) / 1000;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      bgUniforms.uT.value = tt;
      bgUniforms.uM.value.set(mx, my);
      meshUniforms.uT.value = tt;
      innerUniforms.uT.value = tt;
      ptUniforms.uT.value = tt;

      group.rotation.y = tt * 0.055 + (mx - 0.5) * 0.5;
      group.rotation.x = Math.sin(tt * 0.07) * 0.16 + (my - 0.55) * -0.36;
      inner.rotation.z = tt * -0.03;
      points.rotation.y = tt * 0.02 + (mx - 0.5) * 0.24;

      gl.clear();
      gl.render(bgScene, bgCam);
      gl.render(scene, cam);

      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !visible) return;
      running = true;
      t0 = performance.now() - tt * 1000;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    canvas.classList.add('is-live');

    if (reduced) {
      // one static frame, then nothing moves again
      frame(performance.now());
      return;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    } else { start(); }
    start();

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stop(); else if (visible) start();
    });

    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (!fine || !wide()) {           // rotated into a narrow layout
          stop(); canvas.classList.remove('is-live'); return;
        }
        resize();
        canvas.classList.add('is-live');
        if (visible && !running) start();
      }, 160);
    });
  }());

  /* ==========================================================================
     7. FORM — posts nowhere. preventDefault, compose a draft the visitor can
        copy into an Instagram DM. No backend, no storage, no payment fields.
     ========================================================================== */
  (function initForm() {
    var form = $('#form');
    var out = $('#form-out');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.elements.name && form.elements.name.value || '').trim();
      var stage = (form.elements.stage && form.elements.stage.value || '').trim();
      var msg = (form.elements.message && form.elements.message.value || '').trim();

      var lines = [];
      lines.push('Hi Muhammed — ' + (name ? name + ' here.' : 'quick question.'));
      if (stage) lines.push('Where I am: ' + stage.toLowerCase() + '.');
      if (msg) lines.push(msg);
      lines.push('Found you through your site.');

      out.hidden = false;
      out.textContent = 'Nothing was sent — this page has no backend. Copy the ' +
        'draft below into a DM to @ashmid.realestate_:\n\n' + lines.join('\n');
      out.setAttribute('tabindex', '-1');
      out.focus({ preventScroll: true });
    });
  }());

  void glass;
}());
