import type { ImageMetadata } from 'astro';

/**
 * Bentuk foto jejak dan aturan dedupnya, dipisah dari `jejak.ts` supaya bisa
 * diuji.
 *
 * `jejak.ts` mengimpor `astro:content` di baris pertamanya, dan modul itu cuma
 * ada di dalam runtime Astro. Apa pun yang tinggal serumah dengannya karena itu
 * tak bisa diimpor `bun test`, betapa pun murninya fungsi itu. Pemisahan yang
 * sama sudah dipakai `impact.ts`, yang mengimpor `jejak.ts` secara malas di
 * dalam fungsi async justru supaya `aggregateMetrics` tetap bisa diuji.
 *
 * `jejak.ts` mengekspor ulang keduanya, jadi tak ada pemanggil yang berubah.
 */

/**
 * Foto jejak yang sudah siap dirender: berkasnya, alt yang PASTI terisi, dan
 * caption yang boleh kosong.
 *
 * `alt` sengaja tak pernah bertipe `string | null`. Semua alt kosong di situs
 * ini lahir dari sana: `<Image>` menolak alt undefined, jadi setiap pemakai
 * yang tak punya data terpaksa menulis `alt=""`, dan string kosong lolos
 * begitu saja. Dengan alt dijamin terisi di lapis pembacaan, tak ada lagi
 * pemanggil yang perlu mengarang nilai.
 *
 * `caption` sebaliknya nullable, karena ia memang boleh tak ada: caption
 * dibaca pengunjung yang melihat fotonya, jadi caption karangan lebih buruk
 * daripada tak ada caption sama sekali.
 */
export interface JejakPhoto {
  img: ImageMetadata;
  alt: string;
  caption: string | null;
}

/**
 * Buang foto kembar dari sederet foto, PEMAKAI PERTAMA YANG MENANG, dan entri
 * kosong ikut terbuang.
 *
 * "Pertama menang" bukan detail sepele. Satu berkas boleh dipasang sebagai cover
 * sekaligus muncul di galeri, dan sesudah ada `alt`/`caption` per foto, kedua
 * entri itu bisa membawa keterangan berbeda. `new Map(pasangan)` menyimpan nilai
 * entri TERAKHIR untuk kunci yang sama sambil mempertahankan posisi entri
 * pertama, jadi foto pembuka akan tampil di posisinya sendiri tapi memakai
 * keterangan milik entri galeri — biasanya kosong, sehingga alt tulisan editor
 * di cover hilang tanpa suara.
 *
 * Perbandingannya lewat identitas modul gambar (`photo.img` sebagai kunci Set),
 * bukan `img.src`. Membaca properti modul gambar di luar pipeline menandai
 * berkas aslinya "terpakai langsung" dan menyalin berkas mentahnya ke dist.
 * `photo.img` sendiri aman: itu properti pembungkus JejakPhoto, bukan pembacaan
 * pada modul gambarnya.
 */
export function dedupePhotos(photos: (JejakPhoto | null | undefined)[]): JejakPhoto[] {
  const seen = new Set<ImageMetadata>();
  const out: JejakPhoto[] = [];
  for (const photo of photos) {
    if (!photo || seen.has(photo.img)) continue;
    seen.add(photo.img);
    out.push(photo);
  }
  return out;
}
