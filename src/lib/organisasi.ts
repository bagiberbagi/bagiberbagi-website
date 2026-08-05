import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { createImageResolver } from './assets';
import type { JejakMetric, JejakPhoto } from './jejak';

// jejak.ts sengaja TIDAK di-import statis: jejak.ts sudah mengimpor modul ini
// untuk memvalidasi relasi organisasi, jadi import balik akan melingkar. Fungsi
// pengaya di bawah memakai dynamic import di dalam badan async-nya, pola yang
// sama dengan impact.ts.

export interface Organisasi {
  slug: string;
  label: string;
  /**
   * Modul gambar hasil unggahan Keystatic ke `src/assets/organisasi/`, lewat
   * pipeline `astro:assets` sama seperti foto program dan jejak.
   * null = belum diunggah, dikosongkan, atau berkasnya tidak ketemu.
   */
  logo: ImageMetadata | null;
  summary: string;
  detail: { description: string; since: string; instagram?: string; website?: string };
  active: boolean;
  /** Terisi hanya jika organisasi punya halaman detail (aktif + deskripsi terisi). */
  href?: string;
}

/**
 * Satu sumber kebenaran untuk semua organisasi (donor institusional): daftar
 * `/organisasi/`, halaman detail, dan `getJejakByOrganisasi`/`getOrganisasiImpact`
 * semuanya membaca dari sini, meniru pola `getPrograms` di `programs.ts`.
 * Tanpa field `order` (tidak ada di schema); daftar diurutkan alfabet.
 */
/**
 * Peta path -> modul gambar untuk logo organisasi. Pola glob wajib literal dan
 * kuncinya harus persis sama dengan `publicPath` di keystatic.config.ts. Kalau
 * salah satu sisi diubah, ubah keduanya bersamaan.
 * Alasan unggahan tinggal di `src/assets/` ada di `lib/assets.ts`.
 */
const ORGANISASI_LOGOS = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/organisasi/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true }
);

/**
 * Ubah path dari entri organisasi menjadi modul gambar. Mengembalikan null
 * kalau berkasnya tak ada; kedua tempat yang merender logo sudah punya
 * placeholder inisial untuk kasus itu, jadi build tidak perlu gagal.
 */
export const resolveOrganisasiLogo = createImageResolver('organisasi', ORGANISASI_LOGOS);

export async function getOrganisasi(): Promise<Organisasi[]> {
  const entries = await getCollection('organisasi');
  return entries
    .map((e) => {
      const hasPage = e.data.active && e.data.detail.description.trim() !== '';
      return {
        slug: e.id,
        ...e.data,
        logo: resolveOrganisasiLogo(e.data.logo),
        href: hasPage ? `/organisasi/${e.id}/` : undefined,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'id'));
}

/** Organisasi yang punya halaman detail sendiri — dasar route dinamis & OG image. */
export async function getOrganisasiPages(): Promise<Organisasi[]> {
  return (await getOrganisasi()).filter((o) => o.href);
}

/**
 * Organisasi + ringkasan kontribusinya, untuk kartu di direktori `/organisasi/`.
 *
 * Kartu direktori perlu bukti, bukan cuma nama: berapa kegiatan, program apa
 * saja, angkanya berapa, kapan terakhir bergerak, dan beberapa foto lapangan.
 * Semua diturunkan dari jejak yang menyebut organisasi ini — tidak ada satu pun
 * angka yang ditulis tangan di sini.
 */
export interface OrganisasiEntry extends Organisasi {
  jejakCount: number;
  /** Label program yang pernah diikuti, urut kemunculan (terbaru dulu). */
  programLabels: string[];
  metrics: JejakMetric[];
  /** ISO date jejak paling awal & paling akhir. null = belum ada jejak. */
  firstDate: string | null;
  latestDate: string | null;
  /** Lokasi unik yang pernah dijangkau. */
  locations: string[];
  /**
   * Foto dari jejak organisasi ini, sudah di-dedup dan dipotong.
   *
   * URUTANNYA COVER DULU, baru isi galeri. Cover adalah foto yang dipilih editor
   * untuk mewakili satu kegiatan, jadi kolase yang disusun dari cover memajang
   * kegiatan yang berbeda-beda; kalau galeri ikut diserap lebih awal, satu
   * kegiatan bisa memenuhi seluruh kolase, dan isi galeri sering berupa foto
   * pendukung (tangkapan layar video, foto lokasi) yang tak enak berdiri sendiri
   * sebagai wajah organisasi.
   *
   * Dedup memakai identitas objek modul gambar, BUKAN `img.src`. Membaca properti
   * modul gambar di luar pipeline menandai berkas aslinya "terpakai langsung", yang
   * membuat PNG mentahnya disalin ke dist dan seluruh optimasinya hilang —
   * lihat catatan panjang soal ini di jejak/index.astro. Kuncinya `photo.img`,
   * yaitu properti pembungkus JejakPhoto, jadi modul gambarnya sendiri tak
   * pernah dibaca.
   *
   * Berupa `JejakPhoto`, bukan modul gambar telanjang, supaya alt tiap foto ikut
   * terbawa ke kolase. Sebelumnya kartu organisasi merender `alt=""` karena di
   * sini memang tak ada tempat menyimpannya.
   */
  photos: JejakPhoto[];
}

const PHOTO_LIMIT = 4;

/**
 * Direktori organisasi lengkap dengan ringkasan kontribusi tiap entri.
 *
 * Hanya organisasi ber-halaman yang masuk, sama dengan gate publish di
 * `getOrganisasiPages()`. Diurutkan dari yang paling banyak kegiatannya, lalu
 * dari yang paling baru bergerak: direktori yang mengurut alfabet membuat entri
 * paling aktif tenggelam begitu daftarnya panjang.
 */
export async function getOrganisasiDirectory(): Promise<OrganisasiEntry[]> {
  const { getJejakByOrganisasi, dedupePhotos } = await import('./jejak');
  const { getPrograms } = await import('./programs');
  const { aggregateMetrics } = await import('./impact');

  const [pages, programs] = await Promise.all([getOrganisasiPages(), getPrograms()]);
  const labelBySlug = new Map(programs.map((p) => [p.slug, p.label]));

  const entries = await Promise.all(
    pages.map(async (org): Promise<OrganisasiEntry> => {
      // Sudah urut tanggal desc dari getJejak().
      const jejak = await getJejakByOrganisasi(org.slug);
      const dates = jejak.map((j) => j.date);
      return {
        ...org,
        jejakCount: jejak.length,
        programLabels: [...new Set(jejak.map((j) => labelBySlug.get(j.program) ?? j.program))],
        metrics: aggregateMetrics(jejak.map((j) => j.metrics)),
        firstDate: dates.length ? dates[dates.length - 1] : null,
        latestDate: dates.length ? dates[0] : null,
        locations: [...new Set(jejak.map((j) => j.location).filter(Boolean))],
        photos: dedupePhotos([
          ...jejak.map((j) => j.cover),
          ...jejak.flatMap((j) => j.gallery),
        ]).slice(0, PHOTO_LIMIT),
      };
    })
  );

  return entries.sort(
    (a, b) => b.jejakCount - a.jejakCount || (b.latestDate ?? '').localeCompare(a.latestDate ?? '')
  );
}

/**
 * Agregat seluruh organisasi, untuk band angka di kepala `/organisasi/`.
 *
 * `jejakCount` di sini adalah kegiatan yang dikerjakan BERSAMA organisasi, bukan
 * total kegiatan situs — angka di halaman ini harus menjawab "seberapa besar
 * peran organisasi", jadi mencampurnya dengan jejak tanpa organisasi akan
 * menyesatkan.
 */
export async function getOrganisasiTotals(): Promise<{
  organisasiCount: number;
  jejakCount: number;
  metrics: JejakMetric[];
}> {
  const { aggregateMetrics } = await import('./impact');
  const directory = await getOrganisasiDirectory();
  return {
    organisasiCount: directory.length,
    jejakCount: directory.reduce((n, o) => n + o.jejakCount, 0),
    metrics: aggregateMetrics(directory.map((o) => o.metrics)),
  };
}

/**
 * Peta slug organisasi -> label + href, untuk atribusi di kartu/halaman jejak.
 *
 * Hanya organisasi ber-halaman yang masuk, jadi jejak yang menyebut organisasi
 * nonaktif/terhapus otomatis tak menampilkan chip apa pun ketimbang menautkan ke
 * halaman yang tidak ada.
 */
export async function getOrganisasiRefs(): Promise<
  Map<string, { label: string; href: string; logo: ImageMetadata | null }>
> {
  const pages = await getOrganisasiPages();
  return new Map(pages.map((o) => [o.slug, { label: o.label, href: o.href!, logo: o.logo }]));
}
