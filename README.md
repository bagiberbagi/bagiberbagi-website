# bagiberbagi.id

Landing page situs donasi bagiberbagi.id — komunitas penyalur bantuan makanan & dukungan UMKM.

Dibangun dengan [Astro](https://astro.build) + Tailwind CSS, static output (tanpa backend). Konten dikelola lewat [Keystatic](https://keystatic.com) di `/keystatic`.

## Menjalankan

```bash
bun install
bun run dev       # dev server, http://127.0.0.1:4321
bun run build     # build ke dist/
bun run preview   # preview hasil build
bun test          # unit test src/lib/format.ts
bunx astro check  # type-check file .astro
```

Pakai `127.0.0.1`, bukan `localhost` — alur login Keystatic Cloud mengarahkan balik ke IP itu secara spesifik.

Kalau `bun run dev` menjawab *"Dev server already running"*, servernya memang sudah hidup di latar belakang:

```bash
bunx astro dev status
bunx astro dev logs
bunx astro dev stop
```

## Struktur

- `src/pages/` — satu file per route: `index`, `faq`, `tentang`, `[program]` (satu route dinamis untuk semua halaman program, mis. `/jumat-berkah/`), halaman legal (`privasi`, `syarat`, `transparansi`), admin Keystatic, dan generator OG image.
- `src/components/` — satu komponen per section halaman utama.
- `src/consts.ts` — data UI yang tidak diedit editor (fitur, langkah, dampak, nav, label+ikon kategori mega-menu). Data program sendiri ada di CMS (**Program**), bukan di sini.
- `src/content/` — konten yang diedit lewat Keystatic. Dibaca Astro lewat `src/content.config.ts`, ditulis Keystatic lewat `keystatic.config.ts`; **kedua config harus sepakat soal ekstensi file**.
- `src/lib/` — fungsi murni: format Rupiah & link WhatsApp (`format.ts`, ada unit test), potongan schema.org (`schema.ts`), resolusi SEO per halaman (`seo.ts`).
- `src/scripts/` — JS interaktif per fitur (mobile nav, ticker, kalkulator donasi, akordeon FAQ, mega-menu, TOC legal).

## Alur kerja konten

### Siapa mengedit apa

| Peran | Alatnya | Tidak perlu tahu |
|---|---|---|
| Writer / content / SEO | `/keystatic` di browser | git, node, terminal |
| Developer | repo + branch + `bun run dev` | kredensial CMS produksi |

Writer tidak pernah menyentuh repo. Developer tidak perlu akses tulis ke konten produksi.

### Di mana mengedit

| Yang mau diubah | Tempatnya di `/keystatic` |
|---|---|
| Judul & deskripsi di Google, gambar share — beranda, FAQ, Jumat Berkah | **SEO → Halaman** |
| Hal yang sama untuk halaman legal & Tentang Kami | blok **SEO** di form halaman itu sendiri |
| Nama situs, deskripsi default, data organisasi | **SEO** |
| Pertanyaan FAQ + urutannya | **FAQ** — seret untuk mengurutkan |
| Kolom & link footer + urutannya | **Footer** — seret untuk mengurutkan |
| Isi halaman legal | **Legal — …** |
| Isi halaman Tentang Kami | **Halaman Tentang Kami** |
| Nomor WhatsApp, sosial media, angka statistik | **Site Settings** |
| Program (kartu beranda, mega-menu, kalkulator, halaman detail) | **Program** — satu sumber untuk semua |
| Alat ukur / analytics (PostHog, GA4, Meta Pixel, dll) | **Analytics** — centang + isi ID |

Field SEO di halaman legal dan Tentang Kami **boleh dikosongkan** — artinya halaman memakai judul dan paragraf pembukanya sendiri. Isi hanya kalau teks di Google perlu berbeda dari teks di halaman.

### Cara konten terbit

Menekan **Save** di `/keystatic` = commit ke GitHub. Commit ke `main` memicu deploy otomatis, **live sekitar 2 menit tanpa review**.

Ada dua mode kerja, pilih sesuai kebutuhan:

**Langsung terbit** — edit sambil berada di branch `main`. Cepat, cocok untuk perbaikan kecil dan penulis yang dipercaya. Tidak ada jaring pengaman.

**Lewat review** — di `/keystatic`, pakai pemilih branch (kiri atas) untuk pindah/membuat branch, misalnya `content/faq-oktober`. Semua perubahan masuk ke branch itu, produksi tidak tersentuh. Setelah siap, buka Pull Request di GitHub untuk ditinjau, lalu merge. Merge itulah yang menerbitkan.

Gunakan mode kedua untuk perubahan yang berisiko: judul & deskripsi SEO, harga/angka, teks legal, atau apa pun yang ditulis banyak orang sekaligus.

### Analytics & alat ukur

Panel **Analytics** di `/keystatic` adalah switchboard: tiap alat punya **centang + field ID**. Alat baru muncul di situs hanya kalau **dicentang DAN ID-nya diisi**; semua mati = situs tanpa skrip apa pun. Nyalakan → Save → live ± 2 menit (rebuild).

- **ID = kode publik**, bukan rahasia — memang tampil di HTML. Tempel apa adanya dari dashboard masing-masing.
- **PostHog** (cookieless): jalan tanpa banner izin, lihat semua pengunjung. Alat baseline yang disarankan.
- **GA4 / Meta Pixel / GTM / Clarity** (cookie): butuh **consent** — otomatis memunculkan banner "Terima/Tolak"; baru aktif setelah pengunjung menekan Terima. Biarkan "Tampilkan consent banner" menyala.
- **Kalau pakai GTM**, kelola GA4/Pixel di dalam GTM — jangan dicentang juga di sini (nanti dobel-hitung).
- **Batasan penting:** donasi selesai di WhatsApp (di luar situs), jadi yang terlacak cuma **klik "Donasi"** (niat), bukan donasi yang benar-benar cair. Iklan mengoptimasi ke klik, bukan konversi asli.

Setup akun (Looker Studio untuk laporan, UptimeRobot untuk pantau uptime) di luar repo — dilakukan sekali di dashboard masing-masing.

### Drafting

Keystatic **tidak punya status draft/published bawaan**. Yang ada:

- **Draft otomatis di browser.** Perubahan yang belum di-Save tersimpan di IndexedDB perangkatmu dan ditawarkan lagi saat kembali ke form yang sama. Sifatnya lokal — rekan kerja tidak bisa melihatnya, dan hilang kalau ganti perangkat atau bersihkan data browser. Ini jaring pengaman terhadap tab tertutup, **bukan** alur draft.
- **Branch sebagai draft.** Ini cara draft yang sesungguhnya: buat branch, tulis sepuasnya, terbitkan lewat merge. Bisa dilihat orang lain, bisa direview, bisa dibuang.
- **Flag di data.** Untuk entri yang harus ada tapi belum boleh tampil, pakai field di skemanya — program punya **Aktif (sudah dibuka)** yang dibiarkan mati (tampil "Segera Hadir", tanpa halaman detail), halaman SEO punya **Sembunyikan dari mesin pencari**. Cocok untuk "sudah disiapkan, belum diumumkan".

Kalau nanti butuh draft per entri yang sesungguhnya (tersimpan di repo tapi tidak tampil di situs), tambahkan field `status` di skema lalu saring saat build. Belum dikerjakan karena belum dibutuhkan.

### Otorisasi

Keystatic menyerahkan izin ke **GitHub** — tidak ada sistem peran tersendiri di dalamnya, dan **tidak ada** izin per-collection atau per-field. Yang berlaku:

- Siapa yang bisa membuka `/keystatic` dan menyimpan ditentukan keanggotaan project Keystatic Cloud + izin repo GitHub. Menyimpan butuh izin `WRITE`, `MAINTAIN`, atau `ADMIN`.
- Pengguna tanpa izin tulis akan diarahkan ke alur fork, bukan ditolak diam-diam.
- Untuk mewajibkan review, pasang **branch protection** di `main` (require pull request). Efeknya menyeluruh: setelah itu **semua orang**, termasuk kamu, harus lewat branch — Save langsung ke `main` akan ditolak.

Artinya: pemisahan "writer hanya boleh mengubah FAQ" tidak bisa dilakukan di Keystatic. Kalau suatu saat perlu, batasannya harus di level repo (repo konten terpisah) atau lewat proses review, bukan konfigurasi CMS.

### Batasan yang perlu diketahui

- **CMS tidak bisa dijalankan lokal.** `storage: cloud` membuat admin membaca repo GitHub, bukan file di disk. Mode `local` butuh route `/api/keystatic/*` yang berjalan on-demand, dan itu perlu SSR adapter — situs ini `output: 'static'`. Jadi perubahan skema hanya bisa dicoba di admin setelah branch-nya di-push.
- **Yang bisa dites lokal adalah situsnya**, bukan admin: `bun run dev` merender konten dari file di disk seperti biasa.
- **Editing bersamaan aman.** Storage `cloud` mengaktifkan kolaborasi real-time (Yjs), jadi dua orang bisa menyunting entri yang sama tanpa saling menimpa.

## Alur kerja kode

- Perubahan kode lewat branch `feat/<nama>` atau `fix/<nama>`, di-merge ke `main` setelah terverifikasi. `main` men-deploy otomatis, jadi jangan commit kode langsung ke sana. Edit dokumentasi boleh langsung.
- Sebelum merge: `bun run build`, `bunx astro check`, `bun test`.
- Deploy jalan lewat GitHub Actions ke VPS (nginx + certbot, lihat `deploy/README.md`), lalu cache Cloudflare di-purge otomatis.

## Lisensi

Private — internal project, tidak dipublikasikan sebagai open-source.
