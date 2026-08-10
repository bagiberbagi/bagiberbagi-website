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

/**
 * Total donasi untuk sejumlah pax.
 *
 * `pricePerUnit` WAJIB, sengaja tanpa nilai bawaan. Harganya milik program,
 * bukan milik situs, jadi sebuah default di sini akan menghidupkan kembali
 * angka 25000 sebagai jatuhan diam-diam — sumber kebenaran kedua, yang justru
 * jadi alasan seluruh perubahan ini ada.
 */
export function calcTotal(pax: number, pricePerUnit: number): number {
  return pax * pricePerUnit;
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
 *
 * `askPackage` menutup keadaan yang muncul begitu paket tak lagi punya default:
 * pengunjung sudah menentukan jumlah porsi tapi belum menyentuh baris paket.
 * Tanpa ini pesannya berangkat menyebut jumlah tanpa menyebut paket sama sekali,
 * dan tim menerima "12 pax Ramadhan Berbagi" tanpa tahu Sahur atau Buka Puasa.
 * Bedanya dengan sekadar diam: pesannya menyatakan sendiri apa yang masih
 * kurang, jadi percakapan mulai dari pertanyaan yang benar.
 *
 * Program sepaket tunggal tak pernah mengirimkannya — tidak ada yang bisa
 * ditanyakan — jadi pesan Jumat Berkah tidak berubah satu karakter pun.
 */
export function buildDonationMessage(
  program: string,
  pax: number,
  totalFormatted: string,
  packageName?: string,
  askPackage = false
): string {
  const programLabel = packageName ? `${program} (Paket ${packageName})` : program;
  const base = `Halo, saya ingin donasi program "${programLabel}" untuk ${pax} pax (Total: ${totalFormatted}).`;
  return askPackage ? `${base} Boleh dibantu untuk pilihan paketnya?` : base;
}

export function formatProgramOptionLabel(opt: { label: string; active: boolean }): string {
  return opt.active ? opt.label : `${opt.label} (Segera Hadir)`;
}
