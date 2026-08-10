// src/lib/aksi.test.ts
//
// Yang diuji di sini bukan bentuk yang enak dibayangkan, melainkan bentuk yang
// BENAR-BENAR ditulis Keystatic ke disk, disalin dari spike Track B (B4.1) yang
// dilewatkan ke `createReader()` milik Keystatic sendiri. Perbedaannya penting:
// field yang kosong itu kunci yang hilang, bukan null, jadi hampir semua kasus
// di bawah ini punya kunci yang memang tidak ada.
import { test, expect } from 'bun:test';
import { readAksi, resolvePintuHref, type RawAksiItem } from './aksi';
import type { Program } from './programs';

/**
 * Jalankan sesuatu sambil menangkap `console.warn`.
 *
 * Dua gunanya sekaligus. Log `bun test` tetap bersih, dan yang lebih penting:
 * peringatannya ikut jadi hal yang diuji. Spec-nya menyebut peringatan itu
 * menyebut nama pintu dan judul aksinya, dan tanpa ini tak ada satu tes pun
 * yang memeriksa apakah itu benar.
 */
function withWarnings<T>(run: () => T): { result: T; warnings: string[] } {
  const original = console.warn;
  const warnings: string[] = [];
  console.warn = (...args: unknown[]) => void warnings.push(args.join(' '));
  try {
    return { result: run(), warnings };
  } finally {
    console.warn = original;
  }
}

function program(over: Partial<Program> = {}): Program {
  return {
    slug: 'jumat-berkah',
    label: 'Jumat Berkah',
    pintu: 'food',
    order: 1,
    active: true,
    image: null,
    summary: 'Nasi kotak tiap Jumat.',
    stage: {
      kicker: '',
      lead: '',
      status: '',
      caption: '',
      ctaLabel: 'Lihat program',
      ctaWhatsapp: false,
      ctaMessage: '',
    },
    detail: { eyebrow: 'PROGRAM AKTIF', description: 'Ada.', features: [] },
    href: '/program/jumat-berkah/',
    ...over,
  };
}

const bySlug = new Map([['jumat-berkah', program()]]);

// ===== C3.1 — tiga bentuk mentah dari B4.1 =====

test('readAksi memipihkan discriminant "none", yang di disk tak punya kunci value sama sekali', () => {
  const items: RawAksiItem[] = [
    { title: 'Aksi none', showOnPintu: true, mechanism: { discriminant: 'none' } },
  ];
  const [aksi] = readAksi('food', items, bySlug);
  expect(aksi!.mechanism).toEqual({ kind: 'none' });
  expect(aksi!.program).toBeNull();
  expect(aksi!.desc).toBe('');
});

test('readAksi memipihkan discriminant "conversation"', () => {
  const items: RawAksiItem[] = [
    {
      title: 'Aksi conversation',
      desc: 'Punya surplus makanan layak?',
      showOnPintu: true,
      mechanism: {
        discriminant: 'conversation',
        value: { message: 'Halo, saya punya surplus makanan.' },
      },
    },
  ];
  const [aksi] = readAksi('food', items, bySlug);
  expect(aksi!.mechanism).toEqual({
    kind: 'conversation',
    message: 'Halo, saya punya surplus makanan.',
  });
  expect(aksi!.desc).toBe('Punya surplus makanan layak?');
});

test('readAksi memipihkan discriminant "quantity" dan menyelesaikan programnya jadi entri, bukan slug', () => {
  const items: RawAksiItem[] = [
    {
      title: 'Aksi quantity',
      program: 'jumat-berkah',
      showOnPintu: false,
      mechanism: {
        discriminant: 'quantity',
        value: { unit: 'porsi', pricePerUnit: 25000, presets: [10, 20, 50], packages: [] },
      },
    },
  ];
  const [aksi] = readAksi('food', items, bySlug);
  expect(aksi!.mechanism).toEqual({
    kind: 'quantity',
    unit: 'porsi',
    pricePerUnit: 25000,
    presets: [10, 20, 50],
    packages: [],
  });
  expect(aksi!.program?.label).toBe('Jumat Berkah');
  expect(aksi!.showOnPintu).toBe(false);
});

test('showOnPintu yang tidak ditulis dianggap true', () => {
  const [aksi] = readAksi('goods', [{ title: 'X', mechanism: { discriminant: 'none' } }], bySlug);
  expect(aksi!.showOnPintu).toBe(true);
});

// ===== C3.2 — tiap penurunan di C1.5, dan tak satu pun melempar =====

test('harga per satuan yang hilang menurunkan mekanismenya jadi percakapan, bukan melempar', () => {
  const items: RawAksiItem[] = [
    {
      title: 'Jumlah tanpa harga',
      program: 'jumat-berkah',
      mechanism: { discriminant: 'quantity', value: { presets: [], packages: [] } },
    },
  ];
  const { result, warnings } = withWarnings(() => readAksi('food', items, bySlug));
  expect(result[0]!.mechanism).toEqual({
    kind: 'conversation',
    message: 'Halo, saya ingin mendiskusikan program Jumat Berkah.',
  });
  // Peringatannya harus menyebut pintu dan judul aksinya, karena itu satu-satunya
  // petunjuk yang dipunya editor untuk menemukan entri mana yang salah.
  expect(warnings).toHaveLength(1);
  expect(warnings[0]).toContain('food');
  expect(warnings[0]).toContain('Jumlah tanpa harga');
});

test('harga nol dan harga negatif diperlakukan sama dengan harga yang hilang', () => {
  for (const pricePerUnit of [0, -1]) {
    const { result } = withWarnings(() =>
      readAksi(
        'food',
        [{ title: 'A', program: 'jumat-berkah', mechanism: { discriminant: 'quantity', value: { pricePerUnit } } }],
        bySlug
      )
    );
    expect(result[0]!.mechanism.kind).toBe('conversation');
  }
});

test('pilihan cepat kosong tetap kosong — TIDAK diisi diam-diam dengan [6, 12, 20]', () => {
  const { result, warnings } = withWarnings(() =>
    readAksi(
      'food',
      [
        {
          title: 'Tanpa preset',
          program: 'jumat-berkah',
          mechanism: { discriminant: 'quantity', value: { pricePerUnit: 25000, presets: [] } },
        },
      ],
      bySlug
    )
  );
  expect(result[0]!.mechanism).toMatchObject({ kind: 'quantity', presets: [] });
  expect(warnings[0]).toContain('Tanpa preset');
});

test('preset yang bukan angka positif dibuang, sisanya dipertahankan urutannya', () => {
  const { result } = withWarnings(() =>
    readAksi(
      'food',
      [
        {
          title: 'Preset campur',
          program: 'jumat-berkah',
          mechanism: {
            discriminant: 'quantity',
            value: { pricePerUnit: 25000, presets: [20, null, 0, -5, 6] },
          },
        },
      ],
      bySlug
    )
  );
  expect(result[0]!.mechanism).toMatchObject({ presets: [20, 6] });
});

test('satuan kosong jatuh ke "porsi"', () => {
  const { result } = withWarnings(() =>
    readAksi(
      'food',
      [
        {
          title: 'Tanpa satuan',
          program: 'jumat-berkah',
          mechanism: { discriminant: 'quantity', value: { pricePerUnit: 25000, unit: '' } },
        },
      ],
      bySlug
    )
  );
  expect(result[0]!.mechanism).toMatchObject({ unit: 'porsi' });
});

test('rujukan program yang basi jadi null tapi aksinya tetap hidup dengan judul dan deskripsinya', () => {
  const items: RawAksiItem[] = [
    {
      title: 'Program sudah dihapus',
      desc: 'Kalimatnya masih benar.',
      program: 'program-yang-sudah-dihapus',
      mechanism: { discriminant: 'conversation', value: { message: 'Halo.' } },
    },
  ];
  const { result, warnings } = withWarnings(() => readAksi('food', items, bySlug));
  expect(result[0]!.program).toBeNull();
  expect(result[0]!.title).toBe('Program sudah dihapus');
  expect(result[0]!.desc).toBe('Kalimatnya masih benar.');
  expect(warnings[0]).toContain('program-yang-sudah-dihapus');
});

test('discriminant yang tidak dikenal jadi "none", bukan lemparan', () => {
  const { result, warnings } = withWarnings(() =>
    readAksi('food', [{ title: 'Aneh', mechanism: { discriminant: 'entah-apa' } }], bySlug)
  );
  expect(result[0]!.mechanism).toEqual({ kind: 'none' });
  // Ini satu-satunya penurunan yang TIDAK memperingatkan: "none" adalah
  // keadaan yang sah, dan discriminant asing cuma bisa lahir dari suntingan
  // tangan di git, bukan dari admin.
  expect(warnings).toHaveLength(0);
});

// ===== C3.3 — kelima baris tabel C1.6 =====

function aksiWith(mechanism: RawAksiItem['mechanism'], programSlug?: string) {
  return withWarnings(
    () => readAksi('food', [{ title: 'Uji', program: programSlug, mechanism }], bySlug)[0]!
  ).result;
}

const WA = '628123456789';

test('resolvePintuHref: none tidak menghasilkan tombol', () => {
  expect(resolvePintuHref(aksiWith({ discriminant: 'none' }), WA)).toBeNull();
});

test('resolvePintuHref: conversation membuka WhatsApp dengan pesannya', () => {
  const href = resolvePintuHref(
    aksiWith({ discriminant: 'conversation', value: { message: 'Halo, saya mau ikut.' } }),
    WA
  );
  expect(href).toContain('wa.me/628123456789');
  expect(href).toContain(encodeURIComponent('Halo, saya mau ikut.'));
});

test('resolvePintuHref: conversation tanpa pesan tidak menghasilkan tombol', () => {
  expect(resolvePintuHref(aksiWith({ discriminant: 'conversation', value: {} }), WA)).toBeNull();
});

test('resolvePintuHref: quantity melempar ke kartu donasi halaman programnya, bukan ke WhatsApp', () => {
  const href = resolvePintuHref(
    aksiWith({ discriminant: 'quantity', value: { pricePerUnit: 25000, presets: [6] } }, 'jumat-berkah'),
    WA
  );
  expect(href).toBe('/program/jumat-berkah/#donasi');
});

test('resolvePintuHref: quantity tanpa program tidak menghasilkan tombol', () => {
  const aksi = aksiWith({ discriminant: 'quantity', value: { pricePerUnit: 25000 } });
  const { result, warnings } = withWarnings(() => resolvePintuHref(aksi, WA));
  expect(result).toBeNull();
  expect(warnings[0]).toContain('Uji');
});

// C1.7: program tak aktif tak punya href, dan tanpa penjagaan ini halaman pintu
// yang tayang akan mencetak string harfiah "undefined#donasi".
test('resolvePintuHref: program yang belum punya halaman sendiri tidak pernah jadi "undefined#donasi"', () => {
  const dormant = new Map([['ramadhan-berbagi', program({ slug: 'ramadhan-berbagi', label: 'Ramadhan Berbagi', active: false, href: undefined })]]);
  const aksi = withWarnings(
    () =>
      readAksi(
        'food',
        [
          {
            title: 'Uji',
            program: 'ramadhan-berbagi',
            mechanism: { discriminant: 'quantity', value: { pricePerUnit: 25000, presets: [6] } },
          },
        ],
        dormant
      )[0]!
  ).result;

  const { result: href, warnings } = withWarnings(() => resolvePintuHref(aksi, WA));
  expect(href).toBeNull();
  expect(href).not.toBe('undefined#donasi');
  expect(warnings[0]).toContain('ramadhan-berbagi');
});
