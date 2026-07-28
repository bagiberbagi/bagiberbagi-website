// Count-up angka statistik. Menganimasi tiap [data-count-to] di dalam
// [data-stats] dari 0 ke nilai targetnya saat wadah masuk viewport, dengan
// dukungan awalan/akhiran lewat data-prefix / data-suffix.
//
// Nilai final sudah dirender di server, jadi tanpa JavaScript angkanya tetap
// terbaca. Skrip ini baru menurunkannya ke 0 kalau animasi memang akan jalan,
// dan sama sekali tidak menyentuh markup saat prefers-reduced-motion aktif.
const wrap = document.querySelector('[data-stats]');

if (wrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const els = Array.from(wrap.querySelectorAll('[data-count-to]'));

  const render = (el, value) => {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = prefix + Math.round(value).toLocaleString('id-ID') + suffix;
  };

  els.forEach((el) => render(el, 0));

  let started = false;
  const run = () => {
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      els.forEach((el) => render(el, parseFloat(el.dataset.countTo) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        run();
        observer.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  observer.observe(wrap);
}
