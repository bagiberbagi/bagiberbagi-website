// src/lib/format.test.ts
import { test, expect } from 'bun:test';
import { formatRupiah, calcTotal, buildWaLink, buildDonationMessage, formatProgramOptionLabel, jejakPhotoAlt } from './format';

test('formatRupiah formats with thousands separators and Rp prefix', () => {
  expect(formatRupiah(250000)).toBe('Rp 250.000');
  expect(formatRupiah(0)).toBe('Rp 0');
});

test('calcTotal multiplies pax by the price it is given', () => {
  expect(calcTotal(1, 25000)).toBe(25000);
  expect(calcTotal(10, 25000)).toBe(250000);
});

// Guards the reason the second parameter is required rather than defaulted: as
// long as two prices give two answers, 25000 cannot creep back as a fallback.
test('calcTotal follows the price, so two prices give two totals', () => {
  expect(calcTotal(10, 25000)).toBe(250000);
  expect(calcTotal(10, 40000)).toBe(400000);
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

test('buildDonationMessage asks for the package when the visitor picked a quantity but no package', () => {
  const msg = buildDonationMessage('Ramadhan Berbagi', 10, 'Rp 250.000', undefined, true);
  expect(msg).toBe(
    'Halo, saya ingin donasi program "Ramadhan Berbagi" untuk 10 pax (Total: Rp 250.000). Boleh dibantu untuk pilihan paketnya?'
  );
});

test('buildDonationMessage never asks for a package once one is chosen', () => {
  // Guards the combination that would read as nonsense: naming Takjil in the
  // same sentence that asks which package the visitor wants. The script only
  // sets askPackage while pkg is null, and this pins that down at the boundary.
  const msg = buildDonationMessage('Ramadhan Berbagi', 10, 'Rp 250.000', 'Takjil', false);
  expect(msg).not.toContain('pilihan paketnya');
});

test('buildDonationMessage leaves a single-package programme untouched', () => {
  // Jumat Berkah has nothing to pick, so this change must not alter one
  // character of its message.
  expect(buildDonationMessage('Jumat Berkah', 10, 'Rp 250.000')).toBe(
    'Halo, saya ingin donasi program "Jumat Berkah" untuk 10 pax (Total: Rp 250.000).'
  );
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
