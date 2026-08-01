// Facade untuk iframe pihak ketiga (pemutar video, peta). Sampai tombolnya
// ditekan, yang ada di halaman cuma poster dan tombol. Iframe dibuat saat
// diklik, jadi halaman tak memuat skrip pihak ketiga, tak menaruh cookie, dan
// tak menyentuh server mereka untuk pengunjung yang tak pernah membukanya.
//
// Vanilla, tanpa dependency, seperti skrip lain di folder ini. Satu skrip untuk
// semua embed di halaman: yang membedakan cuma isi data-embed.
const facades = [...document.querySelectorAll('[data-embed-facade]')];

facades.forEach((root) => {
  const button = root.querySelector('[data-embed-play]');
  const src = root.dataset.embed;
  if (!button || !src) return;

  button.addEventListener(
    'click',
    () => {
      const frame = document.createElement('iframe');
      frame.src = src;
      frame.title = root.dataset.embedTitle || 'Konten tersemat';
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.className = 'absolute inset-0 h-full w-full border-0';
      // Ganti isi bingkai, bukan bingkainya: kelas rounded/aspect ada di root,
      // jadi iframe langsung mewarisi bentuk dan ukuran yang sama.
      root.replaceChildren(frame);
      // Fokus pindah ke iframe supaya pengguna keyboard tak terlempar ke awal
      // halaman begitu tombol yang mereka tekan hilang.
      frame.focus();
    },
    { once: true }
  );
});
