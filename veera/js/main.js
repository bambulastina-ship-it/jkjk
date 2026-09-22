/* ==========================================================================
   Veera Gym Fitness — behaviour
   Loader · header · reveal wipes · stats · services · gallery · carousel
   ========================================================================== */
(function () {
  'use strict';

  var LOADER_MS = 3000;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var el = function (t, c) { var n = document.createElement(t); if (c) n.className = c; return n; };
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.9 6.3 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.3 1.3-6.6L2.5 9.1l6.6-.8L12 2Z"/></svg>';

  /* ------------------------------- loader -------------------------------- */
  document.body.classList.add('locked');
  var loader = $('#loader');
  window.setTimeout(function () {
    if (loader) {
      loader.classList.add('done');
      window.setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 600);
    }
    document.body.classList.remove('locked');
    // hero content comes in as soon as the curtain lifts
    Array.prototype.forEach.call(document.querySelectorAll('.hero .wipe'), function (n, i) {
      window.setTimeout(function () { n.classList.add('in'); }, i * 85);
    });
  }, reduced ? 300 : LOADER_MS);

  /* ------------------------------- header -------------------------------- */
  var hd = $('#hd');
  function onScroll() { if (hd) hd.classList.toggle('stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------- reveals ------------------------------- */
  var io = null;
  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  }
  function observe(n) { if (io) io.observe(n); else n.classList.add('in'); }
  Array.prototype.forEach.call(document.querySelectorAll('.wipe'), function (n) {
    if (!n.closest('.hero')) observe(n);
  });

  // zig-zag rows reveal their photo and copy in sequence rather than together
  Array.prototype.forEach.call(document.querySelectorAll('.zrow'), function (row) {
    var parts = row.querySelectorAll('.zrow__fig, .zrow__txt');
    Array.prototype.forEach.call(parts, function (el2, i) {
      el2.classList.add('wipe');
      el2.style.transitionDelay = (i * 130) + 'ms';
      observe(el2);
    });
  });

  /* -------------------------------- images -------------------------------- */
  // Every image slot degrades to nothing rather than to a broken icon.
  // The figure is attached up front: a lazy image that is not in the document
  // never enters the viewport, so it would never load. On failure the figure
  // is removed, so a missing photo leaves no gap.
  function mount(holder, src, alt, onFail) {
    if (!src) { if (holder.parentNode) holder.parentNode.removeChild(holder); onFail(); return; }
    var img = el('img');
    img.alt = alt || '';
    img.loading = 'lazy';
    img.addEventListener('error', function () {
      if (holder.parentNode) holder.parentNode.removeChild(holder);
      onFail();
    });
    img.src = src;
    holder.appendChild(img);
  }

  if (window.IMAGES) {
    var hl = $('#hdLogo');
    if (hl && IMAGES.logo) {
      hl.addEventListener('load', function () {
        hl.hidden = false;
        var m = $('.hd__mark'); if (m) m.hidden = true;
      });
      hl.src = IMAGES.logo;
    }

    var hs = $('.hero__media'), hi = $('#heroImg');
    if (hs && hi) {
      if (IMAGES.hero && IMAGES.hero.src) {
        hi.alt = IMAGES.hero.alt || '';
        hi.addEventListener('error', function () { hi.hidden = true; hs.classList.add('empty'); });
        hi.src = IMAGES.hero.src;
      } else { hi.hidden = true; hs.classList.add('empty'); }
    }

    var gs = $('#gymShots');
    if (gs && IMAGES.experience && IMAGES.experience.length) {
      IMAGES.experience.slice(0, 2).forEach(function (it, i) {
        var f = el('figure');
        f.style.aspectRatio = i === 0 ? '16 / 10' : '16 / 11';
        gs.appendChild(f);
        mount(f, it.src, it.alt, function () {});
      });
    }

    var gg = $('#galGrid');
    function hideGallery() {
      var s = $('#gallery'); if (s) s.style.display = 'none';
      var n = document.querySelector('.hd__nav a[href="#gallery"]'); if (n) n.style.display = 'none';
    }
    if (gg && IMAGES.gallery && IMAGES.gallery.length) {
      var live = 0;
      IMAGES.gallery.forEach(function (it) {
        var f = el('figure');
        if (it.wide) f.className = 'wide';
        live++;
        gg.appendChild(f);
        mount(f, it.src, it.alt, function () { if (--live <= 0) hideGallery(); });
      });
    } else { hideGallery(); }
  }

  /* -------------------------------- stats --------------------------------- */
  var row = $('#statRow');
  if (row && window.STATS) {
    STATS.forEach(function (s) {
      var li = el('li');
      li.innerHTML = '<b>' + (s.star ? STAR : '') + '<span class="v"></span></b><span class="l"></span>';
      $('.v', li).textContent = s.value;
      $('.l', li).textContent = s.label;
      row.appendChild(li);
    });
  }

  /* ------------------- hero ratings, locations, amenities ----------------- */
  var rate = $('#heroRate');
  if (rate && window.GYM && GYM.ratings) {
    GYM.ratings.forEach(function (r) {
      var w = el('span', 'rateItem');
      w.innerHTML = '<b></b><span class="stars">' + new Array(6).join(STAR) + '</span><span class="t"></span>';
      $('b', w).textContent = r.score;
      $('.t', w).textContent = r.source + ' \u00b7 ' + r.count;
      rate.appendChild(w);
    });
  }

  var strip = $('#locStrip');
  if (strip && window.GYM && GYM.branches) {
    GYM.branches.forEach(function (b) {
      var a = el('a'); a.href = '#contact'; a.textContent = b.area; strip.appendChild(a);
    });
  }

  var amen = $('#amenList');
  if (amen && window.AMENITIES) {
    AMENITIES.forEach(function (t) { var li = el('li'); li.textContent = t; amen.appendChild(li); });
  }

  var bl = $('#branchList');
  if (bl && window.GYM && GYM.branches) {
    GYM.branches.forEach(function (b) {
      var d = el('div', 'branch');
      d.innerHTML = '<h3></h3><p></p><a target="_blank" rel="noopener">Open in Google Maps</a>';
      $('h3', d).textContent = b.area;
      $('p',  d).textContent = b.address;
      $('a',  d).href = b.maps;
      bl.appendChild(d);
    });
  }

  /* ------------------------------- strengths ------------------------------ */
  var sl = $('#strengthList');
  if (sl && window.STRENGTHS) {
    STRENGTHS.forEach(function (t) { var li = el('li'); li.textContent = t; sl.appendChild(li); });
  }

  /* ------------------------------- services ------------------------------- */
  var ICONS = {
    dumbbell:'<path d="M4.5 9v6M8 6.5v11M16 6.5v11M19.5 9v6M8 12h8"/>',
    bolt:    '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"/>',
    lotus:   '<path d="M12 4c2 2.4 2.8 5 2.4 7.8M12 4c-2 2.4-2.8 5-2.4 7.8"/><path d="M4 10c2.8.6 5 2.4 6.2 4.8M20 10c-2.8.6-5 2.4-6.2 4.8"/><path d="M3 15.5c1.8 3 5.1 4.8 9 4.8s7.2-1.8 9-4.8"/>',
    pulse:   '<path d="M2 12h4.5l2.2-6 3.4 12 2.6-8 1.8 4H22"/>',
    cycle:   '<circle cx="5.5" cy="17" r="3.3"/><circle cx="18.5" cy="17" r="3.3"/><path d="m8 17 4-8h4M9 9h4M15.5 9l3 8"/>',
    youth:   '<circle cx="12" cy="6" r="2.6"/><path d="M12 8.6V15M8 11l4-1.4 4 1.4M9.5 21 12 15l2.5 6"/>',
    sports:  '<circle cx="12" cy="12" r="9"/><path d="M12 3c2.6 2.4 2.6 15.6 0 18M3.6 9h16.8M3.6 15h16.8"/>',
    leaf:    '<path d="M20 4C10 4 4.5 8.5 4.5 15.5c0 1.6.4 3 1 4.2M20 4c0 10-5.5 15.5-14.5 15.7"/><path d="M20 4c-1 6.5-4.8 10-9.5 11.2"/>'
  };
  var sg = $('#serviceGrid');
  if (sg && window.SERVICES) {
    SERVICES.forEach(function (s) {
      var c = el('article', 'svc');
      c.classList.add('wipe');
      c.innerHTML = '<svg class="svc__ico" viewBox="0 0 24 24" aria-hidden="true">' +
                    (ICONS[s.icon] || ICONS.dumbbell) + '</svg><h3></h3><p></p>';
      $('h3', c).textContent = s.name;
      $('p',  c).textContent = s.body;
      sg.appendChild(c);
      observe(c);
    });
  }

  /* ----------------------------- testimonials ----------------------------- */
  var track = $('#rTrack'), dotsWrap = $('#rDots'), prev = $('#rPrev'), next = $('#rNext');
  if (track && window.TESTIMONIALS && TESTIMONIALS.length) {

    TESTIMONIALS.forEach(function (t) {
      var c = el('article', 'rev');
      c.innerHTML =
        (t.rating ? '<div class="rev__stars" role="img" aria-label="' + t.rating + ' out of 5 stars">' +
                    new Array(t.rating + 1).join(STAR) + '</div>' : '') +
        '<p class="rev__q"></p>' +
        '<div class="rev__by"><span class="rev__av" aria-hidden="true"></span>' +
        '<span><span class="rev__n"></span><br><span class="rev__m"></span></span></div>';
      $('.rev__q', c).textContent = t.quote;
      $('.rev__n', c).textContent = t.name;
      $('.rev__m', c).textContent = t.meta || '';
      $('.rev__av', c).textContent = t.name.trim().charAt(0).toUpperCase();
      track.appendChild(c);
    });

    var cards = track.querySelectorAll('.rev'), dots = [];
    if (dotsWrap) {
      TESTIMONIALS.forEach(function (t, i) {
        var d = el('button', 'dot');
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Testimonial ' + (i + 1) + ' of ' + TESTIMONIALS.length);
        d.addEventListener('click', function () { go(i); });
        dotsWrap.appendChild(d); dots.push(d);
      });
    }
    function step() { return cards.length < 2 ? track.clientWidth : cards[1].offsetLeft - cards[0].offsetLeft; }
    function idx()  { var s = step(); return s ? Math.round(track.scrollLeft / s) : 0; }
    function go(i)  { track.scrollTo({ left: i * step(), behavior: reduced ? 'auto' : 'smooth' }); }
    function sync() {
      var i = idx();
      dots.forEach(function (d, n) {
        d.classList.toggle('on', n === i);
        d.setAttribute('aria-selected', n === i ? 'true' : 'false');
      });
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    track.addEventListener('scroll', sync, { passive: true });
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left:  step(), behavior: reduced ? 'auto' : 'smooth' }); });

    // pointer drag for mouse/pen; touch keeps native momentum scrolling
    var down = false, sx = 0, ss = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0; sx = e.clientX; ss = track.scrollLeft;
      track.classList.add('dragging'); track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      track.scrollLeft = ss - dx; e.preventDefault();
    });
    function end(e) {
      if (!down) return;
      down = false; track.classList.remove('dragging');
      try { track.releasePointerCapture(e.pointerId); } catch (err) {}
      if (moved > 24) go(idx());
      sync();
    }
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left:  step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
    window.addEventListener('resize', sync);
    sync();
  }

  /* -------------------------------- details ------------------------------- */
  var gl = $('#glass');
  if (gl && !reduced && window.matchMedia('(hover: hover)').matches) {
    gl.addEventListener('pointermove', function (e) {
      var r = gl.getBoundingClientRect();
      gl.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      gl.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
