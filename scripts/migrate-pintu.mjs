#!/usr/bin/env node
/**
 * Pindahkan `pintu` tiap program dari sumbu BENTUK ke sumbu PERUNTUKAN.
 *
 * Ditulis sebagai skrip, bukan suntingan tangan, karena Keystatic mode `cloud`
 * berarti editor tetap menulis ke `main` selama migrasi ini berjalan. Kalau ada
 * program baru masuk di tengah jalan, jalankan ulang skrip ini di atas `main`
 * terbaru — konflik merge berubah jadi sekadar menjalankan ulang.
 *
 * Idempoten: menjalankannya dua kali menghasilkan berkas yang sama.
 *
 * SENGAJA GAGAL KERAS pada program yang tak ada di TABEL. Menebak pintu sebuah
 * program berarti salah menaruhnya diam-diam, dan yang salah taruh baru
 * ketahuan setelah angkanya terlanjur dilaporkan di halaman yang keliru.
 *
 *   node scripts/migrate-pintu.mjs           # tulis
 *   node scripts/migrate-pintu.mjs --dry-run # lihat saja
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/programs';
const DRY = process.argv.includes('--dry-run');

/**
 * Peruntukan tiap program yang ada, beserta alasan yang tidak jelas dari
 * namanya saja. `utama` memikul kartu, remah roti, dan SELURUH angkanya.
 */
const TABEL = {
  'jumat-berkah': {
    pintu: ['food', 'empowerment'],
    utama: 'food',
    // Sisi Pemberdayaan bukan ambisi: IMPACTS di consts.ts sudah mencatat dapur
    // UMKM menerima order mingguan yang dibayar tepat waktu dan agen lapangan
    // warga sekitar berpenghasilan rutin. Berjalan 52 pekan, cuma belum bernama.
    // Klaim `time` dari M2 hilang di sini karena bentuk sumbangan berhenti jadi
    // sumbu — relawan yang ikut menyalurkan tetap melayani peruntukan Pangan.
    alasan: 'porsi mingguan + dapur UMKM dan agen lapangan yang berpenghasilan darinya',
  },
  'ramadhan-berbagi': { pintu: ['food'], utama: 'food', alasan: 'paket makanan, musimnya urusan field `season`' },
  'community-giving': { pintu: ['food'], utama: 'food', alasan: 'penyaluran makanan; komunitas adalah kanalnya, bukan peruntukannya' },
  'csr-food-program': { pintu: ['food'], utama: 'food', alasan: 'penyaluran makanan; CSR adalah kanalnya, bukan peruntukannya' },
  'berbagi-sembako': { pintu: ['food'], utama: 'food', alasan: 'paket kebutuhan pangan keluarga' },
  'berbagi-buku-alat-sekolah': { pintu: ['education'], utama: 'education', alasan: 'buku dan perlengkapan supaya anak tetap sekolah' },
  'berbagi-beasiswa': { pintu: ['education'], utama: 'education', alasan: 'biaya belajar; bahwa bentuknya uang tidak lagi menentukan pintu' },
  'berbagi-bantuan-bencana': {
    pintu: ['humanitarian', 'food'],
    utama: 'humanitarian',
    // `mode` sengaja dibiarkan `routine`. Pintu humanitarian buka sepanjang
    // tahun untuk kesiapsiagaan dan pemulihan; `mode: emergency` adalah keadaan
    // sementara yang dinyalakan saat ada kejadian, bukan label permanen.
    alasan: 'respons darurat, isinya kebutuhan dasar termasuk pangan',
  },
};

/**
 * Dilebur atas keputusan pemilik ("lebur aja jadi sembako boleh").
 *
 * `berbagi-makanan-harian` tak punya deskripsi, tak punya fitur, dan nonaktif —
 * sama persis dengan `berbagi-sembako`. Satu-satunya yang khas darinya adalah
 * kata "setiap hari", dan itu TIDAK dibawa: tak ada kegiatan harian yang
 * berjalan (Jumat Berkah mingguan), dan melipat "makanan harian" ke dalam
 * "sembako" akan salah menggambarkan sembako. Yang hilang adalah klaim tanpa
 * penopang, bukan kemampuan.
 */
const DILEBUR = { 'berbagi-makanan-harian': 'berbagi-sembako' };

/** Buang blok `pintu:`/`pintuUtama:` lama, apa pun bentuknya (skalar / daftar). */
function stripPintu(text) {
  const lines = text.split('\n');
  const out = [];
  let skipping = false;
  for (const line of lines) {
    if (/^(pintu|pintuUtama):/.test(line)) {
      skipping = true;
      continue;
    }
    // Daftar blok YAML: baris "  - food" milik kunci sebelumnya.
    if (skipping && /^\s+-\s/.test(line)) continue;
    skipping = false;
    out.push(line);
  }
  return out.join('\n');
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));
const tak_dikenal = [];
let ditulis = 0;

for (const file of files) {
  const slug = file.replace(/\.yaml$/, '');
  const path = join(DIR, file);

  if (slug in DILEBUR) {
    console.log(`lebur   ${slug} -> ${DILEBUR[slug]} (dihapus)`);
    if (!DRY) unlinkSync(path);
    continue;
  }

  const entry = TABEL[slug];
  if (!entry) {
    tak_dikenal.push(slug);
    continue;
  }

  const src = readFileSync(path, 'utf8');
  const body = stripPintu(src);
  const blok = [`pintu:`, ...entry.pintu.map((p) => `  - ${p}`), `pintuUtama: ${entry.utama}`].join('\n');
  // Disisipkan tepat setelah `label:` supaya urutan kunci tetap seperti semula.
  const next = body.replace(/^(label:.*\n)/m, `$1${blok}\n`);

  if (next === src) {
    console.log(`lewat   ${slug} (sudah sesuai)`);
    continue;
  }
  console.log(`tulis   ${slug} -> [${entry.pintu.join(', ')}] utama=${entry.utama}`);
  if (!DRY) writeFileSync(path, next);
  ditulis++;
}

if (tak_dikenal.length) {
  console.error(
    `\nBERHENTI: program berikut tidak ada di TABEL migrasi:\n` +
      tak_dikenal.map((s) => `  - ${s}`).join('\n') +
      `\n\nTambahkan entrinya di scripts/migrate-pintu.mjs beserta alasannya, lalu jalankan lagi.` +
      `\nSkrip ini menolak menebak: pintu yang salah baru ketahuan setelah angkanya terlanjur\n` +
      `dilaporkan di halaman yang keliru.\n`
  );
  process.exit(1);
}

console.log(`\n${ditulis} berkas ditulis${DRY ? ' (dry-run, tidak ada yang disimpan)' : ''}.`);
