// The section name starts hidden (see `.js .section-name` in styles.css) and is
// revealed by gliding horizontally out of its own coloured dot into place beside
// the logo. Hiding it up front avoids a flash of the text in its final position.
(function () {
  var revealed = false;

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

    // Purely horizontal travel: start out at the dot, glide left into place.
    var dx = (d.left + d.width / 2) - (n.left + n.width / 2);

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
      setTimeout(reveal, 1200); // safety net if the font never settles
    } else {
      reveal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
