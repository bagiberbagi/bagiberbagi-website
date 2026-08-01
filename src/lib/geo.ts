/**
 * Titik lokasi jejak, dibaca dari satu string yang diisi editor.
 *
 * Sama seperti `lib/video.ts`, yang disimpan adalah apa yang ditempel editor,
 * bukan bentuk yang sudah rapi. Yang paling sering ditempel ada dua: sepasang
 * angka hasil "Salin koordinat" di Google Maps, dan URL halaman Google Maps
 * apa adanya. Keduanya diterima.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Satu titik penyaluran: koordinat plus nama tempat yang dibaca manusia. */
export interface MapPoint extends LatLng {
  label: string;
}

/** Sepasang angka desimal, dipisah koma atau spasi. */
const PAIR = /^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/;

/** Bagian `@-6.2010,106.8228,17z` di URL Google Maps. */
const AT_PIN = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;

/** Bagian `!3d-6.2010!4d106.8228` di URL Google Maps bentuk panjang. */
const BANG_PIN = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/;

function valid(lat: number, lng: number): LatLng | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/**
 * Baca koordinat dari apa pun yang ditempel editor. Mengembalikan null kalau
 * tak ada pasangan angka yang masuk akal di dalamnya, jadi halaman cukup
 * memeriksa null alih-alih menebak bentuk isinya.
 *
 * Urutan pemeriksaan penting: `!3d!4d` menandai pin yang sebenarnya, sedangkan
 * `@` menandai titik tengah layar saat URL itu disalin. Kalau keduanya ada,
 * yang menandai pin lebih tepat.
 */
export function parseCoordinates(raw?: string | null): LatLng | null {
  const text = raw?.trim();
  if (!text) return null;

  const pair = text.match(PAIR);
  if (pair) return valid(Number(pair[1]), Number(pair[2]));

  const bang = text.match(BANG_PIN);
  if (bang) return valid(Number(bang[1]), Number(bang[2]));

  const at = text.match(AT_PIN);
  if (at) return valid(Number(at[1]), Number(at[2]));

  // Bentuk `?q=lat,lng` yang keluar dari tautan berbagi lama.
  const q = text.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (q) return valid(Number(q[1]), Number(q[2]));

  return null;
}

/** Tautan keluar untuk yang mau menavigasi ke sana, bukan sekadar melihat. */
export function mapsLinkUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
}

/** Ditampilkan sebagai teks pendamping, dibulatkan supaya tak jadi deretan angka. */
export function formatCoordinates({ lat, lng }: LatLng): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
