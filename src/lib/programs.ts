import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { PINTU_IDS, type PintuId } from '../consts';
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
 * Satu-satunya tempat bentuk `pintu` di disk diselesaikan jadi bentuk yang
 * dilihat seluruh situs. Skema sengaja permisif (lihat content.config.ts) dan
 * di sinilah ketatnya, sama seperti `readAksi` terhadap isian Keystatic.
 *
 * Tiga hal yang ditangani, semuanya bisa benar-benar terjadi lewat CMS:
 *
 * 1. Bentuk lama satu nilai — dinaikkan jadi daftar satu elemen.
 * 2. Daftar kosong. `fields.multiselect` menulis `[]` begitu editor mencabut
 *    pilihan terakhir. Program tanpa pintu tak punya tempat tampil sama sekali,
 *    jadi dijatuhkan ke `food` sambil memperingatkan — bukan dibiarkan
 *    `undefined` menyebar ke pencarian warna dan agregasi dampak.
 * 3. `pintuUtama` menunjuk pintu yang tak ada di daftarnya. Keystatic tak bisa
 *    menyempitkan opsi satu field berdasarkan field lain, jadi ini bukan
 *    kelalaian editor melainkan celah yang memang terbuka. Angkanya jatuh ke
 *    entri pertama, karena metrik yang bersandar pada pintu yang tak dilayani
 *    program ini akan muncul di halaman yang tak pernah menyebut programnya.
 */
function resolvePintu(
  slug: string,
  raw: PintuId | PintuId[],
  utama: PintuId | null | undefined
): { pintu: PintuId[]; pintuUtama: PintuId } {
  const listed = Array.isArray(raw) ? raw : [raw];
  const pintu = listed.length > 0 ? listed : ([PINTU_IDS[0]] as PintuId[]);

  if (listed.length === 0) {
    console.warn(
      `[programs] ${slug}: tak ada pintu yang dipilih, jatuh ke "${pintu[0]}". Pilih minimal satu di Keystatic.`
    );
  }

  if (utama && !pintu.includes(utama)) {
    console.warn(
      `[programs] ${slug}: pintu utama "${utama}" tidak ada di daftar pintunya (${pintu.join(', ')}), jatuh ke "${pintu[0]}". Angka dampaknya akan dihitung di sana.`
    );
    return { pintu, pintuUtama: pintu[0] };
  }

  return { pintu, pintuUtama: utama ?? pintu[0] };
}

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
      const { pintu, pintuUtama } = resolvePintu(e.id, e.data.pintu, e.data.pintuUtama);
      return {
        slug: e.id,
        ...e.data,
        pintu,
        pintuUtama,
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
