# Komponen parkir

Komponen di folder ini **tidak dipakai halaman mana pun**. Mereka disimpan di sini,
bukan dihapus, karena isinya masih mungkin dibutuhkan dan menghapusnya berarti
kehilangan desain yang sudah jadi.

Awalan garis bawah pada nama folder cuma penanda untuk manusia. Astro hanya
membuat rute dari `src/pages/`, jadi komponen di mana pun tidak akan tayang
selama tidak ada yang mengimpornya. Berkas di sini tetap ikut `astro check` dan
`bun run build`, jadi kalau ada yang menghapus `lib` atau token yang mereka
pakai, ketahuan saat itu juga, bukan nanti saat mau dipakai lagi.

## Isi dan alasan diparkir

| Komponen | Kenapa dilepas dari beranda |
|---|---|
| `DonationCalculator.astro` | dilebur ke kartu hero, yang sekarang memegang pemilih porsi dan anchor `#donasi` |
| `Stats.astro` | band angka belum dibutuhkan di beranda |
| `ProgramFeatures.astro` | pesannya sudah dibawa seksi Masalah dan Solusi |
| `ProgramHighlights.astro` | program aktif sekarang hidup di kartu hero. **Baca catatan di bawah** |
| `PintuSection.astro` | digantikan `VisionSection.astro` yang memakai `id="pintu"` yang sama |
| `HowItWorks.astro` | alurnya sudah dijelaskan garis alur di `SolutionSection.astro`, yang juga mewarisi `id="cara-kerja"` |
| `JoinUs.astro` | digantikan `ClosingSection.astro`, penutup pemilih peran |
| `NextFridayChip.astro` | chip hitung mundur dari hero lama, sengaja disimpan untuk dipakai di tempat lain |
| `JejakTerbaru.astro` | disembunyikan sejak sebelum revamp, desainnya belum selaras dengan beranda |

## Catatan penting soal `ProgramHighlights`

Komponen ini **satu-satunya pembaca koleksi `home`** (panel "Beranda" di Keystatic,
lewat `src/lib/home.ts`). Selama ia diparkir, panel itu ada di admin tapi tidak
menyetir apa pun di situs. Kalau nanti diputuskan komponen ini benar-benar tidak
dipakai lagi, koleksi `home`, `src/lib/home.ts`, dan entri Keystatic-nya perlu
ikut dibereskan supaya editor tidak mengisi field yang tidak berefek.

## Kalau mau dipakai lagi

Pindahkan berkasnya naik satu tingkat ke `src/components/`, lalu kembalikan jalur
impornya dari `../../` ke `../` dan dari `../Container.astro` ke `./Container.astro`.
Jalur itu satu-satunya yang berubah saat komponen dipindahkan ke sini.
