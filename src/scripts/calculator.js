import { calcTotal, formatRupiah, buildWaLink, buildDonationMessage } from '../lib/format';

const select = document.getElementById('program-select');
const paxCount = document.getElementById('pax-count');
const incBtn = document.getElementById('pax-inc');
const decBtn = document.getElementById('pax-dec');
const totalDisplay = document.getElementById('total-display');
const waLink = document.getElementById('wa-donation-link');

let pax = 10;

function render() {
  const total = calcTotal(pax);
  const totalFormatted = formatRupiah(total);
  paxCount.textContent = String(pax);
  totalDisplay.textContent = totalFormatted;
  const message = buildDonationMessage(select.value, pax, totalFormatted);
  waLink.href = buildWaLink(waLink.dataset.waNumber, message);
}

if (select && paxCount && incBtn && decBtn && totalDisplay && waLink) {
  incBtn.addEventListener('click', () => {
    pax = Math.min(999, pax + 1);
    render();
  });
  decBtn.addEventListener('click', () => {
    pax = Math.max(1, pax - 1);
    render();
  });
  select.addEventListener('change', render);
  render();
}
