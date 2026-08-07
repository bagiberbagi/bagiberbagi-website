// Perilaku kartu donasi (DonationCard.astro): tanggal agenda berikutnya,
// pemilih paket, pemilih porsi, dan tombol WhatsApp yang pesannya ikut berubah.
//
// Tanggal sengaja dihitung di klien, bukan saat build. Situs ini statis dan
// hanya di-build ulang kalau ada perubahan konten, jadi tanggal hasil build
// akan basi begitu Jumatnya lewat.
//
// Ditulis per-kartu (bukan satu kartu per halaman) supaya satu halaman boleh
// memuat lebih dari satu kartu tanpa yang kedua jadi mati.
import { formatRupiah, buildWaLink, buildDonationMessage } from '../lib/format';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

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

function initAgenda(card) {
  const dateEl = card.querySelector('[data-agenda-date]');
  const countEl = card.querySelector('[data-agenda-count]');
  if (!dateEl && !countEl) return;

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

function initPicker(card) {
  const price = parseInt(card.dataset.price || '25000', 10);
  const program = card.dataset.program || 'Jumat Berkah';
  const waNumber = card.dataset.wa || '';

  const chips = Array.from(card.querySelectorAll('[data-porsi]'));
  const customToggle = card.querySelector('[data-porsi-custom]');
  const stepper = card.querySelector('[data-stepper]');
  const input = card.querySelector('[data-porsi-input]');
  const cta = card.querySelector('[data-donasi-cta]');
  const ctaLabel = card.querySelector('[data-donasi-label]');
  const packageOptions = Array.from(card.querySelectorAll('[data-package-option]'));

  // null = pengunjung belum memilih apa pun, dan itulah keadaan awal: kartu ini
  // sengaja tidak memilihkan jumlah porsi lebih dulu. Selama masih null, tombol
  // donasi memakai teks dan href yang dirender server, yang menyebut program
  // tanpa menyebut jumlah.
  let porsi = null;
  let custom = false;
  // null di sini berarti dua hal sekaligus, dan keduanya benar: program ini
  // sepaket tunggal, ATAU pengunjung belum memilih paket. Tak ada paket yang
  // dipilihkan lebih dulu, aturan yang sama dengan porsi di atas.
  let pkg = null;

  // Teks tombol sebelum ada pilihan. Diambil dari DOM, bukan ditulis ulang di
  // sini, supaya kalimatnya cuma hidup di DonationCard.astro.
  const openLabel = ctaLabel ? ctaLabel.textContent : '';

  function render() {
    const chosen = porsi !== null;

    chips.forEach((chip) => {
      const active = chosen && !custom && parseInt(chip.dataset.porsi, 10) === porsi;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });

    if (customToggle) {
      customToggle.classList.toggle('is-active', custom);
      customToggle.setAttribute('aria-pressed', String(custom));
    }
    if (stepper) stepper.hidden = !custom;
    if (input && chosen && input.value !== String(porsi)) input.value = String(porsi);

    packageOptions.forEach((opt) => {
      opt.setAttribute('aria-pressed', String(opt.dataset.packageOption === pkg));
    });

    if (!chosen) {
      if (ctaLabel) ctaLabel.textContent = openLabel;
      // Satu-satunya hal yang menggeser href selagi porsi belum dipilih adalah
      // pilihan paket, dan tiap tombol paket membawa pesan tanpa-porsi versinya
      // sendiri. Selama `pkg` masih null pencarian ini tak menemukan apa pun,
      // jadi href dari server bertahan — dan itu memang jawaban yang benar,
      // sebab server merender pesan untuk keadaan "belum memilih apa-apa".
      const openMsg = packageOptions.find((opt) => opt.dataset.packageOption === pkg)?.dataset
        .packageOpenMsg;
      if (cta && openMsg) cta.href = buildWaLink(waNumber, openMsg);
      return;
    }

    // Porsi sudah dipilih tapi paket belum, dan program ini punya paket: pesannya
    // ikut menanyakan paket. Tanpa cabang ini tim menerima jumlah porsi tanpa
    // tahu paket mana yang dimaksud.
    const askPackage = packageOptions.length > 0 && pkg === null;
    const total = formatRupiah(porsi * price);
    if (ctaLabel) ctaLabel.textContent = `Donasi ${porsi} Porsi · ${total}`;
    if (cta) {
      cta.href = buildWaLink(
        waNumber,
        buildDonationMessage(program, porsi, total, pkg ?? undefined, askPackage)
      );
      cta.dataset.trackPax = String(porsi);
    }
  }

  // Satu-satunya pintu masuk ke `porsi`, dan ia menjepit ke 1..999 — jadi tak
  // ada jalan ke nol atau minus, baik lewat tombol −, ketikan tangan, maupun
  // input yang dikosongkan (NaN jatuh ke 1 di pemanggilnya).
  function set(next, isCustom) {
    porsi = Math.max(1, Math.min(999, next));
    custom = !!isCustom;
    render();
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => set(parseInt(chip.dataset.porsi, 10), false));
  });
  // Kalau belum ada pilihan, panel "Lainnya" mulai dari 1 — angka terkecil yang
  // masuk akal, sama dengan `value` yang dirender server. Kalau pengunjung sudah
  // menekan salah satu preset, angka itu yang terbawa ke panel.
  customToggle?.addEventListener('click', () => set(porsi ?? 1, true));
  card.querySelector('[data-step-dec]')?.addEventListener('click', () => set((porsi ?? 1) - 1, true));
  card.querySelector('[data-step-inc]')?.addEventListener('click', () => set((porsi ?? 1) + 1, true));
  input?.addEventListener('input', () => set(parseInt(input.value, 10) || 1, true));
  packageOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      pkg = opt.dataset.packageOption;
      render();
    });
  });

  render();
}

document.querySelectorAll('[data-donation-card]').forEach((card) => {
  initAgenda(card);
  initPicker(card);
});
