// src/lib/geo.test.ts
import { test, expect } from 'bun:test';
import { parseCoordinates, mapsLinkUrl, formatCoordinates } from './geo';

const DUKUH_ATAS = { lat: -6.2010276, lng: 106.822831 };

test('parseCoordinates returns null for empty and missing input', () => {
  expect(parseCoordinates('')).toBeNull();
  expect(parseCoordinates('   ')).toBeNull();
  expect(parseCoordinates(null)).toBeNull();
  expect(parseCoordinates(undefined)).toBeNull();
});

test('parseCoordinates reads the pair copied from "Salin koordinat"', () => {
  expect(parseCoordinates('-6.2010276, 106.8228310')).toEqual(DUKUH_ATAS);
  expect(parseCoordinates('-6.2010276,106.8228310')).toEqual(DUKUH_ATAS);
  expect(parseCoordinates('  -6.2010276   106.8228310  ')).toEqual(DUKUH_ATAS);
});

test('parseCoordinates reads a Google Maps URL pasted as-is', () => {
  const url = 'https://www.google.com/maps/place/Taman+Dukuh+Atas/@-6.2010276,106.822831,17z';
  expect(parseCoordinates(url)).toEqual(DUKUH_ATAS);
});

test('parseCoordinates prefers the pin over the viewport centre when both are present', () => {
  // `@` adalah titik tengah layar saat URL disalin; `!3d!4d` adalah pin aslinya.
  const url = 'https://www.google.com/maps/place/X/@-6.1,106.7,17z/data=!3m1!4b1!4m5!3d-6.2010276!4d106.822831';
  expect(parseCoordinates(url)).toEqual(DUKUH_ATAS);
});

test('parseCoordinates reads the older ?q=lat,lng share link', () => {
  expect(parseCoordinates('https://maps.google.com/?q=-6.2010276,106.822831')).toEqual(DUKUH_ATAS);
});

test('parseCoordinates rejects numbers outside the valid latitude and longitude range', () => {
  expect(parseCoordinates('91, 10')).toBeNull();
  expect(parseCoordinates('-6.2, 181')).toBeNull();
});

test('parseCoordinates returns null for text carrying no coordinate pair', () => {
  expect(parseCoordinates('Taman MRT Dukuh Atas')).toBeNull();
  expect(parseCoordinates('https://www.google.com/maps/place/Taman+Dukuh+Atas')).toBeNull();
});

test('mapsLinkUrl points at Google Maps search for navigation', () => {
  expect(mapsLinkUrl(DUKUH_ATAS)).toBe(
    'https://www.google.com/maps/search/?api=1&query=-6.2010276%2C106.822831'
  );
});

test('formatCoordinates rounds to five decimals so it reads as text, not data', () => {
  expect(formatCoordinates(DUKUH_ATAS)).toBe('-6.20103, 106.82283');
});
