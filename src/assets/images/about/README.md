# Foto halaman Tentang Kami

Drop file foto ke folder ini dengan **nama persis** di bawah, lalu simpan.
Halaman `/tentang` otomatis nampilin & optimasi. Kalau file belum ada, slot
tampil placeholder abu — jadi aman kosong.

Ekstensi bebas: `.jpg` `.jpeg` `.png` `.webp` `.avif` (pilih salah satu per nama).

## Hero (kolase kanan, atas)

| Nama file  | Posisi                | Bentuk         | Rasio ideal |
|------------|-----------------------|----------------|-------------|
| `hero-1.*` | kolom kiri            | pill tinggi    | ~ 4 : 9 (potret sempit) |
| `hero-2.*` | kolom tengah, atas    | lingkaran      | 1 : 1 (kotak) |
| `hero-3.*` | kolom tengah, bawah   | pill           | 3 : 4 (potret) |
| `hero-4.*` | kolom kanan, atas     | pill           | 3 : 4 (potret) |
| `hero-5.*` | kolom kanan, bawah    | lingkaran      | 1 : 1 (kotak) |

## Section "Nilai yang Kami Pegang"

| Nama file  | Posisi        | Bentuk           | Rasio ideal |
|------------|---------------|------------------|-------------|
| `nilai.*`  | foto kiri     | kartu rounded    | 4 : 3 (lanskap) |

Foto di-crop `object-cover` mengikuti bentuk slot, jadi tak perlu presisi —
tapi makin dekat ke rasio ideal makin sedikit ke-crop.
