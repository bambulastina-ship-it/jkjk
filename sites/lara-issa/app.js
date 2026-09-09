/* Lara Issa — interaction layer.
   Effects hand-ported from the reference projects; no frameworks, no build step.
     ShaderGradient (ruucm/shadergradient)        -> domain-warped fbm gradient in raw WebGL
     Liquid Glass JS (dashersw/liquid-glass-js)   -> feTurbulence + feDisplacementMap refraction
     Liquid Logo (paper-design/liquid-logo)       -> specular sweep + displacement on the wordmark
     React Three Fiber (pmndrs/react-three-fiber) -> 3D perspective tilt + scroll parallax, no React/three
*/
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── nav state ─────────────────────────────────────── */
  var nav = document.querySelector('.nav'), t1 = false;
  addEventListener('scroll', function () {
    if (t1) return; t1 = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle('set', scrollY > 40);
      t1 = false;
    });
  }, { passive: true });

  /* ── chapter rail ──────────────────────────────────── */
  var links = [].slice.call(document.querySelectorAll('.rail a'));
  var chapters = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window && chapters[0]) {
    var railIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = chapters.indexOf(e.target);
        links.forEach(function (a, j) { a.classList.toggle('on', j === i); });
      });
    }, { threshold: 0.4 });
    chapters.forEach(function (c) { if (c) railIo.observe(c); });
  }

  /* ── reveals ───────────────────────────────────────── */
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sibs = [].slice.call(el.parentNode.children).filter(function (n) {
          return n.classList && n.classList.contains('reveal');
        });
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 4) * 110 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ── cinematic parallax ────────────────────────────── */
  if (!reduce) {
    var pars = [].slice.call(document.querySelectorAll('[data-par]'));
    if (pars.length) {
      var t2 = false;
      var move = function () {
        if (t2) return; t2 = true;
        requestAnimationFrame(function () {
          pars.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.bottom < -100 || r.top > innerHeight + 100) return;
            var img = el.querySelector('img'); if (!img) return;
            var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
            img.style.transform = 'translate3d(0,' + (p * (parseFloat(el.dataset.par) || .1) * -100).toFixed(2) + 'px,0)';
          });
          t2 = false;
        });
      };
      addEventListener('scroll', move, { passive: true });
      addEventListener('resize', move, { passive: true });
      move();
    }
  }

  /* ── 3D tilt ───────────────────────────────────────── */
  if (!reduce && !coarse) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 4, raf = 0;
      el.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - .5;
          var py = (e.clientY - r.top) / r.height - .5;
          el.style.transform = 'perspective(1200px) rotateX(' + (-py * max) +
            'deg) rotateY(' + (px * max) + 'deg)';
          el.style.setProperty('--gx', (px * 100 + 50) + '%');
          el.style.setProperty('--gy', (py * 100 + 50) + '%');
          raf = 0;
        });
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
        el.style.setProperty('--gx', '50%'); el.style.setProperty('--gy', '50%');
      });
    });
  }

  /* ── ShaderGradient ────────────────────────────────── */
  var cv = document.getElementById('grad');
  if (!cv) return;
  if (reduce || coarse) { cv.classList.add('fb'); return; }
  var gl = cv.getContext('webgl', { alpha: true, antialias: false, depth: false });
  if (!gl) { cv.classList.add('fb'); return; }

  var FS = [
    'precision highp float;uniform vec2 r;uniform float t;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p*=2.03;a*=.5;}return v;}',
    'void main(){vec2 uv=gl_FragCoord.xy/r.xy;vec2 q=vec2(uv.x*r.x/r.y,uv.y);',
    ' float w1=fbm(q*1.25+vec2(t*.024,-t*.016));',
    ' float w2=fbm(q*2.1+vec2(w1*1.5-t*.015,w1*1.2+t*.011));',
    ' float f=fbm(q*1.05+vec2(w2*.95,w2*.72-t*.008));',
    ' vec3 base=vec3(.024,.024,.028);',
    ' vec3 coal=vec3(.105,.098,.094);',
    ' vec3 champ=vec3(.898,.757,.345);',
    ' vec3 c=mix(base,coal,smoothstep(.22,.86,f));',
    ' float g=smoothstep(.50,.90,w2)*smoothstep(.10,.92,uv.y);',
    ' c=mix(c,champ,g*.26);',
    ' c+=champ*.07*smoothstep(1.10,.0,length(uv-vec2(.84,.16)));',
    ' c*=1.-.34*smoothstep(.36,1.16,length(uv-vec2(.5,.44)));',
    ' gl_FragColor=vec4(c,1.);}'
  ].join('\n');

  function sh(ty, src) { var s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
  var vs = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  var fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { cv.classList.add('fb'); return; }
  var pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.classList.add('fb'); return; }
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');

  function size() {
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uR, cv.width, cv.height);
  }
  addEventListener('resize', size, { passive: true });
  size();

  var live = true, raf = 0, t0 = performance.now();
  new IntersectionObserver(function (es) {
    live = es[0].isIntersecting;
    if (live && !raf) raf = requestAnimationFrame(draw);
  }, { threshold: 0 }).observe(cv);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && live && !raf) raf = requestAnimationFrame(draw);
  });
  function draw(now) {
    raf = 0;
    if (!live || document.hidden) return;
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(draw);
  }
  cv.classList.add('on');
  raf = requestAnimationFrame(draw);
})();
