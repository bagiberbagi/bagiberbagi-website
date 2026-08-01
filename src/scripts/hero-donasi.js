// Kartu donasi di hero: tanggal agenda berikutnya, pemilih porsi, dan tombol
// WhatsApp yang pesannya ikut berubah.
//
// Tanggal sengaja dihitung di klien, bukan saat build. Situs ini statis dan
// hanya di-build ulang kalau ada perubahan konten, jadi tanggal hasil build
// akan basi begitu Jumatnya lewat.

const card = document.querySelector('[data-hero-donasi]');

if (card) {
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

  /* ===== Agenda berikutnya ===== */

  // Kejadian berikutnya dari jadwal mingguan. Kalau hari ini hari-H tapi jamnya
  // sudah lewat, lompat ke minggu depan supaya tidak menampilkan agenda yang
  // sudah selesai.
  function nextOccurrence(weekday, time) {
    const [h, m] = time.split(':').map((v) => parseInt(v, 10) || 0);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    let delta = (weekday - target.getDay() + 7) % 7;
    if (delta === 0 && target.getTime() <= now.getTime()) delta = 7;
    target.setDate(target.getDate() + delta);
    return target;
  }

  const dateEl = card.querySelector('[data-agenda-date]');
  const countEl = card.querySelector('[data-agenda-count]');

  if (dateEl || countEl) {
    const weekday = parseInt(card.dataset.weekday || '5', 10);
    const next = nextOccurrence(weekday, card.dataset.time || '06:00');

    if (dateEl) {
      dateEl.textContent = `${HARI[next.getDay()]}, ${next.getDate()} ${BULAN[next.getMonth()]}`;
    }

    if (countEl) {
      // Selisih dihitung per hari kalender, bukan per 24 jam, supaya "besok"
      // tetap berbunyi "1 hari lagi" walau tinggal beberapa jam.
      const today = new Date();
      const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const b = new Date(next.getFullYear(), next.getMonth(), next.getDate());
      const days = Math.round((b - a) / 86400000);
      countEl.textContent = days === 0 ? 'hari ini' : days === 1 ? 'besok' : `${days} hari lagi`;
    }
  }

  /* ===== Pemilih porsi ===== */

  const price = parseInt(card.dataset.price || '25000', 10);
  const program = card.dataset.program || 'Jumat Berkah';
  const waNumber = card.dataset.wa || '';

  const chips = Array.from(card.querySelectorAll('[data-porsi]'));
  const customToggle = card.querySelector('[data-porsi-custom]');
  const stepper = card.querySelector('[data-stepper]');
  const input = card.querySelector('[data-porsi-input]');
  const cta = card.querySelector('[data-donasi-cta]');
  const ctaLabel = card.querySelector('[data-donasi-label]');

  let porsi = parseInt(card.dataset.defaultPorsi || '6', 10);
  let custom = false;

  function render() {
    chips.forEach((chip) => {
      const active = !custom && parseInt(chip.dataset.porsi, 10) === porsi;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });

    if (customToggle) {
      customToggle.classList.toggle('is-active', custom);
      customToggle.setAttribute('aria-pressed', String(custom));
    }
    if (stepper) stepper.hidden = !custom;
    if (input && input.value !== String(porsi)) input.value = String(porsi);

    const total = rupiah(porsi * price);
    if (ctaLabel) ctaLabel.textContent = `Donasi ${porsi} Porsi · ${total}`;
    if (cta) {
      const text = `Halo, saya ingin donasi program "${program}" untuk ${porsi} pax (Total: ${total}).`;
      cta.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
      cta.dataset.trackPax = String(porsi);
    }
  }

  function set(next, isCustom) {
    porsi = Math.max(1, Math.min(999, next));
    custom = !!isCustom;
    render();
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => set(parseInt(chip.dataset.porsi, 10), false));
  });
  customToggle?.addEventListener('click', () => set(porsi, true));
  card.querySelector('[data-step-dec]')?.addEventListener('click', () => set(porsi - 1, true));
  card.querySelector('[data-step-inc]')?.addEventListener('click', () => set(porsi + 1, true));
  input?.addEventListener('input', () => set(parseInt(input.value, 10) || 1, true));

  render();
}
