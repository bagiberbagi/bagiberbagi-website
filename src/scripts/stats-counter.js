const section = document.getElementById('stats-section');
const danaEl = document.getElementById('stat-dana');
const donaturEl = document.getElementById('stat-donatur');
const berbagiEl = document.getElementById('stat-berbagi');
const areaEl = document.getElementById('stat-area');

let started = false;

function animate(targets) {
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);

    // Kolom 1 (porsi) & 2 (titik): bilangan bulat polos.
    danaEl.textContent = Math.round(targets.dana * eased).toLocaleString('id-ID');
    donaturEl.textContent = Math.round(targets.donatur * eased).toLocaleString('id-ID');
    // Kolom 3 (donasi): prefix "Rp" + suffix "jt", desimal koma (id-ID).
    berbagiEl.textContent = 'Rp ' + (targets.berbagi * eased).toFixed(1).replace('.', ',') + ' jt';
    // Kolom 4 (terdokumentasi): suffix persen.
    areaEl.textContent = Math.round(targets.area * eased) + '%';

    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (section && danaEl && donaturEl && berbagiEl && areaEl) {
  const targets = {
    dana: parseFloat(section.dataset.targetDana),
    donatur: parseFloat(section.dataset.targetDonatur),
    berbagi: parseFloat(section.dataset.targetBerbagi),
    area: parseFloat(section.dataset.targetArea),
  };
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        animate(targets);
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(section);
}
