/* ==========================================================================
   Katerina Telesh — behaviour. Vanilla, no build step, no dependencies.

   LIBRARY EVALUATION (required by brief)
   --------------------------------------
   ShaderGradient      — rejected. It is a React + three.js WebGL wrapper.
                         Animated shader gradients are also exactly the
                         "ambient looping animation" the art direction bans,
                         and they would fight a near-monochrome dossier page.
   Liquid Logo         — rejected. Built for a logo mark rendered on the GPU.
                         This client has a wordmark, not a logo, and the
                         effect reads as tech-startup, not investor advisory.
   Liquid Glass JS     — rejected. Glassmorphism is explicitly banned in the
                         art direction, and refraction over a dark ground
                         destroys the hairline rules the layout depends on.
   React Three Fiber   — rejected. React + three.js is ~450KB of runtime to
                         put behind a static one-page landing site with three
                         images. It would also force a build step, which the
                         brief rules out.

   Conclusion: none of the four earn their weight here. The only visual
   effects on the page are an inline SVG grain layer (zero JS) and a small
   IntersectionObserver wipe, together well under 3KB. Same verdict as
   Subagent 1, reached independently and for different reasons: the issue
   is not only payload, it is that all four fight this art direction.
   ========================================================================== */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------- live year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* --------------------------------------------------------- mobile menu */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  function setMenu(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
  }

  if (burger && drawer) {
    setMenu(false);
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    // desktop breakpoint takes over: make sure state cannot get stuck
    var wide = window.matchMedia('(min-width: 900px)');
    var sync = function () { if (wide.matches) setMenu(false); };
    wide.addEventListener ? wide.addEventListener('change', sync) : wide.addListener(sync);
  }

  /* ------------------------------------------------------------- reveals */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));

  if (reduce.matches || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      // stagger by document order within each batch that enters together
      var hit = entries.filter(function (en) { return en.isIntersecting; });
      hit.forEach(function (en, i) {
        en.target.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------- form: posts nowhere ---
     No backend, no storage, no third party. The submit handler exists only
     to stop the browser navigating and to state plainly that nothing was
     sent, so no one believes a message reached her. -------------------- */
  var form = document.getElementById('enq');
  var note = document.getElementById('formnote');
  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.textContent =
        'Not sent — this form is a placeholder with no destination. ' +
        'Please use beacons.ai/ekaterinatelesh to reach Katerina.';
      note.classList.add('is-said');
    });
  }
})();
