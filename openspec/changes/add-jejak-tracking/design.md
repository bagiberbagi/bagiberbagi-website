## Context

Situs bagiberbagi.id sudah punya taksonomi berlapis: **Pintu** (5, di `consts.ts` `PINTU`) → **Program** (collection `programs`, tiap program menempel satu pintu via `pintu`). Program adalah sumber tunggal; semua konsumen (kartu beranda, mega-menu, kalkulator, route `[program].astro`, OG) derive dari `getPrograms()`.

Yang belum ada: dimensi **eksekusi**. Satu program (mis. Jumat Berkah) berjalan berkali-kali; tiap kali menghasilkan foto, angka, cerita. Sekarang tidak ada tempat menyimpan/menampilkannya, dan angka dampak di halaman pintu (`CATEGORY_CONTENT[pintu].stats`, `env.stats`) masih hardcoded.

Fitur **Jejak** menambah lapisan ketiga: **Pintu → Program → Jejak**. "Impact" bukan entitas atau istilah publik — ia lapisan komputasi (agregasi metrik) yang muncul sebagai counter, tidak sebagai route/nama koleksi. Keyword publik tunggal: `jejak`.

Konvensi yang mengikat: Astro static (`output: 'static'`), zero-framework di sisi publik (`.astro` + vanilla JS di `src/scripts/`), Keystatic sebagai CMS, `content.config.ts` ↔ `keystatic.config.ts` harus sepakat ekstensi, field gambar `.nullish()` karena Keystatic menulis `null` saat dikosongkan.

## Goals / Non-Goals

**Goals:**
- Satu collection `jejak` sebagai sumber tunggal jejak; pintu diturunkan, tidak diduplikasi.
- Agregasi metrik terhitung (bukan hardcoded) di level program dan pintu, memungkinkan pemantauan "program mana dampak tinggi, di pintu apa".
- Permukaan konsisten: beranda, halaman pintu, halaman program, halaman detail jejak — semua derive dari lib yang sama.
- Editor bisa menambah jejak sepenuhnya lewat Keystatic tanpa menyentuh kode.

**Non-Goals:**
- Tidak membuat dashboard analitik global lintas-pintu di rilis ini (`/jejak` global / leaderboard menyeluruh) — kandidat lanjutan.
- Tidak memindahkan `CATEGORY_CONTENT` konseptual (howItWorks/faq/forWhom) ke CMS; hanya bagian `stats`/`env.stats` yang jadi turunan agregat.
- Tidak menambah framework client (lightbox galeri, kalau ada, pakai vanilla JS).
- Tidak mengubah taksonomi Pintu/Program yang sudah ada.

## Kamus Istilah (controlled vocabulary)

Satu peran = satu kata. Implementasi MUST patuh; jangan introduksi sinonim entitas baru.

| Peran | Kata | Contoh | Larangan |
|---|---|---|---|
| Entitas / route / collection / section / field data | **jejak** | `/jejak/[slug]`, collection `jejak`, "Rekam Jejak", `jejakCount` | jangan `event`/`laporan`/`kegiatan` sebagai label entitas |
| Penghitung kejadian (tampilan, lintas pintu) | **kali** | "Jumat Berkah berjalan 52 kali" | jangan tampilkan "52 jejak"/"52 kegiatan" |
| Lapisan hasil — publik | **dampak** | judul "Dampak", counter porsi/penerima | — |
| Lapisan hasil — kode internal | **impact** | `getPintuImpact`, `ImpactSection` | jangan bocor ke teks UI |
| Prosa aksi khas-makanan | **penyaluran** | how-it-works pintu food | jangan jadi penghitung generik (pintu waktu/ruang tak "menyalurkan") |
| Tagline | **aksi** | "Satu Aksi. Banyak Dampak." | jangan jadi label entitas |

Entitas mapan yang sudah ada — **program**, **pintu** — tidak diubah.

## Decisions

### 1. Jejak = collection `.mdoc` dengan `relationship` ke `programs`
Bentuk foto + metrik + cerita paling pas di Markdoc: frontmatter terstruktur (metrics, gallery, cover) + `contentField` untuk body naratif — pola yang sama sudah dipakai `legal`. `relationship` (bukan string bebas) memastikan jejak mengikat program valid dan pintu bisa diturunkan.
- **Alternatif**: yaml/json seperti `programs`. Ditolak karena body naratif panjang lebih baik sebagai konten Markdoc, dan `contentField` Keystatic hanya mendukung `.mdoc`.
- **Alternatif**: simpan `pintu` juga di jejak untuk query cepat. Ditolak — melanggar sumber tunggal; pintu selalu bisa dilihat lewat program.

### 2. Impact = fungsi agregasi, bukan entitas/route
`src/lib/impact.ts` menghitung on-demand saat build dari data jejak. Tidak ada collection `impact`, tidak ada route `/impact`. Ini menjaga "satu keyword publik" (`jejak`) dan menghindari istilah kembar.
- **Alternatif**: simpan agregat sebagai field/collection tersendiri. Ditolak — data turunan yang bisa basi; build static murah menghitung ulang.

### 3. Agregasi `metrics` = sum-by-label (bukan skema numerik kaku)
Tiap jejak punya `metrics: [{label, value:number}]`. Agregat = group by `label` lalu jumlah `value`. Fleksibel lintas pintu (food=porsi, dana=rupiah, waktu=jam) tanpa skema per-pintu.
- **Konsekuensi**: konsistensi bergantung disiplin label editor ("porsi" vs "Porsi"). Mitigasi: normalisasi label (trim + lowercase key) saat agregasi, tampilkan label asli pertama yang ditemui.
- **Alternatif**: field numerik tetap (`porsi`, `penerima`, …). Ditolak — kaku, pintu berbeda butuh metrik berbeda; menambah metrik = migrasi skema.

### 4. `metrics` numerik terpisah dari label tampilan
`value` wajib `number` supaya bisa dijumlah dan di-count-up (reuse script Stats existing). Formatting (ribuan, "Rp", "kg") dilakukan saat render, bukan disimpan di value.

### 5. URL detail flat `/jejak/[slug]`, agregat nested `/berbagi/[category]/jejak`
Detail jejak flat agar URL stabil walau program di-rename/pindah pintu; agregat nested di bawah pintu agar "menyatu" secara hierarki dan reuse layout `/berbagi/[category]`. Dua permukaan menaut ke detail yang sama.
- **Alternatif**: detail nested `/berbagi/[category]/jejak/[slug]`. Ditolak — 3 level getStaticPaths, URL jejak rapuh terhadap perubahan program.

### 6. `CATEGORY_CONTENT.stats` jadi fallback, bukan sumber
Halaman pintu memakai `getPintuImpact(pintu)` bila ada jejak; bila pintu belum punya jejak, fallback ke `CATEGORY_CONTENT.stats` statis (agar pintu lain yang belum jalan tetap tampil rapi). Ini transisi bertahap, bukan penghapusan mendadak.

### 7. Lib mirror pola `programs.ts`
`src/lib/jejak.ts`: `getJejak()` (semua, published, terurut tanggal desc), `getJejakByProgram(slug)`, `getJejakByPintu(pintuId)` (join lewat programs), `getJejakPages()` (yang published → dasar route + OG). Konsumen tak pernah `getCollection('jejak')` langsung.

### 8. Konvensi slug & penamaan jejak
Slug = filename = `{program-slug}-{YYYY-MM-DD}` (kebab, lowercase, tanggal ISO di belakang), mis. `jumat-berkah-2026-07-18` → `/jejak/jumat-berkah-2026-07-18/`. Bentrok (program jalan >1×/hari) → suffix `-2`, `-3`.
- `title` adalah field display terpisah (boleh panjang, mis. "Jumat Berkah ke-7 di Kawasan Pasar Minggu"); nomor edisi ("ke-7") hidup di `title`, **bukan** di slug.
- `date` (ISO) MUST konsisten dengan tanggal di slug; sort tampil memakai field `date`, jadi urutan filename tidak memengaruhi fungsi.
- **Rasional**: URL self-describing + berkelompok per program; tanggal ISO unik & stabil tanpa nomor urut manual; slug beku setelah publish sehingga rename/pindah-pintu program tidak menggeser URL jejak.
- **Keystatic**: `slugField` pakai `fields.slug` — bagian `name` = `title`, bagian `slug` di-override editor mengikuti konvensi; `description` field memuat hint format `program-YYYY-MM-DD`.
- **Alternatif**: date-first `2026-07-18-jumat-berkah` (ditolak — URL kurang enak, pengelompokan per program hilang) dan nomor urut `jumat-berkah-07` (ditolak — perlu maintain sekuens manual, rawan bentrok).

## Risks / Trade-offs

- **Label metrik tidak konsisten antar entry** → agregasi normalisasi key (trim+lowercase); dokumentasikan konvensi label di helper field Keystatic.
- **Relasi program yatim** (jejak menunjuk program terhapus) → filter di lib: jejak tanpa program valid dikeluarkan dari agregasi & route; build tidak menghasilkan halaman yatim.
- **`getJejakByPintu` butuh join programs tiap panggilan** → muat `getPrograms()` sekali, buat map slug→pintu; agregasi jalan di memori saat build (dataset kecil, murah).
- **Mismatch ekstensi `.mdoc`** (pelajaran lama: Keystatic diam menampilkan nol entry) → tes: setelah config, buka `/keystatic`, pastikan collection Jejak listing entry seed.
- **OG image untuk route dinamis jejak** → ikuti pola `[...route].ts` yang sudah menangani `[program]`; pastikan slug jejak masuk daftar route yang di-generate.
- **Beranda makin panjang** → section "Jejak Terbaru" dibatasi N kartu (mis. 3) + tombol ke halaman pintu/detail.

## Migration Plan

1. Tambah collection `jejak` di `content.config.ts` + `keystatic.config.ts` (sepakat `.mdoc`).
2. Tulis `src/lib/jejak.ts` + `src/lib/impact.ts`.
3. Seed 1 entry `jejak` Jumat Berkah nyata → verifikasi listing Keystatic & agregasi.
4. Bangun `/jejak/[slug]`, lalu `/berbagi/[category]/jejak`, lalu teaser di halaman pintu, blok di halaman program, section beranda.
5. Extend OG route + `seo.pages[]`.
6. `bun run build` + `bunx astro check` hijau sebelum merge.

Rollback: fitur aditif; hapus route/section baru dan collection tidak memengaruhi program/pintu existing. `CATEGORY_CONTENT.stats` statis tetap sebagai fallback sehingga halaman pintu tak pernah kosong walau data jejak dicabut.

## Open Questions

- Format `metrics` di Keystatic: array `{label, value}` bebas vs sebagian preset label per pintu (mengurangi salah ketik)? Rilis awal pakai bebas + normalisasi; evaluasi setelah beberapa entry.
- Perlukah galeri lightbox (script vanilla) di rilis awal, atau cukup grid gambar statis? Default: grid statis dulu, lightbox opsional menyusul.
- Kapan menambah dashboard global lintas-pintu (`/jejak` leaderboard menyeluruh)? Di luar scope rilis ini.
