// src/lib/format.test.ts
import { test, expect } from 'bun:test';
import { formatRupiah, calcTotal, buildWaLink, buildDonationMessage, formatProgramOptionLabel, jejakPhotoAlt } from './format';

test('formatRupiah formats with thousands separators and Rp prefix', () => {
  expect(formatRupiah(250000)).toBe('Rp 250.000');
  expect(formatRupiah(0)).toBe('Rp 0');
});

test('calcTotal multiplies pax by the fixed per-pax price of 25000', () => {
  expect(calcTotal(1)).toBe(25000);
  expect(calcTotal(10)).toBe(250000);
});

test('buildWaLink without text returns a bare wa.me link', () => {
  expect(buildWaLink('+6282233996648')).toBe('https://wa.me/+6282233996648');
});

test('buildWaLink with text URL-encodes the message', () => {
  const link = buildWaLink('+6282233996648', 'Halo, apa kabar?');
  expect(link).toBe('https://wa.me/+6282233996648?text=Halo%2C%20apa%20kabar%3F');
});

test('buildDonationMessage includes program, pax, and formatted total', () => {
  const msg = buildDonationMessage('Jumat Berkah', 10, 'Rp 250.000');
  expect(msg).toBe('Halo, saya ingin donasi program "Jumat Berkah" untuk 10 pax (Total: Rp 250.000).');
});

test('buildDonationMessage mentions the selected package when provided', () => {
  const msg = buildDonationMessage('Ramadhan Berbagi', 10, 'Rp 250.000', 'Takjil');
  expect(msg).toBe('Halo, saya ingin donasi program "Ramadhan Berbagi (Paket Takjil)" untuk 10 pax (Total: Rp 250.000).');
});

test('formatProgramOptionLabel appends "(Segera Hadir)" only when not active', () => {
  expect(formatProgramOptionLabel({ label: 'Jumat Berkah', active: true })).toBe('Jumat Berkah');
  expect(formatProgramOptionLabel({ label: 'Ramadhan Berkah', active: false })).toBe('Ramadhan Berkah (Segera Hadir)');
});

test('jejakPhotoAlt numbers each photo so one page never repeats an alt', () => {
  const title = 'Jumat Berkah bersama 46Cyclist di Dukuh Atas';
  expect(jejakPhotoAlt(title, 1)).toBe('Dokumentasi Jumat Berkah bersama 46Cyclist di Dukuh Atas, foto 1');
  expect(jejakPhotoAlt(title, 2)).toBe('Dokumentasi Jumat Berkah bersama 46Cyclist di Dukuh Atas, foto 2');
});
