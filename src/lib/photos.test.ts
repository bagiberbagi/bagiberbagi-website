import { test, expect } from 'bun:test';
import type { ImageMetadata } from 'astro';
import { dedupePhotos, type JejakPhoto } from './photos';

/**
 * Modul gambar tiruan. Isinya tak penting; yang diuji adalah IDENTITAS objek,
 * karena itulah yang dipakai `dedupePhotos` sebagai kunci. Dua tiruan dengan
 * `src` sama tapi objek berbeda harus tetap dianggap dua foto berbeda, dan itu
 * disengaja: membandingkan lewat `img.src` akan menandai berkas aslinya
 * "terpakai langsung" dan menyalin berkas mentahnya ke dist.
 */
function fakeImage(src: string): ImageMetadata {
  return { src, width: 1600, height: 900, format: 'webp' } as ImageMetadata;
}

function photo(img: ImageMetadata, alt: string, caption: string | null = null): JejakPhoto {
  return { img, alt, caption };
}

test('foto kembar dibuang dan entri PERTAMA yang bertahan', () => {
  const sama = fakeImage('/dokumentasi.webp');
  const lain = fakeImage('/lainnya.webp');

  const hasil = dedupePhotos([
    photo(sama, 'alt milik cover', 'caption milik cover'),
    photo(lain, 'alt foto kedua'),
    photo(sama, 'alt milik galeri', 'caption milik galeri'),
  ]);

  expect(hasil).toHaveLength(2);
  // Inti aturannya: keterangan cover tidak boleh ditimpa entri galeri.
  expect(hasil[0].alt).toBe('alt milik cover');
  expect(hasil[0].caption).toBe('caption milik cover');
  expect(hasil[1].alt).toBe('alt foto kedua');
});

test('cover yang muncul lagi di galeri tetap di posisi pertama', () => {
  const cover = fakeImage('/cover.webp');
  const a = fakeImage('/a.webp');
  const b = fakeImage('/b.webp');

  const hasil = dedupePhotos([photo(cover, 'cover'), photo(a, 'a'), photo(cover, ''), photo(b, 'b')]);

  expect(hasil.map((p) => p.alt)).toEqual(['cover', 'a', 'b']);
});

test('entri kosong dibuang tanpa menggeser sisanya', () => {
  const a = fakeImage('/a.webp');
  const b = fakeImage('/b.webp');

  const hasil = dedupePhotos([null, photo(a, 'a'), undefined, photo(b, 'b'), null]);

  expect(hasil.map((p) => p.alt)).toEqual(['a', 'b']);
});

test('dua modul berbeda dengan src sama tetap dihitung dua foto', () => {
  const hasil = dedupePhotos([
    photo(fakeImage('/sama.webp'), 'pertama'),
    photo(fakeImage('/sama.webp'), 'kedua'),
  ]);

  expect(hasil).toHaveLength(2);
});

test('deret kosong menghasilkan deret kosong, bukan error', () => {
  expect(dedupePhotos([])).toEqual([]);
  expect(dedupePhotos([null, undefined])).toEqual([]);
});
