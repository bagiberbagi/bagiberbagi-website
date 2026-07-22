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
