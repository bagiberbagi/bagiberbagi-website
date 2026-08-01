import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { PintuId } from '../consts';
import { createImageResolver } from './assets';
import { getPrograms } from './programs';
import { parseVideoUrl, type JejakVideoSource } from './video';
import { parseCoordinates, type MapPoint } from './geo';

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
  date: string;
  location: string;
  summary: string;
  metrics: JejakMetric[];
  /** Sudah berupa modul gambar, siap dipakai <Image>. null = tak ada / berkas hilang. */
  cover: ImageMetadata | null;
  /** Hanya foto yang berkasnya benar-benar ada; entri kosong/hilang dibuang. */
  gallery: ImageMetadata[];
  /** null = tanpa video, atau link-nya tak dikenali (diperingatkan saat build). */
  video: JejakVideo | null;
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
      // Path string diselesaikan di sini sekali saja, jadi seluruh konsumen
      // menerima modul gambar yang siap dioptimasi dan tak ada satu pun yang
      // perlu tahu di folder mana fotonya disimpan.
      cover: resolveJejakImage(e.data.cover),
      gallery: e.data.gallery
        .map((g) => resolveJejakImage(g))
        .filter((img): img is ImageMetadata => img !== null),
      video: resolveJejakVideo(e.data.video),
      points: resolveJejakPoints(e.data.points, e.data.location),
      href: `/jejak/${e.id}/`,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
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
