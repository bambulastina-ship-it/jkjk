/* Lara Issa — lean interactions only.
   Same lightweight pattern as the katerina-telesh reference build:
   a scroll-state nav, a staggered IntersectionObserver reveal, a floating
   glass CTA that appears past the hero, and the footer year.
   No WebGL, no three.js, no libraries, no build step, no network calls. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var nav = document.querySelector('.nav');
  var float = document.getElementById('floatCta');
  var hero = document.getElementById('top');

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (nav) nav.classList.toggle('scrolled', y > 24);
      if (float && hero) {
        var past = y > hero.offsetHeight * 0.72;
        float.classList.toggle('on', past);
        float.setAttribute('aria-hidden', past ? 'false' : 'true');
        float.setAttribute('tabindex', past ? '0' : '-1');
      }
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // the floating CTA stands down once the closing CTAs are on screen
  var closeCta = document.querySelector('.close .cta-row');
  if (float && closeCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      float.classList.toggle('stand-down', es[0].isIntersecting);
    }, { threshold: 0 }).observe(closeCta);
  }

  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('in');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (n) {
        return n.classList && n.classList.contains('reveal');
      });
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 95 + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
  for (var j = 0; j < items.length; j++) io.observe(items[j]);
})();
