// Ticker 5 pintu berbagi (Makanan → Barang → Waktu → Ruang → Dana): tiap item
// (ikon berwarna identitas + label) sudah ter-render server-side sebagai tumpukan;
// di sini cukup menggilir kelas .is-active untuk memunculkan satu per satu
// (fade-slide via CSS).
const items = [...document.querySelectorAll('#pintu-ticker [data-pintu-item]')];
let index = 0;

if (items.length > 1) {
  setInterval(() => {
    items[index].classList.remove('is-active');
    index = (index + 1) % items.length;
    items[index].classList.add('is-active');
  }, 2800);
}
