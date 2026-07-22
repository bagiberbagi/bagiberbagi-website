// Toggle state navbar: kuning-transparan di puncak halaman → putih solid setelah
// user mulai scroll. Ambang 24px memberi sedikit histeresis dari posisi 0.
const header = document.querySelector('[data-header]');

if (header) {
  const threshold = 24;
  const sync = () => {
    header.classList.toggle('is-scrolled', window.scrollY > threshold);
  };
  sync(); // set state benar saat load (mis. reload di tengah halaman)
  window.addEventListener('scroll', sync, { passive: true });
}
