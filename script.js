// The section name starts hidden (see `.js .section-name` in styles.css) and is
// revealed by gliding out of its own coloured dot into place beside the logo.
// Hiding it up front avoids a flash of the text sitting in its final position.
(function () {
  var revealed = false;
  var waitingForTransition = false;

  function reveal() {
    if (revealed) return;
    revealed = true;

    var name = document.querySelector('.section-name');
    if (!name) return;

    var dot = document.querySelector('.circle-nav a[aria-current="page"] .dot');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No dot to travel from, motion turned down, or no Web Animations: just show it.
    if (!dot || reduceMotion || typeof name.animate !== 'function') {
      name.style.opacity = '1';
      return;
    }

    var n = name.getBoundingClientRect();
    var d = dot.getBoundingClientRect();

    // Always a purely horizontal glide, and always entering from the right, so the
    // motion reads the same whether the dots sit beside the name (wide screens) or
    // on their own row below it (narrow screens).
    var dx = Math.abs((d.left + d.width / 2) - (n.left + n.width / 2));

    name.animate(
      [
        { transform: 'translateX(' + dx + 'px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      { duration: 1200, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' }
    );
  }

  function start() {
    // Measure once the webfont is in, otherwise the text box is the wrong width.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reveal);
    } else {
      reveal();
    }
  }

  // When the page arrives via a cross-document view transition, the dots are still
  // sliding into their new slots. Waiting for that to settle stops the name from
  // animating twice over — once under the outgoing snapshot, once for real.
  if ('onpagereveal' in window) {
    window.addEventListener('pagereveal', function (event) {
      if (event.viewTransition) {
        waitingForTransition = true;
        event.viewTransition.finished.then(start, start);
      }
    });
  }

  function startIfNoTransition() {
    if (!waitingForTransition) start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startIfNoTransition);
  } else {
    startIfNoTransition();
  }

  // Safety net: never leave the name invisible if something above stalls.
  setTimeout(reveal, 2500);
})();
