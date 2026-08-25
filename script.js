// The section name starts hidden (see `.js .section-name` in styles.css) and is
// revealed by gliding in from the right into place beside the logo. Hiding it up
// front avoids a flash of the text sitting in its final position.
(function () {
  var revealed = false;

  function show(name) {
    name.style.opacity = '1';
  }

  function animateIn(name, dot) {
    var n = name.getBoundingClientRect();
    var d = dot.getBoundingClientRect();

    // Always a purely horizontal glide, and always entering from the right, so the
    // motion reads the same whether the dots sit beside the name (wide screens) or
    // on their own row below it (narrow screens).
    var dx = Math.abs((d.left + d.width / 2) - (n.left + n.width / 2));

    // Nothing to travel: just show it rather than animating in place.
    if (dx < 1) {
      show(name);
      return;
    }

    var anim = name.animate(
      [
        { transform: 'translateX(' + dx + 'px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      { duration: 1200, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' }
    );

    // Hand the final state over to a plain inline style and drop the animation.
    // A filled animation left in place fights any later relayout, which is what
    // makes the text look like it settles twice.
    anim.finished.then(function () {
      show(name);
      anim.cancel();
    }, function () {
      show(name);
    });
  }

  function reveal() {
    if (revealed) return;
    revealed = true;

    var name = document.querySelector('.section-name');
    if (!name) return;

    var dot = document.querySelector('.circle-nav a[aria-current="page"] .dot');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No dot to travel from, motion turned down, or no Web Animations: just show it.
    if (!dot || reduceMotion || typeof name.animate !== 'function') {
      show(name);
      return;
    }

    // Two frames so the measurement happens against settled layout rather than
    // whatever the page looked like mid-transition.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        animateIn(name, dot);
      });
    });
  }

  function start() {
    // Measure once the webfont is in, otherwise the text box is the wrong width.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reveal, reveal);
    } else {
      reveal();
    }
  }

  // `pagereveal` fires on every navigation in browsers that support it, with or
  // without a view transition, so it is the single trigger there. Listening to
  // DOMContentLoaded as well would race it: that event can arrive first, starting
  // the glide underneath the outgoing page snapshot so the text lands twice.
  if ('onpagereveal' in window) {
    window.addEventListener('pagereveal', function (event) {
      if (event.viewTransition) {
        event.viewTransition.finished.then(start, start);
      } else {
        start();
      }
    });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Safety net: never leave the name invisible if something above stalls.
  setTimeout(reveal, 2500);
})();
