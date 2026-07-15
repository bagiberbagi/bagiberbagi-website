# bagiberbagi.id

Landing page situs donasi bagiberbagi.id — komunitas penyalur bantuan makanan & dukungan UMKM.

Dibangun dengan [Astro](https://astro.build) + Tailwind CSS, static output (no backend).

## Menjalankan

```bash
bun install
bun run dev       # dev server, http://localhost:4321
bun run build     # build ke dist/
bun run preview   # preview hasil build
bun test          # unit test src/lib/format.ts
```

## Struktur

- `src/pages/index.astro` — halaman utama, merangkai semua section dari `src/components/`.
- `src/consts.ts` — data situs (program, fitur, langkah, dampak, FAQ, footer nav).
- `src/content/legal/` — dokumen legal (kebijakan privasi, syarat & ketentuan, transparansi) sebagai Astro Content Collection.
- `src/lib/format.ts` — helper format Rupiah & link WhatsApp, diuji di `format.test.ts`.
- `src/scripts/` — JS interaktif per fitur (mobile nav, scrollspy, ticker, kalkulator donasi, FAQ accordion, dll).
- `legacy/` — situs lama (export dari site builder), disimpan untuk referensi, tidak lagi dipakai.

## Update konten

Edit `src/consts.ts` untuk data section (program/fitur/langkah/dampak/FAQ/footer), atau markdown di `src/content/legal/` untuk dokumen legal.

## Lisensi

Private — internal project, tidak dipublikasikan sebagai open-source.
