import { STAT_TARGETS } from '../consts';

const section = document.getElementById('stats-section');
const danaEl = document.getElementById('stat-dana');
const donaturEl = document.getElementById('stat-donatur');
const berbagiEl = document.getElementById('stat-berbagi');
const areaEl = document.getElementById('stat-area');

let started = false;

function animate() {
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);

    danaEl.textContent = 'Rp ' + (STAT_TARGETS.dana * eased).toFixed(1) + 'Jt';
    donaturEl.textContent = Math.round(STAT_TARGETS.donatur * eased).toLocaleString('id-ID');
    berbagiEl.textContent = Math.round(STAT_TARGETS.berbagi * eased).toLocaleString('id-ID');
    areaEl.textContent = Math.round(STAT_TARGETS.area * eased).toLocaleString('id-ID');

    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (section && danaEl && donaturEl && berbagiEl && areaEl) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        animate();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(section);
}
