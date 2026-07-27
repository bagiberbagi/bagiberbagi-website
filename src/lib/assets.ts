import type { ImageMetadata } from 'astro';

type ImageModules = Record<string, { default: ImageMetadata }>;

/**
 * Pembuat penyelesai path gambar unggahan Keystatic.
 *
 * Semua gambar yang diunggah editor tinggal di `src/assets/`, bukan `public/`:
 * cuma berkas di dalam `src/` yang lewat pipeline `astro:assets` (dikonversi ke
 * webp, dibuatkan beberapa lebar, dan dimensi aslinya terbaca sehingga `<Image>`
 * bisa menulis width/height). Berkas di `public/` disajikan mentah apa adanya,
 * dan foto dari kamera ponsel yang satu sampai dua megabyte per keping membuat
 * halaman membengkak begitu editor menambah konten.
 *
 * Keystatic menyimpan nilai field gambar sebagai string biasa, jadi string itu
 * perlu dipetakan balik ke modul gambar. `import.meta.glob` eager mengerjakannya
 * saat build: kuncinya adalah path absolut dari root proyek, persis sama dengan
 * yang ditulis Keystatic lewat `publicPath`. Kalau salah satu sisi diubah, ubah
 * keduanya bersamaan.
 *
 * Sengaja tidak melempar error. Entri konten dan berkas fotonya bisa lepas
 * sinkron di luar kendali kode ini: editor menghapus berkas lewat Git,
 * frontmatter lama menunjuk path yang sudah dipindah, atau nama berkas diubah
 * manual. Kalau kasus itu menggagalkan build, satu foto hilang mematikan seluruh
 * situs. Yang benar: entrinya tetap terbit dengan foto bawaan/placeholder, dan
 * build menulis peringatan supaya ketahuan saat deploy.
 *
 * @param domain Nama domain konten, cuma dipakai sebagai awalan pesan peringatan.
 * @param modules Hasil `import.meta.glob` eager. Polanya wajib literal, jadi
 *   tiap domain memanggil glob-nya sendiri lalu menyerahkannya ke sini.
 */
export function createImageResolver(domain: string, modules: ImageModules) {
  // Satu peringatan per path, bukan per pemakaian: foto yang sama bisa dipakai
  // beberapa entri dan beberapa halaman sekaligus.
  const missingWarned = new Set<string>();

  return function resolveImage(path?: string | null): ImageMetadata | null {
    if (!path) return null;
    const mod = modules[path];
    if (!mod) {
      if (!missingWarned.has(path)) {
        missingWarned.add(path);
        console.warn(`[${domain}] foto tidak ditemukan, dilewati: ${path}`);
      }
      return null;
    }
    return mod.default;
  };
}
