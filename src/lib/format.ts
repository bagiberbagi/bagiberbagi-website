export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Format nilai metrik jejak untuk ditampilkan. Metrik berlabel dana/donasi
 * ditampilkan sebagai Rupiah; selain itu angka biasa berpemisah ribuan.
 * Satu sumber supaya kartu beranda, halaman pintu, program, dan detail jejak
 * konsisten (dulu logika ini ter-duplikat dan sempat terlewat di beranda).
 */
export function formatMetric(metric: { label: string; value: number }): string {
  return /dana|rupiah|donasi/i.test(metric.label)
    ? formatRupiah(metric.value)
    : metric.value.toLocaleString('id-ID');
}

/**
 * Alt foto dokumentasi jejak. Satu sumber untuk kartu feed, foto utama detail,
 * dan carousel-nya, supaya ketiganya tak menjawab pertanyaan yang sama dengan
 * konvensi berbeda.
 *
 * Sebelumnya kartu dan carousel memakai `alt=""`. Untuk gambar hiasan itu
 * benar, tapi foto lapangan justru bukti yang jadi seluruh argumen situs ini,
 * jadi alt kosong menyembunyikannya sekaligus dari Google Images dan dari
 * pembaca layar.
 *
 * Judul dipakai apa adanya, cuma diberi awalan: judul jejak sudah memuat
 * program, tempat, dan kota ("Jumat Berkah di Masjid Nurul Hikmah, Bogor"),
 * jadi menambahkan `location` di belakangnya justru mengulang kotanya dua kali
 * (`location` entri itu "Baranangsiang, Bogor"). Awalan "Dokumentasi" sengaja
 * netral: kita tak punya keterangan per foto, dan menebak isinya ("penyaluran
 * ke panti") berisiko meleset dari yang benar-benar tampak di gambar.
 *
 * `index` adalah nomor foto di dalam jejaknya, dihitung menerus dari cover ke
 * galeri. Wajib, karena satu jejak hampir selalu punya lebih dari satu foto dan
 * alt yang identik di satu halaman tak menerangkan apa pun.
 */
export function jejakPhotoAlt(title: string, index: number): string {
  return `Dokumentasi ${title}, foto ${index}`;
}

export function calcTotal(pax: number): number {
  return pax * 25000;
}

export function buildWaLink(waNumber: string, text?: string): string {
  if (!text) return `https://wa.me/${waNumber}`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * `packageName` opsional: untuk program self-serve berpaket lebih dari satu
 * (mis. Ramadhan Berbagi: Sahur/Takjil/Buka Puasa), paket yang dipilih ikut
 * disebut di pesan supaya tim tak perlu menanyakan ulang lewat WhatsApp.
 * Program dengan satu paket (Jumat Berkah) tetap tanpa embel-embel ini.
 */
export function buildDonationMessage(
  program: string,
  pax: number,
  totalFormatted: string,
  packageName?: string
): string {
  const programLabel = packageName ? `${program} (Paket ${packageName})` : program;
  return `Halo, saya ingin donasi program "${programLabel}" untuk ${pax} pax (Total: ${totalFormatted}).`;
}

export function formatProgramOptionLabel(opt: { label: string; active: boolean }): string {
  return opt.active ? opt.label : `${opt.label} (Segera Hadir)`;
}
