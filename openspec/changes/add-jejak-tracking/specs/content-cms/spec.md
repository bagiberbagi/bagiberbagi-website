## ADDED Requirements

### Requirement: Collection jejak editor-managed di Keystatic

Model CMS SHALL menambah collection `jejak` yang dikelola editor lewat Keystatic dan dibaca Astro lewat content config. Tiap entry adalah satu file `.mdoc`, dengan relasi ke collection `programs`, upload gambar ke `public/uploads/jejak`, dan body prosa via `contentField`. `content.config.ts` dan `keystatic.config.ts` MUST sepakat pada ekstensi `.mdoc`.

#### Scenario: Editor menambah jejak dari admin UI

- **WHEN** editor membuka `/keystatic`, memilih collection Jejak, dan menyimpan entry baru dengan program terpilih, tanggal, metrics, cover, galeri, dan body
- **THEN** file `.mdoc` tertulis di `src/content/jejak/` dengan `program` mengacu slug program yang dipilih
- **AND** Astro membacanya lewat collection `jejak` di `content.config.ts` tanpa mismatch ekstensi

#### Scenario: Field gambar dikosongkan

- **WHEN** editor mengosongkan field `cover` atau sebuah item galeri
- **THEN** Keystatic menulis `null`, dan skema zod menerimanya (`.nullish()`) tanpa gagal validasi build

#### Scenario: Relasi program menjaga sumber tunggal

- **WHEN** editor memilih program untuk sebuah jejak
- **THEN** jejak menyimpan hanya referensi slug program, bukan menyalin label/pintu/summary program
- **AND** pintu serta metadata program tetap dibaca dari collection `programs`
