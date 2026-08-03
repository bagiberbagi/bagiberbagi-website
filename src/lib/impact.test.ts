// src/lib/impact.test.ts
import { test, expect } from 'bun:test';
import { aggregateMetrics } from './impact';

test('aggregateMetrics sums values that share a label', () => {
  const result = aggregateMetrics([
    [{ label: 'porsi', value: 120 }],
    [{ label: 'porsi', value: 80 }],
  ]);
  expect(result).toEqual([{ label: 'porsi', value: 200 }]);
});

test('aggregateMetrics normalises label casing and whitespace when grouping', () => {
  const result = aggregateMetrics([
    [{ label: 'Porsi', value: 120 }],
    [{ label: ' porsi ', value: 80 }],
  ]);
  expect(result).toEqual([{ label: 'Porsi', value: 200 }]);
});

test('aggregateMetrics keeps the first-seen original label casing', () => {
  const result = aggregateMetrics([
    [{ label: 'Penerima', value: 10 }],
    [{ label: 'penerima', value: 5 }],
  ]);
  expect(result[0].label).toBe('Penerima');
});

test('aggregateMetrics preserves first-appearance order across lists', () => {
  const result = aggregateMetrics([
    [
      { label: 'porsi', value: 120 },
      { label: 'penerima', value: 96 },
    ],
    [
      { label: 'relawan', value: 6 },
      { label: 'porsi', value: 40 },
    ],
  ]);
  expect(result).toEqual([
    { label: 'porsi', value: 160 },
    { label: 'penerima', value: 96 },
    { label: 'relawan', value: 6 },
  ]);
});

test('aggregateMetrics returns an empty array for empty input', () => {
  expect(aggregateMetrics([])).toEqual([]);
  expect(aggregateMetrics([[]])).toEqual([]);
});

// getOrganisasiImpact (impact.ts) memanggil aggregateMetrics persis seperti
// getProgramImpact, hanya jejak sumbernya sudah difilter lintas program
// berbeda oleh getJejakByOrganisasi (yang mengandalkan astro:content, jadi
// tak diuji unit di sini — lihat komentar impact.ts). Yang diuji di bawah
// adalah skenario spec: sum-by-label tetap benar walau jejak-nya berasal
// dari program yang berbeda-beda, sebab organisasi menempel lintas program.
test('aggregateMetrics sums a single organisasi\'s jejak spanning different programs', () => {
  const result = aggregateMetrics([
    [{ label: 'porsi', value: 50 }], // jejak di bawah program Community Giving
    [{ label: 'porsi', value: 30 }], // jejak di bawah program Ramadhan Berbagi
  ]);
  expect(result).toEqual([{ label: 'porsi', value: 80 }]);
});
