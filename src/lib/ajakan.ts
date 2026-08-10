import { getAksiForProgram, type Aksi } from './aksi';
import type { Program } from './programs';

/**
 * Satu ajakan siap pasang: semua yang dibutuhkan kartu donasi untuk satu
 * program, dikumpulkan di satu tempat supaya kedua tempat pemasangannya (hero
 * beranda dan halaman program) tidak lagi menghitung sendiri-sendiri hal yang
 * sama dengan aturan yang perlahan berbeda.
 *
 * Yang SENGAJA TIDAK ada di sini, dan alasannya, karena keduanya pernah nyaris
 * ikut masuk:
 *
 * - **`cover`.** Hero mengoper foto, halaman program sengaja tidak, dan justru
 *   ketiadaan foto itu yang memilih panel rata lewat
 *   `class:list={['dcard', !photo && 'is-flat', …]}` di `Ajakan.astro`.
 *   Menaruh `cover` di sini berarti setiap halaman program tiba-tiba tumbuh
 *   kepala foto. Pilihan foto itu urusan tampilan, jadi ia tetap prop.
 * - **`jejakCount`.** Itu isi slot milik hero, bukan sesuatu yang dirender
 *   kartunya. `Hero.astro` tetap memanggil `getGlobalImpact()`-nya sendiri.
 *   Memodelkannya di sini berarti menambah field yang tak dibaca siapa pun.
 */
export interface Agenda {
  location: string;
  targetPorsi: number;
  collectedPorsi: number;
  cutoff?: string;
}

export interface Ajakan {
  aksi: Aksi;
  program: Program;
  waNumber: string;
  /** null kalau program ini bukan program yang sedang berjalan — lihat catatan di bawah. */
  agenda: Agenda | null;
  schedule: { weekday: string; time: string } | null;
}

/**
 * Ajakan untuk satu program.
 *
 * null HANYA untuk slug yang memang tidak menunjuk program mana pun. Program
 * yang ada tapi belum punya aksi tidak pernah mengembalikan null: ia dapat
 * mekanisme percakapan yang disusun di sini, dengan kalimat yang persis sama
 * dengan yang di-hardcode halaman program hari ini. Jadi Track D yang baru
 * separuh jalan cuma turun ke apa yang sudah tayang sekarang, bukan menghapus
 * CTA utama situs.
 */
export async function getAjakan(programSlug: string): Promise<Ajakan | null> {
  const { getEntry } = await import('astro:content');
  const { getPrograms } = await import('./programs');

  const programs = await getPrograms();
  const program = programs.find((p) => p.slug === programSlug);
  if (!program) return null;

  const site = await getEntry('settings', 'site');
  if (!site) throw new Error('settings/site entry not found');

  // Satu aksi per kartu: yang pertama menurut urutan array yang programnya
  // cocok. Kedua tempat pemasangannya merender satu kartu dengan satu
  // mekanisme hari ini. Banyak-aksi-per-kartu tidak dimodelkan; kalau nanti
  // dibutuhkan, yang berubah cuma berkas ini, bukan pemanggilnya.
  const found = (await getAksiForProgram(programSlug))[0];

  const aksi: Aksi = found ?? {
    pintu: program.pintu,
    title: program.label,
    desc: program.summary,
    program,
    showOnPintu: false,
    mechanism: {
      kind: 'conversation',
      message: `Halo, saya ingin mendiskusikan program ${program.label}.`,
    },
  };

  if (!found) {
    console.warn(
      `[ajakan] program "${programSlug}" belum punya aksi. Kartunya turun ke percakapan WhatsApp biasa.`
    );
  }

  // Agenda mingguan di `settings` menggambarkan program yang sedang berjalan,
  // yaitu program aktif pertama — konvensi yang sama dengan kartu hero beranda.
  // Panel agenda karena itu cuma muncul di halaman program itu; tanpa
  // penjagaan ini jadwal Jumat ikut nongol di halaman Ramadhan Berbagi.
  //
  // Penjagaannya duduk di sini, bukan di tempat pemasangan, supaya kedua
  // pemasangan tidak bisa lupa melakukannya sendiri-sendiri. `schedule` ikut
  // dijaga dengan tes yang sama, karena ia mendeskripsikan agenda yang sama.
  const isRunning = programs.find((p) => p.active)?.slug === program.slug;

  return {
    aksi,
    program,
    waNumber: site.data.waNumber,
    agenda: isRunning ? site.data.nextAgenda : null,
    schedule: isRunning ? site.data.schedule : null,
  };
}
