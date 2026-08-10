import type { PintuId } from '../consts';
import { buildWaLink } from './format';
import type { Program } from './programs';

/**
 * Pembaca koleksi `aksi`: satu berkas JSON per pintu, isinya daftar cara ikut
 * pintu itu.
 *
 * PEMBAGIAN TUGAS DENGAN SCHEMA-NYA. `src/content.config.ts` sengaja permisif,
 * berkas ini yang ketat. Alasannya bukan selera: zod di sana jalan pada waktu
 * build walaupun tak ada halaman yang membaca koleksinya, jadi satu aturan yang
 * menolak nilai yang bisa ditulis admin Keystatic berarti satu klik di CMS
 * mematikan seluruh build, tanpa ada developer di dekatnya. Sudah dibuktikan
 * dengan sengaja menulis berkas rusak waktu Track B. Jadi: apa pun yang aneh
 * masuk ke sini, keluar sebagai bentuk yang wajar plus `console.warn`, tidak
 * pernah sebagai lemparan.
 *
 * DI SINI SATU-SATUNYA TEMPAT BENTUK WIRE `fields.conditional` TERLIHAT.
 * Keystatic menulisnya sebagai `{ discriminant, value }`; `readAksi()` yang
 * memipihkannya jadi `{ kind, ... }` supaya tidak ada konsumen di hilir yang
 * perlu tahu kata "discriminant".
 *
 * Satu jebakan yang sudah diverifikasi dan gampang salah dibaca: **field yang
 * kosong itu KUNCI YANG HILANG, bukan null.** Semua serializer di
 * `@keystatic/core@0.5.51` mengembalikan `{ value: undefined }` untuk keadaan
 * kosongnya, dan `undefined` lenyap begitu ditulis sebagai JSON. Yang
 * mengembalikan `null` itu reader-nya, sesudah mengisi default. Jadi
 * pemeriksaan `x === null` di sini akan meleset dari semua kasus nyata; yang
 * dipakai `??` dan pemeriksaan tipe.
 *
 * Berkas ini murni dan tidak mengimpor `astro:content` di level modul, alasan
 * yang sama dengan `impact.ts` yang mengimpor `jejak.ts` malas di dalam fungsi
 * async-nya: `readAksi` ikut diuji `bun test` bersama `format.ts` dan
 * `aggregateMetrics`, dan `astro:content` cuma ada di dalam runtime Astro.
 */

export type AksiMechanism =
  | { kind: 'none' }
  | { kind: 'conversation'; message: string }
  | {
      kind: 'quantity';
      unit: string;
      pricePerUnit: number;
      presets: number[];
      packages: string[];
    };

export interface Aksi {
  pintu: PintuId;
  title: string;
  desc: string;
  /** Program yang sudah diselesaikan, tak pernah berupa slug. null = rujukannya basi atau memang kosong. */
  program: Program | null;
  showOnPintu: boolean;
  mechanism: AksiMechanism;
}

/** Bentuk mentah satu item, persis seperti yang ditulis Keystatic ke disk. */
export interface RawAksiItem {
  title?: string | null;
  desc?: string | null;
  program?: string | null;
  showOnPintu?: boolean;
  mechanism: {
    discriminant: string;
    value?: unknown;
  };
}

const DEFAULT_UNIT = 'porsi';

/** Satuan kosong jatuh ke 'porsi'. Belum dibaca siapa pun — lihat catatan di bawah. */
function normaliseUnit(unit: unknown): string {
  return typeof unit === 'string' && unit.trim() !== '' ? unit.trim() : DEFAULT_UNIT;
}

/** Buang yang bukan angka positif; sisanya urut apa adanya, urutan editor yang menentukan. */
function normalisePresets(presets: unknown): number[] {
  if (!Array.isArray(presets)) return [];
  return presets.filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0);
}

function normalisePackages(packages: unknown): string[] {
  if (!Array.isArray(packages)) return [];
  return packages
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

/**
 * Pesan jatuhan untuk aksi yang mekanismenya rusak. Kalimatnya sama persis
 * dengan yang sudah dipakai halaman program hari ini, jadi turunnya ke sini
 * menghasilkan tautan yang sudah dikenal tim, bukan kalimat baru yang muncul
 * entah dari mana.
 */
function fallbackMessage(programLabel: string): string {
  return `Halo, saya ingin mendiskusikan program ${programLabel}.`;
}

/**
 * Ubah daftar mentah satu pintu jadi `Aksi[]`. MURNI: tidak menyentuh
 * `astro:content`, program yang sudah diselesaikan diserahkan lewat `bySlug`.
 *
 * Rujukan program yang basi diperlakukan sama seperti `getProgramSection()` di
 * `home.ts`: slug kosong dan slug yang tak menunjuk apa pun dibuang jadi `null`.
 * Bedanya satu, dan disengaja: di sana seluruh entri ikut dibuang, di sini
 * aksinya tetap hidup dengan judul dan deskripsinya, cuma kehilangan tujuan
 * mekanismenya. Sebuah cara ikut tetap benar sebagai kalimat walaupun program
 * yang menjalankannya sudah dihapus.
 */
export function readAksi(
  pintu: PintuId,
  items: RawAksiItem[],
  bySlug: Map<string, Program>
): Aksi[] {
  return items.map((item) => {
    const title = (item.title ?? '').trim();
    const slug = (item.program ?? '').trim();
    const program = slug ? (bySlug.get(slug) ?? null) : null;

    if (slug && !program) {
      console.warn(
        `[aksi] ${pintu}: aksi "${title}" menunjuk program "${slug}" yang tidak ada. Tombolnya tidak dirender.`
      );
    }

    return {
      pintu,
      title,
      desc: (item.desc ?? '').trim(),
      program,
      showOnPintu: item.showOnPintu ?? true,
      mechanism: readMechanism(pintu, title, item.mechanism, program),
    };
  });
}

function readMechanism(
  pintu: PintuId,
  title: string,
  raw: RawAksiItem['mechanism'],
  program: Program | null
): AksiMechanism {
  const value = (raw?.value ?? {}) as Record<string, unknown>;

  switch (raw?.discriminant) {
    case 'conversation': {
      const message = typeof value.message === 'string' ? value.message.trim() : '';
      return { kind: 'conversation', message };
    }

    case 'quantity': {
      const pricePerUnit = typeof value.pricePerUnit === 'number' ? value.pricePerUnit : 0;

      // Harga tak masuk akal menjatuhkan mekanismenya ke percakapan, bukan
      // menjatuhkan halamannya. Tautan WhatsApp-nya tetap jalan; yang hilang
      // cuma pemilih porsinya, dan itu memang yang butuh harga.
      if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
        console.warn(
          `[aksi] ${pintu}: aksi "${title}" mekanismenya "pilih jumlah" tapi harga per satuannya ${pricePerUnit}. Turun jadi percakapan biasa.`
        );
        return { kind: 'conversation', message: fallbackMessage(program?.label ?? title) };
      }

      const presets = normalisePresets(value.presets);
      if (presets.length === 0) {
        // Sengaja TIDAK diisi [6, 12, 20]. Default tersembunyi itu sumber
        // kebenaran kedua, sekelas dengan `|| '25000'` yang dibuang Track F.
        // Kartu tanpa pilihan cepat tetap kartu yang sah: stepper "Lainnya"
        // berdiri sendiri.
        console.warn(
          `[aksi] ${pintu}: aksi "${title}" belum punya pilihan cepat. Kartunya cuma menampilkan stepper.`
        );
      }

      return {
        kind: 'quantity',
        unit: normaliseUnit(value.unit),
        pricePerUnit,
        presets,
        packages: normalisePackages(value.packages),
      };
    }

    default:
      return { kind: 'none' };
  }
}

/**
 * Tujuan tombol SATU aksi di halaman pintu. Ini bukan hal yang sama dengan CTA
 * kartu donasi: di halaman pintu, aksi ber-mekanisme "pilih jumlah" tidak
 * membuka WhatsApp, ia melempar ke kartu donasi di halaman programnya.
 *
 * null berarti tak ada tombol yang dirender.
 */
export function resolvePintuHref(aksi: Aksi, waNumber: string): string | null {
  switch (aksi.mechanism.kind) {
    case 'none':
      return null;

    case 'conversation':
      return aksi.mechanism.message ? buildWaLink(waNumber, aksi.mechanism.message) : null;

    case 'quantity': {
      if (!aksi.program) {
        console.warn(
          `[aksi] ${aksi.pintu}: aksi "${aksi.title}" butuh program untuk mekanisme "pilih jumlah", tapi tak ada yang terpasang.`
        );
        return null;
      }

      // `programs.ts` hanya mengisi `href` kalau programnya punya halaman
      // sendiri (aktif + deskripsi terisi), sedangkan pemilih relasi di
      // Keystatic mendaftar SEMUA program. Tanpa penjagaan ini, memasang aksi
      // ke program tak aktif mencetak string harfiah "undefined#donasi" di
      // halaman pintu yang tayang.
      if (!aksi.program.href) {
        console.warn(
          `[aksi] ${aksi.pintu}: aksi "${aksi.title}" menunjuk program "${aksi.program.slug}" yang belum punya halaman sendiri, jadi tak ada tempat untuk dituju.`
        );
        return null;
      }

      return `${aksi.program.href}#donasi`;
    }
  }
}

/**
 * Daftar aksi satu pintu, program sudah diselesaikan.
 *
 * `astro:content` dan `programs.ts` diimpor malas di dalam fungsi, bukan di
 * kepala berkas, supaya `readAksi` dan `resolvePintuHref` di atas tetap bisa
 * diuji tanpa runtime Astro.
 */
export async function getAksiByPintu(pintu: PintuId): Promise<Aksi[]> {
  const { getEntry } = await import('astro:content');
  const { getPrograms } = await import('./programs');

  const entry = await getEntry('aksi', pintu);
  if (!entry) return [];

  const bySlug = new Map((await getPrograms()).map((p) => [p.slug, p]));
  return readAksi(pintu, entry.data.items as RawAksiItem[], bySlug);
}

/**
 * Semua aksi yang menunjuk satu program, lintas pintu. Lintas pintu karena
 * `aksi.program` tidak dipaksa sepintu dengan berkas yang memuatnya, dan
 * memaksanya di sini berarti diam-diam menyembunyikan aksi yang sudah ditulis
 * editor.
 */
export async function getAksiForProgram(slug: string): Promise<Aksi[]> {
  const { getCollection } = await import('astro:content');
  const { getPrograms } = await import('./programs');
  const { PINTU_IDS } = await import('../consts');

  const entries = await getCollection('aksi');
  const bySlug = new Map((await getPrograms()).map((p) => [p.slug, p]));

  return entries.flatMap((entry) => {
    // Id berkasnya adalah id pintu. Berkas yang namanya bukan pintu mana pun
    // dilewati, bukan dipaksa masuk: Keystatic tak bisa membuatnya, tapi
    // seseorang bisa saja menambahkannya lewat git.
    const pintu = PINTU_IDS.find((id) => id === entry.id);
    if (!pintu) {
      console.warn(`[aksi] berkas "${entry.id}.json" bukan salah satu pintu, dilewati.`);
      return [];
    }
    return readAksi(pintu, entry.data.items as RawAksiItem[], bySlug).filter(
      (a) => a.program?.slug === slug
    );
  });
}
