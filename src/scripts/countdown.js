// Hitung mundur ke Jumat Berkah berikutnya (Jumat pukul 06:00 waktu lokal).
// Mengisi #jb-countdown dengan format "X hari Y jam Z mnt W dtk" dan diperbarui
// tiap detik. Vanilla, tanpa dependensi.
const el = document.getElementById('jb-countdown');

if (el) {
  const TARGET_HOUR = 6; // Jumat 06:00 lokal

  // Waktu Jumat 06:00 terdekat yang masih di depan "now".
  function nextFriday(now) {
    const target = new Date(now);
    target.setHours(TARGET_HOUR, 0, 0, 0);
    // getDay(): 0=Minggu … 5=Jumat. Selisih hari ke Jumat berikutnya.
    let daysAhead = (5 - target.getDay() + 7) % 7;
    target.setDate(target.getDate() + daysAhead);
    // Kalau sudah lewat Jumat 06:00 minggu ini, lompat ke Jumat depan.
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 7);
    }
    return target;
  }

  function render() {
    const now = new Date();
    let diff = nextFriday(now).getTime() - now.getTime();
    if (diff < 0) diff = 0;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    el.textContent = `${days} hari ${hours} jam ${minutes} mnt ${seconds} dtk`;
  }

  render();
  setInterval(render, 1000);
}
