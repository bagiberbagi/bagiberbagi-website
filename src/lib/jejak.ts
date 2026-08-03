import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { PintuId } from '../consts';
import { createImageResolver } from './assets';
import { jejakPhotoAlt } from './format';
import { getPrograms } from './programs';
import { getOrganisasiPages } from './organisasi';
import { parseVideoUrl, type JejakVideoSource } from './video';
import { parseCoordinates, type MapPoint } from './geo';

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

export interface JejakMetric {
  label: string;
  value: number;
}

export interface JejakVideo {
  /** Sudah dibaca bentuknya; konsumen tak perlu menyentuh URL mentahnya lagi. */
  source: JejakVideoSource;
  /** Poster khusus video. null = pemanggil pakai cover jejak sebagai gantinya. */
  poster: ImageMetadata | null;
  caption: string;
  orientation: 'landscape' | 'portrait';
}

export interface Jejak {
  slug: string;
  title: string;
  program: string;
  /**
   * Slug organisasi (donor institusional) opsional, lateral terhadap `program`.
   * Tidak difilter di sini terhadap organisasi yatim/inactive — jejak ini tetap
   * tampil normal di agregasi program/pintu; penyaringannya baru terjadi di
   * `getJejakByOrganisasi` karena organisasi cuma lapisan tambahan, bukan
   * syarat jejak valid (lihat design.md risiko "relasi yatim").
   */
  organisasi: string | null;
  date: string;
  location: string;
  summary: string;
  metrics: JejakMetric[];
  /** Siap dipakai <Image> berikut alt-nya. null = tak ada / berkas hilang. */
  cover: JejakPhoto | null;
  /** Hanya foto yang berkasnya benar-benar ada; entri kosong/hilang dibuang. */
  gallery: JejakPhoto[];
  /** null = tanpa video, atau link-nya tak dikenali (diperingatkan saat build). */
  video: JejakVideo | null;
  /**
   * Path unggahan manual (`public/uploads/jejak-reports/...`), disajikan apa
   * adanya sebagai tautan unduh. null = tak ada laporan (design.md keputusan #6).
   */
  reportPdf: string | null;
  /** Titik peta yang koordinatnya terbaca. Kosong = halaman tanpa peta. */
  points: MapPoint[];
  published: boolean;
  href: string;
}

/**
 * Peta path string -> modul gambar untuk seluruh foto jejak. Pola glob wajib
 * literal, jadi tiap domain konten memanggil globnya sendiri lalu menyerahkan
 * hasilnya ke `createImageResolver` (lihat `lib/assets.ts` untuk alasan foto
 * unggahan tinggal di `src/assets/`, bukan `public/`).
 *
 * Kunci glob ini persis sama dengan `publicPath: '/src/assets/jejak/'` di
 * keystatic.config.ts. Kalau salah satu sisi diubah, ubah keduanya bersamaan.
 */
const JEJAK_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/jejak/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true }
);

/**
 * Ubah path dari frontmatter menjadi modul gambar. Mengembalikan null kalau
 * berkasnya tak ada di `src/assets/jejak/`; konsumen sudah punya placeholder
 * ikon pintu untuk kasus itu.
 */
export const resolveJejakImage = createImageResolver('jejak', JEJAK_IMAGES);

/** Bentuk mentah satu foto di frontmatter, sebelum path-nya diselesaikan. */
type RawJejakPhoto = { image?: string | null; alt?: string; caption?: string } | null | undefined;

/**
 * Susun cover + galeri sekaligus, karena penomoran alt cadangannya berjalan
 * menerus dari cover ke galeri: cover jadi "foto 1", galeri melanjutkannya.
 *
 * Nomor dihitung SETELAH foto yang berkasnya hilang dibuang, supaya urutannya
 * tak pernah bolong ("foto 1, foto 3") gara-gara satu berkas terhapus.
 *
 * Nomor mengikuti posisi foto di dalam jejaknya, bukan posisi di halaman yang
 * menampilkannya. Satu foto karena itu membawa alt yang sama di mana pun ia
 * muncul, termasuk di galeri gabungan /jejak/ yang mencampur foto lintas jejak.
 */
function resolveJejakPhotos(
  rawCover: RawJejakPhoto,
  rawGallery: RawJejakPhoto[],
  title: string
): { cover: JejakPhoto | null; gallery: JejakPhoto[] } {
  const resolved = [rawCover, ...rawGallery]
    .map((raw) => ({ raw, img: resolveJejakImage(raw?.image) }))
    .filter((x): x is { raw: RawJejakPhoto; img: ImageMetadata } => x.img !== null)
    .map(({ raw, img }, i) => ({
      img,
      // Alt tulisan editor menang; yang kosong jatuh ke turunan judul jejak.
      // Itu tebakan terbaik dari data yang ada, bukan keterangan sungguhan,
      // tapi jauh lebih berguna daripada string kosong yang dulu ada di sini.
      alt: raw?.alt?.trim() || jejakPhotoAlt(title, i + 1),
      caption: raw?.caption?.trim() || null,
    }));

  // Cover hilang berarti elemen pertama `resolved` adalah foto galeri, bukan
  // cover: `filter` di atas membuang lubangnya, jadi posisi tak bisa dipakai
  // untuk menebak. Berkas cover-nya sendiri yang menentukan.
  const hasCover = resolveJejakImage(rawCover?.image) !== null;
  return {
    cover: hasCover ? resolved[0] : null,
    gallery: hasCover ? resolved.slice(1) : resolved,
  };
}

/**
 * Ubah blok video di frontmatter menjadi bentuk siap render. Link yang tak
 * dikenali diperlakukan sama seperti foto yang berkasnya hilang: entri tetap
 * terbit tanpa video, dan build menulis peringatan supaya ketahuan saat deploy
 * alih-alih menjatuhkan seluruh situs karena satu link salah tempel.
 */
const videoWarned = new Set<string>();

function resolveJejakVideo(video: {
  url: string;
  poster?: string | null;
  caption: string;
  orientation: 'landscape' | 'portrait';
}): JejakVideo | null {
  const source = parseVideoUrl(video.url);
  if (!source) {
    const raw = video.url.trim();
    if (raw && !videoWarned.has(raw)) {
      videoWarned.add(raw);
      console.warn(`[jejak] link video tidak dikenali, video dilewati: ${raw}`);
    }
    return null;
  }
  return {
    source,
    poster: resolveJejakImage(video.poster),
    caption: video.caption.trim(),
    orientation: video.orientation,
  };
}

/**
 * Sama seperti video: isian yang tak terbaca tak menggagalkan build, cuma
 * menghilangkan petanya dan meninggalkan peringatan supaya ketahuan saat deploy.
 */
const coordsWarned = new Set<string>();

function resolveJejakPoints(
  raw: { label: string; coordinates: string }[],
  fallbackLabel: string
): MapPoint[] {
  return raw.flatMap((entry, i) => {
    const point = parseCoordinates(entry.coordinates);
    if (!point) {
      const text = entry.coordinates.trim();
      if (text && !coordsWarned.has(text)) {
        coordsWarned.add(text);
        console.warn(`[jejak] titik peta tidak terbaca, dilewati: ${text}`);
      }
      return [];
    }
    // Nama titik boleh kosong: satu titik memakai nama lokasi jejaknya, dan
    // beberapa titik jatuh ke penomoran supaya daftar dan marker tetap cocok.
    const label = entry.label.trim() || (raw.length === 1 ? fallbackLabel : `Titik ${i + 1}`);
    return [{ ...point, label }];
  });
}

/**
 * Satu sumber kebenaran untuk semua jejak — kartu beranda, halaman rekam jejak
 * per pintu, halaman program, route detail, dan agregasi dampak semuanya
 * membaca dari sini. Konsumen tak boleh memanggil getCollection('jejak')
 * langsung.
 *
 * Hanya jejak `published` yang program-nya masih valid (ada di getPrograms())
 * yang lolos: relasi yatim (program terhapus/di-rename) dikeluarkan agar tak
 * menghasilkan halaman atau angka dampak yatim. Terurut tanggal desc.
 */
export async function getJejak(): Promise<Jejak[]> {
  const [entries, programs] = await Promise.all([getCollection('jejak'), getPrograms()]);
  const validSlugs = new Set(programs.map((p) => p.slug));
  return entries
    .filter((e) => e.data.published && validSlugs.has(e.data.program))
    .map((e) => ({
      slug: e.id,
      ...e.data,
      organisasi: e.data.organisasi ?? null,
      reportPdf: e.data.reportPdf ?? null,
      // Path string diselesaikan di sini sekali saja, jadi seluruh konsumen
      // menerima modul gambar yang siap dioptimasi dan tak ada satu pun yang
      // perlu tahu di folder mana fotonya disimpan.
      ...resolveJejakPhotos(e.data.cover, e.data.gallery, e.data.title),
      video: resolveJejakVideo(e.data.video),
      points: resolveJejakPoints(e.data.points, e.data.location),
      href: `/jejak/${e.id}/`,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * Susunan media satu jejak: mana yang jadi pembuka, mana yang turun ke carousel,
 * dan mana yang bisa diperbesar.
 *
 * Ada di sini, bukan di halaman detail, karena sitemap gambar butuh jawaban yang
 * sama persis. Waktu perhitungan ini masih di halaman, endpoint sitemap
 * menghitungnya sendiri dan menghasilkan URL berbeda untuk cover yang ternyata
 * dipakai sebagai poster video, jadi sitemap menunjuk berkas yang tak ada di
 * halaman mana pun sekaligus menambah berkas kembar di dist.
 */
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

export interface JejakMedia {
  /** Video yang bisa diputar di tempat; berhak atas slot pembuka. */
  videoPlayer: JejakVideo | null;
  /** Video yang cuma bisa dibuka di situs lain; tampil sebagai tautan di bawah. */
  videoLink: JejakVideo | null;
  /** Foto pembuka. null saat slot itu diambil video. */
  heroPhoto: JejakPhoto | null;
  /** Modul gambar yang tampil sebagai poster video, kalau ada. */
  posterImg: ImageMetadata | null;
  carousel: JejakPhoto[];
  /**
   * Foto yang bisa dibuka lightbox, urut seperti tampil di halaman. Poster video
   * tak termasuk: kliknya memutar video, bukan memperbesar foto.
   */
  clickable: JejakPhoto[];
}

export function getJejakMedia(jejak: Jejak): JejakMedia {
  const video = jejak.video;
  const all = dedupePhotos([jejak.cover, ...jejak.gallery]);

  // Hanya video yang benar-benar bisa diputar di tempat yang berhak atas slot
  // utama. Link yang cuma bisa dibuka di situs lain (folder Drive, Instagram)
  // tetap ditampilkan, tapi di bawah sebagai tautan, dan fotonya yang jadi
  // pembuka seperti biasa.
  const videoPlayer = video && video.source.kind !== 'link' ? video : null;
  const videoLink = video && video.source.kind === 'link' ? video : null;

  const heroPhoto = videoPlayer ? null : (all[0] ?? null);
  // Poster video default-nya cover jejak. Foto yang sudah tampil sebagai poster
  // tak diulang lagi di carousel, persis seperti gambar besar yang tak ikut turun.
  // Perbandingannya di level modul gambar: poster bisa datang dari `video.poster`
  // yang memang cuma berupa modul, jadi membandingkan pembungkus JejakPhoto tak
  // akan pernah cocok dan foto poster akan muncul dua kali.
  const posterImg = videoPlayer ? (videoPlayer.poster ?? jejak.cover?.img ?? null) : null;
  const carousel = all.filter((p) => p !== heroPhoto && p.img !== posterImg);

  return {
    videoPlayer,
    videoLink,
    heroPhoto,
    posterImg,
    carousel,
    clickable: heroPhoto ? [heroPhoto, ...carousel] : carousel,
  };
}

/** Jejak dari satu program tertentu. */
export async function getJejakByProgram(programSlug: string): Promise<Jejak[]> {
  return (await getJejak()).filter((j) => j.program === programSlug);
}

/**
 * Jejak yang program-nya bernaung di pintu tertentu. Muat programs sekali,
 * buat map slug→pintu, lalu saring jejak lewatnya (join di memori, dataset
 * kecil saat build).
 */
export async function getJejakByPintu(pintuId: PintuId): Promise<Jejak[]> {
  const programs = await getPrograms();
  const pintuBySlug = new Map(programs.map((p) => [p.slug, p.pintu]));
  return (await getJejak()).filter((j) => pintuBySlug.get(j.program) === pintuId);
}

/** Jejak yang punya halaman detail — dasar route dinamis & OG image. */
export async function getJejakPages(): Promise<Jejak[]> {
  return getJejak();
}

/**
 * Jejak yang menyebut organisasi tertentu, lintas program apa pun. Validasi
 * terhadap organisasi ber-halaman (aktif + deskripsi terisi) dulu — bukan
 * cuma "ada di collection" seperti `getJejak()` menyaring program, sebab
 * organisasi yang di-nonaktifkan seharusnya tak lagi kebagian agregasi
 * dampak (lihat design.md risiko "relasi yatim").
 */
export async function getJejakByOrganisasi(organisasiSlug: string): Promise<Jejak[]> {
  const validSlugs = new Set((await getOrganisasiPages()).map((o) => o.slug));
  if (!validSlugs.has(organisasiSlug)) return [];
  return (await getJejak()).filter((j) => j.organisasi === organisasiSlug);
}
