// src/lib/ketentuan.test.ts
import { test, expect } from 'bun:test';
import { mergeKetentuan } from './ketentuan';

const shared = [
  { title: 'Cara donasi diproses', body: 'Lewat WhatsApp.' },
  { title: 'Laporan penyaluran', body: 'Maksimal H+1.' },
];

test('mergeKetentuan puts programme items first, then the shared ones', () => {
  const result = mergeKetentuan(shared, [{ title: 'Tenggat pesanan', body: 'Rabu sore.' }]);
  expect(result.map((i) => i.title)).toEqual([
    'Tenggat pesanan',
    'Cara donasi diproses',
    'Laporan penyaluran',
  ]);
});

test('mergeKetentuan marks where each item came from', () => {
  const result = mergeKetentuan(shared, [{ title: 'Tenggat pesanan', body: 'Rabu sore.' }]);
  expect(result.map((i) => i.scope)).toEqual(['program', 'shared', 'shared']);
});

test('a programme item replaces the shared item with the same title', () => {
  const result = mergeKetentuan(shared, [
    { title: 'Laporan penyaluran', body: 'Laporan CSR menyusul H+7.' },
  ]);
  expect(result).toEqual([
    { title: 'Laporan penyaluran', body: 'Laporan CSR menyusul H+7.', scope: 'program' },
    { title: 'Cara donasi diproses', body: 'Lewat WhatsApp.', scope: 'shared' },
  ]);
});

test('title matching ignores case, edge whitespace, and inner whitespace runs', () => {
  const result = mergeKetentuan(shared, [
    { title: '  laporan   PENYALURAN ', body: 'Versi program.' },
  ]);
  expect(result).toHaveLength(2);
  expect(result[0].body).toBe('Versi program.');
  expect(result.map((i) => i.scope)).toEqual(['program', 'shared']);
});

test('an item missing its title or its body is dropped', () => {
  const result = mergeKetentuan(
    [
      { title: 'Berisi', body: 'Ada isinya.' },
      { title: 'Tanpa isi', body: '   ' },
    ],
    [{ title: '', body: 'Isi tanpa judul.' }]
  );
  expect(result.map((i) => i.title)).toEqual(['Berisi']);
});

test('a title repeated within one block keeps the first occurrence', () => {
  const result = mergeKetentuan(
    [],
    [
      { title: 'Area penyaluran', body: 'Yang pertama.' },
      { title: 'area penyaluran', body: 'Yang kedua.' },
    ]
  );
  expect(result).toEqual([
    { title: 'Area penyaluran', body: 'Yang pertama.', scope: 'program' },
  ]);
});

test('an empty programme block leaves the shared block untouched and in order', () => {
  const result = mergeKetentuan(shared, []);
  expect(result).toEqual([
    { title: 'Cara donasi diproses', body: 'Lewat WhatsApp.', scope: 'shared' },
    { title: 'Laporan penyaluran', body: 'Maksimal H+1.', scope: 'shared' },
  ]);
});

test('two empty blocks merge to nothing, so the section can be omitted', () => {
  expect(mergeKetentuan([], [])).toEqual([]);
});
