// Program stage band (ProgramStage.astro). The markup already works on its own:
// every chip and arrow is a real anchor pointing at a slide id, the active chip
// is marked at build time, and CSS scroll-snap does the moving. This module adds
// three upgrades on top of that, and none of them is required for the section to
// be readable or navigable.
//
//   1. It intercepts chip and arrow clicks so only the band scrolls sideways.
//      A plain anchor jump would also drag the whole page vertically to line the
//      target up, which yanks the reader out of place.
//   2. It mirrors the visible slide onto the chips of every slide via
//      aria-current. A swipe never fires a click, so without this the copies
//      that scroll into view later would still be marked from build time.
//   3. It advances the band on a timer, so a visitor who never touches anything
//      still sees all four programs.
//
// The timer is the part that can annoy people, so it gives up easily: it never
// starts under prefers-reduced-motion, it retires for good the moment the
// visitor takes control themselves, and it idles whenever the band is
// off-screen, the pointer is over it, focus is inside it, or the tab is in the
// background.
const stage = document.querySelector('[data-stage]');

if (stage) {
  const track = stage.querySelector('[data-stage-track]');
  const slides = [...stage.querySelectorAll('[data-stage-slide]')];
  const links = [...stage.querySelectorAll('[data-stage-goto]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** How long one slide holds before the band moves on. */
  const DWELL_MS = 7000;
  const autoplay = !reduce && slides.length > 1;

  const targetId = (link) => (link.getAttribute('href') || '').slice(1);
  let current = 0;

  // Timer state. Every reason to hold still lives in one set and the timer runs
  // only while that set is empty, so the pointer leaving can never restart the
  // band while the tab is still hidden. Separate booleans got that wrong.
  let timer = null;
  let retired = false;
  const holds = new Set();

  /**
   * Scroll the band to a slide. A jump wider than one step is a wrap from the
   * last slide back to the first: animating that travels past everything in
   * between, so it lands instantly instead.
   */
  const goTo = (index) => {
    const smooth = !reduce && Math.abs(index - current) <= 1;
    track.scrollTo({ left: slides[index].offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
  };

  const sync = () => {
    const shouldRun = autoplay && !retired && holds.size === 0;
    if (shouldRun && timer === null) {
      timer = window.setInterval(() => goTo((current + 1) % slides.length), DWELL_MS);
    } else if (!shouldRun && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const hold = (reason) => { holds.add(reason); sync(); };
  const release = (reason) => { holds.delete(reason); sync(); };

  /** Once the visitor drives, the band never takes the wheel back. */
  const retire = () => { retired = true; sync(); };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const index = slides.findIndex((slide) => slide.id === targetId(link));
      if (index < 0) return;
      event.preventDefault();
      retire();
      goTo(index);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        current = slides.indexOf(entry.target);
        links.forEach((link) => {
          if (link.dataset.stageGoto !== 'chip') return;
          if (targetId(link) === entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    },
    { root: track, threshold: 0.6 }
  );

  slides.forEach((slide) => observer.observe(slide));

  if (autoplay) {
    // Starts held: the band is below the fold on load, and there is no reason to
    // advance through slides nobody is looking at yet.
    hold('offscreen');
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? release('offscreen') : hold('offscreen')),
      { threshold: 0.35 }
    ).observe(stage);

    stage.addEventListener('pointerenter', () => hold('pointer'));
    stage.addEventListener('pointerleave', () => release('pointer'));
    stage.addEventListener('focusin', () => hold('focus'));
    stage.addEventListener('focusout', () => release('focus'));

    document.addEventListener('visibilitychange', () =>
      document.hidden ? hold('hidden') : release('hidden')
    );

    // A swipe or a trackpad nudge is the visitor taking over just as much as a
    // click is, so those retire the timer too.
    track.addEventListener('pointerdown', retire);
    track.addEventListener('wheel', retire, { passive: true });
    track.addEventListener('keydown', retire);
  }
}
