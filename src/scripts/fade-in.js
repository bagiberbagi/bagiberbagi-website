const elements = document.querySelectorAll('[data-fade]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduce) {
  // Hormati prefers-reduced-motion: tampilkan langsung, tanpa animasi.
  elements.forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else {
  elements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      // Cascade: elemen yang masuk viewport dalam satu batch dimunculkan beruntun
      // dengan jeda kecil menaik (di-cap agar grup besar tidak kelamaan), jadi
      // kartu muncul satu-satu, bukan serempak.
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, i) => {
          const el = entry.target;
          el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
          el.style.opacity = '1';
          el.style.transform = 'none';
          observer.unobserve(el);
        });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}
