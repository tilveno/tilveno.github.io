/* Screenshot strip + lightbox for /apps/nowline/.
 *
 * No dependency on purpose. Everything a gallery library would give us that we
 * actually need -- modality, Esc to close, a backdrop, focus returning to the
 * element that opened it -- is what <dialog>.showModal() already does. What is
 * left is choosing an image and moving between five of them, which is this file.
 *
 * The markup is the source of truth: the dialog is built from the <button
 * class="shot"> elements found in the strip, so adding or removing a frame in
 * the HTML needs no change here. If this script fails to load the page is still
 * correct -- the frames are still images, the strip still scrolls.
 */
(function () {
  'use strict';

  var strip = document.querySelector('.shots');
  if (!strip) return;
  var shots = Array.prototype.slice.call(strip.querySelectorAll('.shot'));
  if (!shots.length) return;

  var ICON = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function button(cls, label, icon) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.setAttribute('aria-label', label);
    b.innerHTML = icon;
    return b;
  }

  /* ---- the strip's own scroll buttons ---------------------------------- */

  var wrap = strip.parentNode;
  var prev = button('shotnav shotnav--prev', 'Previous screenshots', ICON.prev);
  var next = button('shotnav shotnav--next', 'More screenshots', ICON.next);
  wrap.appendChild(prev);
  wrap.appendChild(next);

  // One frame plus the gap. Read from the DOM rather than hardcoded, so the
  // 640px breakpoint's narrower frame does not need a second number here.
  function step() {
    var gap = parseFloat(getComputedStyle(strip).columnGap) || 16;
    return shots[0].getBoundingClientRect().width + gap;
  }

  function syncNav() {
    var max = strip.scrollWidth - strip.clientWidth;
    prev.hidden = strip.scrollLeft < 8;
    next.hidden = strip.scrollLeft > max - 8;
  }

  prev.addEventListener('click', function () { strip.scrollBy({ left: -step() }); });
  next.addEventListener('click', function () { strip.scrollBy({ left: step() }); });
  strip.addEventListener('scroll', syncNav, { passive: true });
  window.addEventListener('resize', syncNav);
  syncNav();

  /* ---- the lightbox ----------------------------------------------------- */

  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', 'Screenshot viewer');
  dlg.innerHTML =
    '<figure class="lb-fig">' +
    '<img class="lb-img" alt="">' +
    '<figcaption class="lb-cap"></figcaption>' +
    '</figure>';

  var lbPrev = button('lb-btn lb-prev', 'Previous screenshot', ICON.prev);
  var lbNext = button('lb-btn lb-next', 'Next screenshot', ICON.next);
  var lbClose = button('lb-btn lb-close', 'Close', ICON.close);
  dlg.appendChild(lbPrev);
  dlg.appendChild(lbNext);
  dlg.appendChild(lbClose);
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.lb-img');
  var cap = dlg.querySelector('.lb-cap');
  var at = 0;

  function show(i) {
    at = (i + shots.length) % shots.length;
    var src = shots[at].querySelector('img');
    img.src = src.currentSrc || src.src;
    // The overlay line is baked into the frame, so alt is the whole caption and
    // repeating it visually under the image would say everything twice. Split on
    // the em dash the alt text already uses: the headline is in the picture, the
    // description is not.
    var parts = src.alt.split(' — ');
    var text = parts.length > 1 ? parts.slice(1).join(' — ') : src.alt;
    img.alt = src.alt;
    // The tail of the alt starts lower-case because it continued a sentence that
    // began with the headline; standing on its own it needs a capital.
    cap.textContent = text.charAt(0).toUpperCase() + text.slice(1);
  }

  function open(i) {
    show(i);
    document.body.classList.add('lb-open');
    dlg.showModal();
  }

  shots.forEach(function (b, i) {
    b.addEventListener('click', function () { open(i); });
  });

  lbPrev.addEventListener('click', function () { show(at - 1); });
  lbNext.addEventListener('click', function () { show(at + 1); });
  lbClose.addEventListener('click', function () { dlg.close(); });

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
  });

  // A click that lands on the dialog itself rather than on the figure or a
  // button is a click on the backdrop area, and closes.
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) dlg.close();
  });

  // close fires for Esc as well as for our own .close(), so the scroll lock is
  // released in one place.
  dlg.addEventListener('close', function () {
    document.body.classList.remove('lb-open');
    // Keep the strip lined up with whatever was last viewed, so closing on the
    // fifth frame does not leave the strip showing the first.
    shots[at].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
})();
