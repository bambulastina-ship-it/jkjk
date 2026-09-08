/* Katerina Telesh — premium interaction layer.
   Effects ported by hand from the reference projects, no frameworks:
     - ShaderGradient (ruucm/shadergradient)      -> custom GLSL flow-noise gradient, raw WebGL
     - Liquid Glass JS (dashersw/liquid-glass-js) -> SVG feTurbulence + feDisplacementMap refraction
     - Liquid Logo (paper-design/liquid-logo)     -> animated specular sweep + displacement on the wordmark
     - React Three Fiber (pmndrs/react-three-fiber)-> 3D perspective tilt/parallax without React or three.js
   ~7KB. No three.js, no build step. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse  = matchMedia('(pointer: coarse)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- nav scroll state + scroll progress ---------- */
  var nav = document.querySelector('.nav');
  var prog = document.querySelector('.progress span');
  var tick = false;
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle('scrolled', scrollY > 24);
      if (prog) {
        var max = document.body.scrollHeight - innerHeight;
        prog.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      }
      tick = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- entrance reveals ---------- */
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sibs = [].slice.call(el.parentNode.children).filter(function (n) {
          return n.classList && n.classList.contains('reveal');
        });
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 95 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ---------- 3D tilt / parallax (R3F feel, no three.js) ---------- */
  if (!reduced && !coarse) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var max = parseFloat(card.dataset.tilt) || 6, raf = 0;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(1100px) rotateX(' + (-py * max) + 'deg) rotateY(' + (px * max) +
            'deg) translateZ(6px)';
          card.style.setProperty('--gx', (px * 100 + 50) + '%');
          card.style.setProperty('--gy', (py * 100 + 50) + '%');
          raf = 0;
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
        card.style.setProperty('--gx', '50%');
        card.style.setProperty('--gy', '50%');
      });
    });
  }

  /* ---------- ShaderGradient-style flowing gradient (raw WebGL) ---------- */
  var cv = document.getElementById('grad');
  if (!cv) return;

  if (reduced || coarse) { cv.classList.add('fallback'); return; }
  var gl = cv.getContext('webgl', { alpha: true, antialias: false, depth: false });
  if (!gl) { cv.classList.add('fallback'); return; }

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 r;uniform float t;',
    // value noise + fbm
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p*=2.02;a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r.xy;',
    ' vec2 q=vec2(uv.x*r.x/r.y,uv.y);',
    // domain-warped flow
    ' float w1=fbm(q*1.6+vec2(t*.035,t*.021));',
    ' float w2=fbm(q*2.2+vec2(w1*1.4-t*.017,w1*1.1+t*.013));',
    ' float f=fbm(q*1.1+vec2(w2*.9,w2*.7-t*.009));',
    ' vec3 ink=vec3(.039,.039,.047);',
    ' vec3 char=vec3(.115,.108,.104);',
    ' vec3 gold=vec3(.847,.694,.353);',
    ' vec3 c=mix(ink,char,smoothstep(.25,.85,f));',
    // gold only in the brightest ridges, kept low so it reads as light not paint
    ' float g=smoothstep(.55,.92,w2)*smoothstep(1.0,.42,uv.y);',
    ' c=mix(c,gold,g*.30);',
    // warm pool bottom-left, cool falloff top-right
    ' c+=gold*.075*smoothstep(1.15,.0,length(uv-vec2(.14,.10)));',
    ' c*=1.-.35*smoothstep(.35,1.15,length(uv-vec2(.5,.42)));',
    ' gl_FragColor=vec4(c,1.);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { cv.classList.add('fallback'); return; }
  var pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.classList.add('fallback'); return; }
  gl.useProgram(pr);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');

  function size() {
    var dpr = Math.min(devicePixelRatio || 1, 1.5); // capped: this is a full-bleed pass
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) {
      cv.width = w; cv.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uR, cv.width, cv.height);
  }
  addEventListener('resize', size, { passive: true });
  size();

  var live = true, raf = 0, t0 = performance.now();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      live = es[0].isIntersecting;
      if (live && !raf) raf = requestAnimationFrame(draw);
    }, { threshold: 0 }).observe(cv);
  }
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
