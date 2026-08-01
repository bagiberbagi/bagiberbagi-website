/**
 * Sumber video jejak, hasil membaca satu string URL yang diisi editor.
 *
 * Tiga bentuk, dipisah berdasarkan cara menampilkannya dan bukan berdasarkan
 * penyedianya:
 *   embed — pemutar milik pihak lain (YouTube, Google Drive, Vimeo) yang
 *           dipasang lewat iframe. Halaman menunda pembuatannya sampai
 *           pengunjung menekan play, jadi yang tak menonton tak pernah
 *           menyentuh server mereka.
 *   file  — berkas video yang disajikan sendiri dari `public/uploads/jejak/`,
 *           diputar dengan pemutar bawaan peramban.
 *   link  — URL yang benar tapi tak bisa disematkan: folder Google Drive,
 *           Instagram, TikTok. Ditampilkan sebagai tautan keluar yang rapi
 *           alih-alih menghilang diam-diam, supaya editor melihat sendiri
 *           bahwa link itu tak jadi pemutar.
 *
 * Yang mengembalikan null hanyalah string yang memang bukan alamat apa pun.
 * Ini disengaja: satu entri salah tak boleh mematikan seluruh build (alasan
 * yang sama ada di `lib/assets.ts`).
 */
export type JejakVideoSource =
  | {
      kind: 'embed';
      provider: 'youtube' | 'drive' | 'vimeo';
      embedUrl: string;
      /** Halaman aslinya, untuk pengunjung yang iframe-nya diblokir. */
      watchUrl: string;
      /**
       * Apakah pemutarnya langsung jalan begitu iframe dibuat. YouTube dan Vimeo
       * menerima parameter autoplay, Drive tidak punya padanannya, jadi di Drive
       * pengunjung menekan play sekali lagi di dalam pemutar Google.
       */
      autoplay: boolean;
    }
  | { kind: 'file'; src: string }
  | { kind: 'link'; href: string; label: string };

/** Id video YouTube selalu 11 karakter dari alfabet URL-safe. */
const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Id berkas Drive panjangnya tak tetap, tapi selalu jauh di atas 10 karakter. */
const DRIVE_ID = /^[A-Za-z0-9_-]{10,}$/;

/** Id video Vimeo murni angka. */
const VIMEO_ID = /^\d+$/;

const YT_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
]);

const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com']);

const VIMEO_HOSTS = new Set(['vimeo.com', 'player.vimeo.com']);

const VIDEO_FILE = /\.(mp4|webm|ogv|mov|m4v)$/i;

/**
 * Nama ramah untuk tautan yang tak bisa disematkan. Yang tak terdaftar memakai
 * hostname-nya sendiri, jadi tabel ini tak perlu lengkap.
 */
const LINK_LABELS: Record<string, string> = {
  'drive.google.com': 'Google Drive',
  'docs.google.com': 'Google Drive',
  'photos.google.com': 'Google Foto',
  'instagram.com': 'Instagram',
  'tiktok.com': 'TikTok',
  'facebook.com': 'Facebook',
  'fb.watch': 'Facebook',
  'x.com': 'X',
  'twitter.com': 'X',
};

/**
 * Rapikan apa yang ditempel editor sebelum diurai. Yang ikut tersalin dari chat
 * atau dokumen biasanya salah satu dari: spasi di ujung, tanda kurung atau
 * kutip pembungkus, tanda baca penutup kalimat, dan hilangnya `https://` karena
 * bilah alamat peramban memang menyembunyikannya.
 */
function normalize(raw: string): string {
  const trimmed = raw.trim().replace(/^[<"'([]+/, '').replace(/[>"')\].,;]+$/, '');
  if (!trimmed) return '';
  // Path relatif ke berkas sendiri dibiarkan apa adanya.
  if (trimmed.startsWith('/')) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Hostname tanpa `www.`, supaya pencocokan tabel di atas tak perlu dua entri. */
function bareHost(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

/**
 * Ambil id video dari sebuah URL YouTube. Menangani bentuk yang benar-benar
 * muncul saat orang menyalin dari aplikasi: tombol Bagikan (`youtu.be/ID`),
 * bilah alamat desktop (`/watch?v=ID`), Shorts (`/shorts/ID`), siaran langsung
 * (`/live/ID`), dan kode embed (`/embed/ID`). Query tambahan seperti `?t=30`,
 * `&list=`, atau `?si=` diabaikan sendiri oleh URL parser.
 */
function youtubeId(url: URL): string | null {
  if (bareHost(url) === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return YT_ID.test(id) ? id : null;
  }

  const v = url.searchParams.get('v');
  if (v && YT_ID.test(v)) return v;

  const [prefix, id] = url.pathname.split('/').filter(Boolean);
  if (id && YT_ID.test(id) && ['embed', 'shorts', 'live', 'v'].includes(prefix)) return id;
  return null;
}

/**
 * Ambil id berkas dari URL Google Drive. Yang diterima cuma link ke satu berkas:
 * `/file/d/ID/view` (bentuk yang keluar dari tombol Bagikan), `/file/d/ID/preview`,
 * serta bentuk lama `?id=ID`. Link `/drive/folders/ID` sengaja tidak cocok, dan
 * jatuh jadi tautan keluar.
 */
function driveId(url: URL): string | null {
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments[0] === 'file' && segments[1] === 'd' && segments[2] && DRIVE_ID.test(segments[2])) {
    return segments[2];
  }
  const id = url.searchParams.get('id');
  return id && DRIVE_ID.test(id) ? id : null;
}

/** `vimeo.com/76979871` dan `player.vimeo.com/video/76979871`. */
function vimeoId(url: URL): string | null {
  const segments = url.pathname.split('/').filter(Boolean);
  const candidate = segments[0] === 'video' ? segments[1] : segments[0];
  return candidate && VIMEO_ID.test(candidate) ? candidate : null;
}

/**
 * Baca string URL dari frontmatter menjadi sumber video yang siap dirender.
 * Mengembalikan null hanya untuk string kosong dan untuk teks yang bukan alamat
 * sama sekali, jadi pemanggil cukup memeriksa null alih-alih menebak isinya.
 */
export function parseVideoUrl(url?: string | null): JejakVideoSource | null {
  const raw = normalize(url ?? '');
  if (!raw) return null;

  // Berkas yang disajikan sendiri biasanya ditulis sebagai path relatif
  // ('/uploads/jejak/klip.mp4') yang bukan URL absolut, jadi diperiksa duluan.
  if (raw.startsWith('/')) return VIDEO_FILE.test(raw) ? { kind: 'file', src: raw } : null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  // Tanpa titik di hostname, yang ditempel bukan alamat melainkan sepotong teks
  // yang kebetulan lolos karena normalize() menambahkan skema di depannya.
  if (!parsed.hostname.includes('.')) return null;

  const host = bareHost(parsed);

  if (YT_HOSTS.has(host)) {
    const id = youtubeId(parsed);
    if (id) {
      return {
        kind: 'embed',
        provider: 'youtube',
        // Domain nocookie + autoplay: iframe baru dibuat setelah pengunjung
        // menekan play, jadi autoplay di sini berarti "langsung jalan begitu
        // diminta", bukan memutar sendiri saat halaman dibuka.
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
        autoplay: true,
      };
    }
  }

  if (DRIVE_HOSTS.has(host)) {
    const id = driveId(parsed);
    if (id) {
      return {
        kind: 'embed',
        provider: 'drive',
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        watchUrl: `https://drive.google.com/file/d/${id}/view`,
        autoplay: false,
      };
    }
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = vimeoId(parsed);
    if (id) {
      return {
        kind: 'embed',
        provider: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
        watchUrl: `https://vimeo.com/${id}`,
        autoplay: true,
      };
    }
  }

  if (VIDEO_FILE.test(parsed.pathname)) return { kind: 'file', src: raw };

  // Alamatnya benar, pemutarnya yang tak bisa dipasang di halaman.
  return { kind: 'link', href: raw, label: LINK_LABELS[host] ?? host };
}
