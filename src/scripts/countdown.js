// Hitung mundur ke Jumat Berkah berikutnya (Jumat pukul 06:00 waktu lokal).
// Mengisi empat segmen angka (#jb-d/#jb-h/#jb-m/#jb-s) dua digit dan diperbarui
// tiap detik. Unit nol di depan (mis. "00 hari") diredupkan lewat class .jb-dim
// pada pembungkusnya agar fokus ke waktu yang tersisa. Vanilla, tanpa dependensi.
const KEYS = ['d', 'h', 'm', 's'];
const els = KEYS.map((k) => document.getElementById('jb-' + k));

if (els.every(Boolean)) {
  // Jadwal dibaca dari data attribute chip (diisi dari settings Keystatic).
  // Fallback ke Jumat 06:00 bila atribut hilang atau tidak valid.
  const cfgEl = document.querySelector('[data-jb-weekday]');
  let weekday = 5; // 0=Minggu … 6=Sabtu
  let targetHour = 6;
  let targetMinute = 0;
  if (cfgEl) {
    const w = parseInt(cfgEl.dataset.jbWeekday, 10);
    if (!Number.isNaN(w) && w >= 0 && w <= 6) weekday = w;
    const [rawH, rawM] = String(cfgEl.dataset.jbTime || '').split(':');
    const h = parseInt(rawH, 10);
    const m = parseInt(rawM, 10);
    if (!Number.isNaN(h) && h >= 0 && h <= 23) targetHour = h;
    if (!Number.isNaN(m) && m >= 0 && m <= 59) targetMinute = m;
  }

  // Waktu jadwal terdekat (hari + jam terpilih) yang masih di depan "now".
  function nextTarget(now) {
    const target = new Date(now);
    target.setHours(targetHour, targetMinute, 0, 0);
    const daysAhead = (weekday - target.getDay() + 7) % 7;
    target.setDate(target.getDate() + daysAhead);
    // Kalau jadwal minggu ini sudah lewat, lompat ke minggu depan.
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 7);
    }
    return target;
  }

  const p2 = (n) => String(n).padStart(2, '0');

  // Detik berkedip lembut tiap pergantian angka agar mata terundang; dimatikan
  // saat user minta reduce-motion.
  const secEl = els[3];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let prevSec = -1;

  function render() {
    const now = new Date();
    let diff = nextTarget(now).getTime() - now.getTime();
    if (diff < 0) diff = 0;

    const total = Math.floor(diff / 1000);
    const vals = [
      Math.floor(total / 86400),
      Math.floor((total % 86400) / 3600),
      Math.floor((total % 3600) / 60),
      total % 60,
    ];

    // Redupkan unit nol yang berurutan dari kiri; berhenti begitu ketemu unit
    // pertama yang tidak nol. Detik tidak pernah diredupkan (selalu ada sisa).
    let leadingZero = true;
    vals.forEach((v, i) => {
      els[i].textContent = p2(v);
      const dim = leadingZero && v === 0 && i < 3;
      els[i].parentElement.classList.toggle('jb-dim', dim);
      if (v !== 0) leadingZero = false;
    });

    if (!reduceMotion && vals[3] !== prevSec && secEl.animate) {
      secEl.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 550, easing: 'ease-out' });
    }
    prevSec = vals[3];
  }

  render();
  setInterval(render, 1000);
}
