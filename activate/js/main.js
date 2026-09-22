/* ==========================================================================
   Activate Unisex Fitness Studio — behaviour
   Loader · header · scroll reveal · gallery · services · testimonial carousel
   ========================================================================== */
(function () {
  'use strict';

  var LOADER_MS = 3000;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var el = function (tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; };

  /* ------------------------------- loader -------------------------------- */
  // Exactly 3s, then fade out and release the page.
  document.body.classList.add('is-loading');
  var loader = $('#loader');

  function dismissLoader() {
    if (!loader) { document.body.classList.remove('is-loading'); return; }
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    window.setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 600);
    revealVisible();
  }
  window.setTimeout(dismissLoader, reduced ? 300 : LOADER_MS);

  /* ------------------------------- header -------------------------------- */
  var hdr = $('#hdr');
  function onScroll() {
    if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------- scroll reveal ---------------------------- */
  var io = null;
  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  function observe(node) {
    if (io) io.observe(node); else node.classList.add('in');
  }
  function revealVisible() {
    // Hero content should already be showing the moment the loader lifts.
    Array.prototype.forEach.call(document.querySelectorAll('.hero .reveal'), function (n, i) {
      window.setTimeout(function () { n.classList.add('in'); }, i * 90);
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) {
    if (!n.closest('.hero')) observe(n);
  });

  /* -------------------------------- images -------------------------------- */
  // A photo that has not been uploaded yet simply drops out; nothing looks broken.
  function imageOrDrop(src, alt, onFail) {
    var img = el('img');
    img.src = src;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.addEventListener('error', onFail);
    return img;
  }

  /* ------------------------------- gallery -------------------------------- */
  var grid = $('#galleryGrid');
  function hideGallery() {
    var sec = document.getElementById('gallery');
    if (sec) sec.style.display = 'none';
    var nav = document.querySelector('.hdr__nav a[href="#gallery"]');
    if (nav) nav.style.display = 'none';
  }
  if (grid && window.IMAGES && IMAGES.gallery && IMAGES.gallery.length) {
    var live = 0;
    IMAGES.gallery.forEach(function (item) {
      var fig = el('figure', 'g-item');
      fig.appendChild(imageOrDrop(item.src, item.alt, function () {
        if (fig.parentNode) fig.parentNode.removeChild(fig);
        if (--live <= 0) hideGallery();
      }));
      grid.appendChild(fig);
      live++;
    });
  } else {
    hideGallery();
  }

  /* ------------------------------- services ------------------------------- */
  var svcGrid = $('#servicesGrid');
  if (svcGrid && window.SERVICES) {
    SERVICES.forEach(function (name, n) {
      var item = el('li', 'svc');
      item.classList.add('reveal');
      item.innerHTML = '<span class="svc__n"></span><span class="svc__name"></span>';
      $('.svc__n', item).textContent = (n + 1 < 10 ? '0' : '') + (n + 1);
      $('.svc__name', item).textContent = name;
      svcGrid.appendChild(item);
      observe(item);
    });
  }

  /* ----------------------------- second phone ----------------------------- */
  var p2 = $('#phone2');
  if (p2 && window.STUDIO && STUDIO.phone2Link) {
    p2.href = STUDIO.phone2Link;
    p2.textContent = STUDIO.phone2Display;
  } else if (p2) {
    p2.closest('.info-row') && p2.closest('.info-row').remove();
  }

  /* ----------------------------- testimonials ----------------------------- */
  var track = $('#revTrack');
  var dotsWrap = $('#revDots');
  var prevBtn = $('#revPrev');
  var nextBtn = $('#revNext');

  if (track && window.TESTIMONIALS && TESTIMONIALS.length) {

    TESTIMONIALS.forEach(function (t) {
      var card = el('article', 'rcard');
      var stars = '';
      if (t.rating) {
        var star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.9 6.3 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.3 1.3-6.6L2.5 9.1l6.6-.8L12 2Z"/></svg>';
        stars = '<div class="rcard__stars" role="img" aria-label="' + t.rating + ' out of 5 stars">' +
                new Array(t.rating + 1).join(star) + '</div>';
      }
      card.innerHTML =
        '<div class="rcard__mark" aria-hidden="true">“</div>' +
        stars +
        '<p class="rcard__quote"></p>' +
        '<div class="rcard__who">' +
          '<span class="rcard__av" aria-hidden="true"></span>' +
          '<span><span class="rcard__name"></span><br><span class="rcard__meta"></span></span>' +
        '</div>';
      $('.rcard__quote', card).textContent = t.quote;
      $('.rcard__name',  card).textContent = t.name;
      $('.rcard__meta',  card).textContent = t.meta || '';
      $('.rcard__av',    card).textContent = t.name.trim().charAt(0).toUpperCase();
      track.appendChild(card);
    });

    var cards = track.querySelectorAll('.rcard');

    // ---- dots
    var dots = [];
    if (dotsWrap) {
      TESTIMONIALS.forEach(function (t, i) {
        var d = el('button', 'rdot');
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Testimonial ' + (i + 1) + ' of ' + TESTIMONIALS.length);
        d.addEventListener('click', function () { scrollToCard(i); });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    function step() {
      if (cards.length < 2) return track.clientWidth;
      return cards[1].offsetLeft - cards[0].offsetLeft;
    }
    function activeIndex() {
      var s = step();
      return s ? Math.round(track.scrollLeft / s) : 0;
    }
    function scrollToCard(i) {
      track.scrollTo({ left: i * step(), behavior: reduced ? 'auto' : 'smooth' });
    }
    function syncUI() {
      var i = activeIndex();
      dots.forEach(function (d, n) {
        d.classList.toggle('is-on', n === i);
        d.setAttribute('aria-selected', n === i ? 'true' : 'false');
      });
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= max;
    }
    track.addEventListener('scroll', syncUI, { passive: true });

    if (prevBtn) prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' });
    });

    // ---- pointer drag (mouse / pen). Touch keeps native momentum scrolling.
    var down = false, startX = 0, startScroll = 0, moved = 0;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      track.scrollLeft = startScroll - dx;
      e.preventDefault();
    });
    function endDrag(e) {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
      try { track.releasePointerCapture(e.pointerId); } catch (err) {}
      if (moved > 24) scrollToCard(activeIndex());   // settle onto a card
      syncUI();
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // ---- keyboard
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });

    window.addEventListener('resize', syncUI);
    syncUI();
  }

  /* ------------------------------ studio info ----------------------------- */
  if (window.STUDIO) {
    var maps = $('#mapsLink');
    if (maps && STUDIO.address && STUDIO.address.mapsUrl) maps.href = STUDIO.address.mapsUrl;

    var hoursEl = $('#hoursValue');
    if (hoursEl && STUDIO.hours && STUDIO.hours.full) {
      hoursEl.textContent = '';
      STUDIO.hours.full.forEach(function (row) {
        var line = el('span', 'hours-row');
        var a = el('span'); a.textContent = row.days;
        var b = el('span'); b.textContent = row.time;
        line.appendChild(a); line.appendChild(b);
        hoursEl.appendChild(line);
      });
    }
  }

  /* --------------------- glass wordmark specular ------------------------- */
  // The highlight follows the pointer across the glass, so it reads as a lit
  // surface rather than a flat panel. Pointer only - no cost on touch.
  var gmark = $('#glassmark');
  if (gmark && !reduced && window.matchMedia('(hover: hover)').matches) {
    gmark.addEventListener('pointermove', function (e) {
      var r = gmark.getBoundingClientRect();
      gmark.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      gmark.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
