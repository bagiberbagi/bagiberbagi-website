## Context

Situs sudah punya taksonomi berlapis Pintu → Program → Jejak (lihat change `add-jejak-tracking`). Program adalah "mekanisme" donasi (Jumat Berkah dkk), pintu adalah kategori/filter tanpa halaman sendiri, jejak adalah satu kejadian penyaluran dengan metrik. Halaman program (`program/[program].astro`) sekarang render satu pola CTA untuk semua program tanpa kecuali: panel harga fixed Rp 25.000/pax + tombol "Donasi Sekarang", dibangun berdasarkan pola Jumat Berkah.

Dari analisis dokumen perbandingan 4 skema program makanan (Jumat Berkah, Community Giving, CSR Food Program, Ramadhan Berbagi), 3 program yang mau ditambahkan tidak semuanya cocok dengan pola self-serve itu: dua (Community Giving, CSR Food Program) berpaket custom/negosiasi, satu (Ramadhan Berbagi) berpaket fixed tapi 3 pilihan, bukan satu harga tunggal. Dari diskusi itu juga muncul kebutuhan baru: donor institusional yang memberi secara rutin (bukan sekali, mis. komunitas "46Cyclist") berhak atas halaman dashboard dampak sendiri, terpisah dari donatur individu anonim yang memang tidak dilacak per orang.

## Goals / Non-Goals

**Goals:**
- Program baru bisa ditambah lewat entri collection, tanpa mengubah schema `programs`.
- Halaman program menampilkan CTA sesuai sifat paketnya (fixed vs custom), bukan satu pola dipaksakan ke semua program.
- Organisasi (donor institusional rutin) dapat dashboard dampak sendiri yang teragregasi lintas program yang mereka ikuti, bukan terkunci ke satu program.
- Laporan PDF (mis. ESG/CSR summary) bisa dilampirkan ke jejak tanpa build pipeline generate PDF.

**Non-Goals:**
- Tidak membangun sistem autentikasi/akun untuk organisasi atau donatur individu. Organisasi adalah entri konten yang dikelola editor lewat Keystatic, bukan akun yang login sendiri.
- Tidak membuat subtipe komunitas/perusahaan di schema `organisasi`, sudah diputuskan satu schema untuk semua, dibedakan lewat narasi/copy per entri, bukan field enum.
- Tidak membangun pipeline generate PDF otomatis (print-to-PDF terjadwal, template ESG dinamis). `reportPdf` murni upload manual oleh editor.
- Tidak mengubah taksonomi Pintu/Program yang sudah ada; organisasi ditempel ke jejak, bukan menggantikan atau menduplikasi relasi jejak → program yang sudah ada.
- Tidak menambah filter tipe/kategori di index `/organisasi/` pada rilis ini (chip "Komunitas/Perusahaan" sempat dipertimbangkan, batal bersamaan dengan keputusan satu schema tanpa subtipe); bisa menyusul kalau daftarnya sudah cukup panjang untuk butuh filter.

## Kamus Istilah (controlled vocabulary)

| Peran | Kata | Contoh | Larangan |
|---|---|---|---|
| Entitas / route / collection / field relationship | **organisasi** | `/organisasi/[slug]`, collection `organisasi`, `jejak.organisasi` | jangan `mitra`/`partner`/`komunitas` sebagai label entitas ini, "mitra" sudah dipakai untuk dapur UMKM & relawan pelaksana di halaman program |
| Peran donor institusional, dalam copy bebas | "komunitas", "perusahaan", "organisasi mitra" | teks `detail.description` per entri | jangan jadi nama field/route, cukup teks bebas, tidak terstruktur |
| CTA fixed-price (existing) | **self-serve** | panel "Donasi Sekarang" | — |
| CTA custom/negosiasi (baru) | **inquiry** | tombol "Diskusikan Program" | jangan dicampur dalam satu tombol dengan self-serve |

Entitas mapan yang sudah ada, pintu, program, jejak, tidak diubah relasinya; organisasi murni entitas tambahan yang menempel lateral ke jejak.

## Decisions

### 1. Organisasi menempel ke `jejak`, bukan ke `program`
`jejak.organisasi` adalah relationship opsional yang berdiri sendiri dari `jejak.program`. Satu organisasi bisa punya jejak di beberapa program berbeda (mis. rutin di Community Giving, ikut musiman di Ramadhan Berbagi), dan `getOrganisasiImpact` mengagregasi lintas program itu jadi satu angka di halaman organisasinya.
- **Alternatif**: field `organisasi` di dalam entri `program` (organisasi memiliki satu program tetap). Ditolak, ini mengunci satu organisasi ke satu mekanisme donasi, padahal pola nyatanya organisasi yang sama bisa berpartisipasi di lebih dari satu program dari waktu ke waktu.

### 2. Schema `organisasi` tanpa subtipe komunitas/perusahaan
Satu schema untuk semua donor institusional. Struktur datanya (nama, logo, deskripsi, sejak kapan, dashboard) identik terlepas dari apakah entitasnya komunitas akar rumput atau korporasi, yang beda cuma narasi di `detail.description`, bukan bentuk datanya.
- **Alternatif**: `type: enum('komunitas' | 'perusahaan')` dengan badge/filter berbeda per tipe. Ditolak untuk rilis ini, kompleksitas UI (chip filter, badge beda) belum diperlukan selama jumlah entri masih sedikit; field ini bisa ditambah non-breaking nanti kalau daftarnya sudah butuh disortir.

### 3. Nama entitas "organisasi", bukan "mitra" atau "komunitas"
"Mitra" sudah dipakai di `program/[program].astro` untuk CTA sekunder "Jadi mitra {program}" yang mengarah ke dapur UMKM/relawan pelaksana, peran yang berbeda total dari donor institusional rutin. "Komunitas" saja tidak mengakomodasi perusahaan CSR. "Organisasi" netral untuk keduanya dan tidak bentrok istilah lain yang sudah ada di situs (dicek: "kolaborasi" sudah dipakai sebagai salah satu dari 4 nilai inti di halaman About, jadi "kolaborator" ikut dihindari sebagai nama entitas).

### 4. CTA program: cabang self-serve vs inquiry berdasar sifat paket, bukan berdasar target audiens
Pembagi programnya kolom "Paket" di dokumen sumber (fixed vs custom), bukan kolom "Target" (individu vs institusi). Ramadhan Berbagi menerima individu maupun institusi tapi paketnya tetap jelas (Sahur/Takjil/Buka Puasa), sedangkan Community Giving menerima komunitas non-korporat tapi paketnya "custom sesuai kebutuhan" persis seperti CSR.
- **Hasil**: self-serve untuk Jumat Berkah dan Ramadhan Berbagi (dengan tambahan selector paket untuk yang terakhir); inquiry untuk Community Giving dan CSR Food Program.
- **Alternatif**: field baru per program (mis. `pricingType`) di schema `programs`. Dipertimbangkan tapi ditunda, untuk rilis ini cukup percabangan berdasar `program.slug` di komponen karena baru 2 program yang butuh inquiry; kalau nanti lebih banyak program custom bermunculan, baru pantas diangkat jadi field schema (lihat Open Questions).

### 5. Community Giving dan CSR Food Program tetap dua entri program terpisah
Meski secara mekanisme sekarang identik (sama-sama inquiry CTA, sama-sama bisa berujung ke entri organisasi), keduanya dipertahankan sebagai dua entri program dengan narasi berbeda. Biaya menjaga dua entri konten nyaris nol (cuma copy, bukan logic berbeda), sementara manfaatnya nyata: audiens komunitas dan audiens tim CSR korporat punya bahasa dan pertimbangan yang beda jauh (kebersamaan/charity event vs ESG/employer branding), dan dua kartu program di mega-menu/halaman pintu membantu pengunjung mengenali diri sendiri lebih cepat dibanding satu kartu generik.

### 6. `reportPdf` = upload manual, bukan generate otomatis
Field `fields.file` biasa di collection `jejak`, mengikuti pola exception upload non-gambar yang sudah dipakai (foto kartu program di `public/uploads/programs`, di luar pipeline `astro:assets`). Editor mengunggah PDF yang sudah jadi (mis. laporan ESG yang disusun manual), situs cuma menyimpan dan menautkannya.
- **Alternatif**: generate PDF otomatis dari data jejak (mis. lewat print stylesheet `@media print` atau service render PDF). Ditolak untuk rilis ini, situs statis tanpa backend, dan kebutuhan riilnya ("kita upload aja") sudah cukup dilayani upload manual tanpa infrastruktur baru.

## Risks / Trade-offs

- **Slug program lama berubah** (`ramadhan-berkah` → `ramadhan-berbagi`) → entri lama belum pernah `active`, jadi aman di-rename langsung tanpa redirect; tetap dicek dulu sebelum implementasi apakah slug lama sempat publik/terindeks di luar situs.
- **CTA bercabang bikin `program/[program].astro` makin bercabang logic-nya** → percabangan berbasis slug/flag sederhana di level program entry, bukan duplikasi seluruh komponen; kalau makin banyak varian, pertimbangkan `program.detail` menyimpan `ctaType` eksplisit (lihat Open Questions).
- **`jejak.organisasi` relasi yatim** (organisasi dihapus/di-nonaktifkan tapi jejak masih menunjuknya) → ikuti pola yang sudah ada untuk `jejak.program`: filter di lib, jejak dengan organisasi tak valid dikeluarkan dari agregasi organisasi tapi tetap tampil normal di agregasi program/pintu (organisasi cuma lapisan tambahan, bukan syarat jejak valid).
- **Index `/organisasi/` kosong sebelum ada organisasi pertama aktif** → render empty state yang sopan (bukan halaman kosong/404), karena route index-nya statis dan akan ter-deploy sebelum entri organisasi pertama (mis. 46Cyclist) siap publish.
- **`reportPdf` file besar tak terkompresi** → di luar kendali situs (upload manual), cukup batasi lewat deskripsi field di Keystatic ("unggah PDF yang sudah dikompres"), tidak ada validasi ukuran otomatis di rilis ini.

## Migration Plan

1. Tambah field `organisasi` & `reportPdf` di schema `jejak` (`content.config.ts` + `keystatic.config.ts`, selaras), keduanya opsional sehingga jejak lama tetap valid tanpa migrasi data.
2. Tambah collection `organisasi` baru di kedua config.
3. Tulis `getJejakByOrganisasi` (`jejak.ts`) & `getOrganisasiImpact` (`impact.ts`).
4. Bangun `/organisasi/index.astro` lalu `/organisasi/[slug].astro` (boleh dites dengan entri organisasi dummy sebelum ada yang riil).
5. Tambah 3 entri `programs` baru (Community Giving, CSR Food Program) + reaktivasi/rename Ramadhan Berbagi.
6. Bangun cabang CTA di `program/[program].astro`.
7. Extend OG route untuk halaman program & organisasi baru.
8. `bun run build` + `bunx astro check` hijau, cek Keystatic listing kedua collection sebelum merge.

Rollback: fitur aditif, field baru opsional dan collection baru tidak menyentuh data/behavior program & jejak yang sudah ada. Kalau perlu mundur, cabut route `/organisasi/*` dan blok CTA baru, program lama (Jumat Berkah) tidak terpengaruh.

## Open Questions

- Apakah percabangan CTA (self-serve/inquiry) sebaiknya jadi field eksplisit di schema `program` (mis. `detail.ctaType`) alih-alih hardcode per slug di komponen? Rilis ini pakai hardcode karena baru 2 program inquiry; evaluasi kalau jumlahnya bertambah.
- Slug lama `ramadhan-berkah` perlu dicek dulu, sempat publik/terindeks atau belum, sebelum diputuskan rename langsung vs redirect.
- Urutan implementasi: organisasi lebih dulu di `tasks.md` karena field `jejak.organisasi` jadi fondasi sebelum entri program dites end-to-end, tapi keduanya independen dan bisa ditukar urutannya kalau lebih nyaman dikerjakan sebaliknya.
