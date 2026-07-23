// Lightbox galeri jejak: klik thumbnail buka overlay, navigasi prev/next,
// dukungan keyboard (Esc / panah kiri-kanan), klik backdrop atau tombol tutup
// untuk menutup. Vanilla, tanpa dependency. Prev/next disembunyikan bila cuma
// satu foto. Fokus dikembalikan ke thumbnail terakhir saat ditutup.
const box = document.querySelector('[data-lightbox]');
const items = [...document.querySelectorAll('[data-gallery-item]')];

if (box && items.length > 0) {
  const imgEl = box.querySelector('[data-lightbox-img]');
  const counter = box.querySelector('[data-lightbox-counter]');
  const prevBtn = box.querySelector('[data-lightbox-prev]');
  const nextBtn = box.querySelector('[data-lightbox-next]');
  const closeEls = [...box.querySelectorAll('[data-lightbox-close]')];
  const sources = items.map((el) => el.dataset.src);
  const many = sources.length > 1;
  let idx = 0;
  let lastFocus = null;

  prevBtn.hidden = !many;
  nextBtn.hidden = !many;
  if (counter) counter.hidden = !many;

  function show(i) {
    idx = (i + sources.length) % sources.length;
    imgEl.src = sources[idx];
    if (counter) counter.textContent = `${idx + 1} / ${sources.length}`;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.remove('hidden');
    box.classList.add('flex');
    box.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    (many ? nextBtn : closeEls[0]).focus();
  }

  function close() {
    box.classList.add('hidden');
    box.classList.remove('flex');
    box.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  items.forEach((el, i) => el.addEventListener('click', () => open(i)));
  closeEls.forEach((el) => el.addEventListener('click', close));

  if (many) {
    prevBtn.addEventListener('click', () => show(idx - 1));
    nextBtn.addEventListener('click', () => show(idx + 1));
  }

  document.addEventListener('keydown', (e) => {
    if (box.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    else if (many && e.key === 'ArrowLeft') show(idx - 1);
    else if (many && e.key === 'ArrowRight') show(idx + 1);
  });
}

// Carousel foto lain: panah geser, sembunyi bila tidak overflow, nonaktif di ujung.
const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const track = carousel.querySelector('[data-carousel-track]');
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');

  const update = () => {
    const overflow = track.scrollWidth - track.clientWidth > 4;
    prev.hidden = !overflow;
    next.hidden = !overflow;
    if (overflow) {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }
  };
  const step = () => Math.max(track.clientWidth * 0.8, 160);

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
