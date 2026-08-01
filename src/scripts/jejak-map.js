// Pemicu peta jejak. Sengaja sekecil ini: yang berat (Leaflet + CSS-nya) ada di
// jejak-map-render.js dan baru diunduh saat tombolnya ditekan, jadi pembaca yang
// cuma ingin membaca laporannya tak membayar apa pun untuk peta.
const roots = [...document.querySelectorAll('[data-map]')];

roots.forEach((root) => {
  const button = root.querySelector('[data-map-open]');
  if (!button) return;

  let points;
  try {
    points = JSON.parse(root.dataset.points || '[]');
  } catch {
    return;
  }
  if (!Array.isArray(points) || points.length === 0) return;

  button.addEventListener(
    'click',
    async () => {
      // Warna pintu diambil dari CSS supaya pin-nya ikut identitas halaman,
      // bukan warna yang ditulis dua kali di sini dan di stylesheet.
      const color = getComputedStyle(root).getPropertyValue('--cat').trim() || '#F4791D';

      const loading = document.createElement('span');
      loading.className = 'absolute inset-0 grid place-items-center text-body-sm font-semibold text-muted';
      loading.textContent = 'Memuat peta…';
      root.replaceChildren(loading);

      const { renderMap } = await import('./jejak-map-render.js');

      const canvas = document.createElement('div');
      canvas.className = 'absolute inset-0';
      root.replaceChildren(canvas);
      renderMap(canvas, points, color);
    },
    { once: true }
  );
});
