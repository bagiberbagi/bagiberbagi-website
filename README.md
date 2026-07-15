# bagiberbagi.id

Landing page situs donasi bagiberbagi.id — komunitas penyalur bantuan makanan & dukungan UMKM.

## Struktur

- [bagiberbagi.dc.html](bagiberbagi.dc.html) — halaman utama, hasil export dari site builder.
- [support.js](support.js), [image-slot.js](image-slot.js) — runtime generated oleh builder. **Jangan edit manual** — akan ketimpa saat re-export.
- [content.js](content.js) — konten yang dimaksud untuk diedit manual (nomor WA, teks program, FAQ, dll) tanpa sentuh layout/logic.

## Menjalankan

Situs statis, gak ada build step. Buka [bagiberbagi.dc.html](bagiberbagi.dc.html) langsung di browser, atau serve folder ini pakai static server apa aja (mis. `npx serve .`).

## Update konten

Edit [content.js](content.js), lalu re-export/upload ulang lewat site builder sesuai alur biasa.

## Lisensi

Private — internal project, tidak dipublikasikan sebagai open-source.
