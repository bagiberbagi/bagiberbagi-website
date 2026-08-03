import { calcTotal, formatRupiah, buildWaLink, buildDonationMessage } from '../lib/format';

// Selector paket program self-serve multi-paket (mis. Ramadhan Berbagi:
// Sahur/Takjil/Buka Puasa). Server sudah merender tombol donasi dengan paket
// pertama sebagai default (progresif tanpa JS); skrip ini cuma
// memperbarui href-nya begitu pengunjung memilih paket lain.
const selector = document.querySelector('[data-package-selector]');
const donateLink = document.querySelector('[data-donate-link]');

if (selector && donateLink) {
  const waNumber = selector.dataset.waNumber;
  const programLabel = selector.dataset.programLabel;
  const pax = Number(selector.dataset.pax);
  const options = [...selector.querySelectorAll('[data-package-option]')];

  function render(selected) {
    options.forEach((opt) => opt.setAttribute('aria-pressed', opt === selected ? 'true' : 'false'));
    const message = buildDonationMessage(programLabel, pax, formatRupiah(calcTotal(pax)), selected.dataset.packageOption);
    donateLink.href = buildWaLink(waNumber, message);
  }

  options.forEach((opt) => opt.addEventListener('click', () => render(opt)));
}
