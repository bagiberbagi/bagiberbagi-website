import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { PintuId } from '../consts';
import type { KetentuanItem } from './ketentuan';
import { createImageResolver } from './assets';
import defaultProgramCover from '../assets/images/program-promo.png';

export interface Program {
  slug: string;
  label: string;
  /**
   * Semua pintu yang dilayani program ini, selalu sudah berupa daftar — entri
   * YAML lama yang menulis satu nilai dinormalkan di `getPrograms`, jadi tak
   * ada konsumen yang perlu tahu bentuk mana yang ada di disk.
   *
   * Untuk "pintu-nya apa" (kartu, remah roti, warna, angka) pakai
   * `pintuUtama`, bukan elemen pertama daftar ini.
   */
  pintu: PintuId[];
  /**
   * Pintu yang memikul kartu, remah roti, dan SELURUH metrik program ini.
   * Agregasi dampak menyaring lewat field ini, tak pernah lewat keanggotaan
   * `pintu`: program yang melayani dua pintu kalau tidak begitu akan
   * menyumbangkan porsi yang sama ke dua total sekaligus.
   */
  pintuUtama: PintuId;
  order: number;
  active: boolean;
  /**
   * Foto kartu sorotan hasil unggahan Keystatic, sudah berupa modul gambar dan
   * siap dipakai `<Image>`. null = belum diunggah / berkasnya hilang, konsumen
   * memakai foto bawaan.
   */
  image: ImageMetadata | null;
  summary: string;
  /**
   * Teks slide program ini di "Panggung Bergilir" beranda. Semua field boleh
   * kosong; konsumennya yang memutuskan apa jatuhan tiap baris kosong (mis.
   * `lead` kosong = pakai `summary`).
   */
  stage: {
    kicker: string;
    lead: string;
    status: string;
    caption: string;
    ctaLabel: string;
    ctaWhatsapp: boolean;
    ctaMessage: string;
  };
  detail: {
    eyebrow: string;
    description: string;
    features: string[];
    /**
     * Ketentuan yang cuma berlaku di program ini. Digabung dengan ketentuan
     * bersama oleh `getKetentuan` (lib/ketentuan.ts), bukan dibaca langsung.
     */
    ketentuan: KetentuanItem[];
  };
  /** Terisi hanya jika program punya halaman detail (aktif + deskripsi terisi). */
  href?: string;
}

/**
 * Peta path string -> modul gambar untuk seluruh foto kartu program. Kunci glob
 * ini persis sama dengan `publicPath: '/src/assets/programs/'` di
 * keystatic.config.ts. Kalau salah satu sisi diubah, ubah keduanya bersamaan.
 * Alasan foto unggahan tinggal di `src/assets/` ada di `lib/assets.ts`.
 */
const PROGRAM_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/programs/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true }
);

/**
 * Ubah path dari entri program menjadi modul gambar. Mengembalikan null kalau
 * berkasnya tak ada; kartu beranda sudah punya foto bawaan untuk kasus itu.
 */
export const resolveProgramImage = createImageResolver('program', PROGRAM_IMAGES);

/**
 * Satu sumber kebenaran untuk semua program: kalkulator, kartu beranda,
 * mega-menu, halaman detail, dan OG image semuanya membaca dari sini —
 * bukan lagi dari array terpisah di `consts.ts`.
 */
export async function getPrograms(): Promise<Program[]> {
  const entries = await getCollection('programs');
  return entries
    .map((e) => {
      const hasPage = e.data.active && e.data.detail.description.trim() !== '';
      // Satu-satunya tempat bentuk skalar vs daftar diselesaikan. Skema sengaja
      // menerima keduanya (lihat content.config.ts); mulai dari sini ke atas
      // seluruh situs cuma melihat daftar.
      const pintu = Array.isArray(e.data.pintu) ? e.data.pintu : [e.data.pintu];
      return {
        slug: e.id,
        ...e.data,
        pintu,
        // Kosong = entri pertama. Bukan tebakan: untuk program berpintu tunggal
        // itu satu-satunya jawaban yang mungkin, dan program berpintu banyak
        // wajib menyebutkannya sendiri lewat Keystatic.
        pintuUtama: e.data.pintuUtama ?? pintu[0],
        // Path string diselesaikan di sini sekali saja, jadi seluruh konsumen
        // menerima modul gambar yang siap dioptimasi dan tak ada satu pun yang
        // perlu tahu di folder mana fotonya disimpan.
        image: resolveProgramImage(e.data.image),
        href: hasPage ? `/program/${e.id}/` : undefined,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Foto satu program, dipakai di mana pun program itu ditampilkan: kartu program
 * berjalan di hero beranda, hero halaman program, kartu sorotan, dan ajakan ke
 * program di detail jejak. Satu program karena itu selalu tampil dengan foto
 * yang sama, bukan foto bawaan yang beda-beda per komponen seperti sebelumnya.
 *
 * Sumbernya cuma dua: foto yang dipilih editor di Keystatic, lalu foto bawaan.
 * Sempat ada lapisan ketiga di tengah, yaitu cover jejak terbaru program itu,
 * dan itu dibuang: "terbaru" adalah urutan tanggal, bukan pilihan, jadi yang
 * naik jadi wajah program bisa saja foto seremonial di depan spanduk — dan
 * wajah itu ikut berubah sendiri tiap kali ada jejak baru.
 */
export function getProgramCover(program: Pick<Program, 'image'>): ImageMetadata {
  return program.image ?? defaultProgramCover;
}

/**
 * Semua program yang melayani pintu ini — termasuk yang pintu utamanya lain.
 * Keanggotaan, bukan kesamaan: itulah yang membuat satu program bisa muncul di
 * beberapa pintu tanpa dipindahkan ke mana pun.
 */
export async function getProgramsByPintu(pintu: PintuId): Promise<Program[]> {
  return (await getPrograms()).filter((p) => p.pintu.includes(pintu));
}

/** Program yang punya halaman detail sendiri — dasar route dinamis & OG image. */
export async function getProgramPages(): Promise<Program[]> {
  return (await getPrograms()).filter((p) => p.href);
}
