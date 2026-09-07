/* =============================================================
   Lara Issa — app.js
   Vanilla, no build step, no dependencies, no network calls.

   Reference-library evaluation (requested):
   - React Three Fiber  — REJECTED. React + three.js is ~150kB+ gzipped of
     runtime for a static one-page site. It would dominate LCP on the mobile
     connections most of this traffic arrives on, and buys nothing the layout
     needs. Also forces a build step, which the brief rules out.
   - ShaderGradient      — REJECTED. It is an R3F/three wrapper, so it carries
     the same cost, and its look (saturated animated colour fields) fights the
     warm editorial neutrals the palette is built on. The one atmospheric
     moment on the page is handled by a darkened photograph plus an SVG grain
     layer — cheaper and more on-brand than a shader.
   - Liquid Logo         — REJECTED. A distorted/metallic wordmark is exactly
     the "AI luxury template" register the art direction avoids. The wordmark
     is set in the display serif instead.
   - Liquid Glass JS     — REJECTED. Glassmorphism clutter is explicitly banned
     in the brief; the only translucency used is a plain backdrop blur on the
     sticky nav so type stays legible over scrolling content.

   Net: everything below is hand-written, ~4kB unminified, and degrades to a
   fully readable page with JavaScript disabled.
   ============================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- current year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobilemenu');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 940) setMenu(false);
    });
  }

  /* ---------- scroll reveals ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (!('IntersectionObserver' in window) || reduced.matches) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // stagger siblings that share a parent
    var seen = new Map();
    items.forEach(function (el) {
      var p = el.parentElement;
      var n = seen.get(p) || 0;
      seen.set(p, n + 1);
      el.style.setProperty('--d', Math.min(n, 5) * 90 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- WhatsApp message drafter ----------
     Composes text locally and hands it to the clipboard, then opens the
     WhatsApp link. There is no endpoint, no storage and nothing is sent. */
  var WA = 'https://wa.link/08nnkz';
  var form = document.getElementById('draft');

  if (form) {
    var nameEl = document.getElementById('f-name');
    var intentEl = document.getElementById('f-intent');
    var areaEl = document.getElementById('f-area');
    var notesEl = document.getElementById('f-notes');
    var preview = document.getElementById('f-preview');
    var status = document.getElementById('f-status');

    function compose() {
      var name = (nameEl.value || '').trim();
      var area = (areaEl.value || '').trim();
      var notes = (notesEl.value || '').trim();
      var out = 'Hi Lara — ';
      out += name ? 'this is ' + name + '. ' : '';
      out += 'I would like to ' + intentEl.value.toLowerCase() + '.';
      if (area) out += ' Area or building: ' + area + '.';
      if (notes) out += ' ' + notes;
      out += ' Could we book the free consultation?';
      return out;
    }

    function refresh() {
      preview.textContent = compose();
    }

    ['input', 'change'].forEach(function (evt) {
      form.addEventListener(evt, refresh);
    });
    refresh();

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // never posts anywhere
      var text = compose();
      window.open(WA, '_blank', 'noopener');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          status.textContent = 'Copied — paste it into the chat.';
        }).catch(function () {
          status.textContent = 'WhatsApp opened. Copy your message from the preview above.';
        });
      } else {
        status.textContent = 'WhatsApp opened. Copy your message from the preview above.';
      }
    });
  }
})();
