/* Muhammed Ashmid — interactions only.
   Three things: a scroll state on the glass nav, staggered entrance reveals,
   and the footer year. No libraries, no WebGL, no build step. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 24);
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
