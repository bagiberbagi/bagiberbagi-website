# Copy and identity for the six pintu

Drafted by Claude at the owner's instruction ("kamu aja dlu"), to be edited rather than approved
as-is. Every line here is a starting point the owner can overwrite; none of it is load-bearing on
the design.

## Colours: nothing new is introduced

The owner asked to adapt from what already ships rather than invent. All six existing trios are
reused, reassigned to the pintu whose meaning they already suit.

The "inherits from" column names the **old** pintu id whose palette is being taken over. Note that
Pangan both inherits from `food` and keeps `food` as its own id — the one case where nothing moves
at all.

| New pintu | Inherits from | `color` | `colorTint` | `colorDeep` | why |
|---|---|---|---|---|---|
| Pangan | `food` | `#C4701C` | `#FDEEE1` | `#A05C17` | direct successor; amber already reads as food |
| Pendidikan | `space` | `#1478D0` | `#DBF2F8` | `#126DBD` | blue is the conventional education accent |
| Kesehatan | `money` | `#12A472` | `#DCF3E4` | `#0D7B55` | teal-green is the conventional care accent |
| Pemberdayaan | `goods` | `#7C4DDA` | `#ECE6FB` | `#5E33B0` | purple reads as enterprise rather than charity |
| Kemanusiaan | `time` | `#DF2AA3` | `#FBE4EE` | `#C11D8A` | the most urgent hue left in the set |
| Lingkungan | `tree` | `#4C9C2E` | `#EDF4DB` | `#3D7C25` | direct successor; leaf green |

**The two-greens problem is already solved and stays solved.** `src/consts.ts` carries a comment
explaining that `tree` was given leaf green rather than emerald precisely because `money`'s
`#12A472` leans teal, and two greens of neighbouring hue read as one pintu on the homepage map.
Kesehatan inherits that teal and Lingkungan that leaf green — so the pairing that ships today is
reproduced exactly, already tuned.

**One weak spot, stated rather than hidden.** Kemanusiaan takes magenta because it is the most
urgent hue remaining, but emergency reads as red in most conventions. It costs nothing to start
here and revisit once the pintu has real content; nothing else in the palette depends on it.

## Icons: two new, four reused

`Icon.astro` already carries `food`, `heart`, `money`, and `tree`:

| Pintu | Icon | Status |
|---|---|---|
| Pangan | `food` | reuse |
| Kesehatan | `heart` | reuse |
| Pemberdayaan | `money` | reuse — capital and tools |
| Lingkungan | `tree` | reuse |
| Pendidikan | `book` | **new** |
| Kemanusiaan | `shield` or cupped hands | **new** |

The earlier estimate of four new icons was too pessimistic; only two are actually missing.

## A constraint the copy has to respect

Four of six pintu have no active programme. The copy below therefore **describes intent without
claiming a track record** for those four — no counts, no "setiap pekan", no implied history.
Only Pangan and Pemberdayaan speak from evidence, because only they have any.

Where a page says a thing is running, that must be true on the day it ships.

---

## Pangan

- **label** — Pangan
- **tagline** — Makanan bergizi dari dapur warga sampai ke meja yang menantinya, setiap pekan.
- **blurb** — Makanan bergizi, rutin dan terdokumentasi.
- **title / h1** — Bantuan Pangan
- **seoDescription** (150) — Bantuan pangan lewat bagiberbagi.id: paket makanan bergizi dan sembako dari dapur UMKM lokal untuk keluarga prasejahtera, dengan bukti penyaluran H+1.

## Pendidikan

- **label** — Pendidikan
- **tagline** — Biaya, buku, dan perlengkapan supaya tidak ada anak yang berhenti belajar.
- **blurb** — Biaya dan perlengkapan agar belajar tak putus.
- **title / h1** — Donasi Pendidikan
- **seoDescription** (131) — Donasi pendidikan lewat bagiberbagi.id: beasiswa, buku, dan perlengkapan sekolah untuk pelajar yang terancam berhenti karena biaya.

## Kesehatan

- **label** — Kesehatan
- **tagline** — Pemeriksaan, pengobatan, dan alat kesehatan bagi yang selama ini menundanya.
- **blurb** — Layanan dan alat kesehatan yang terjangkau.
- **title / h1** — Donasi Kesehatan
- **seoDescription** (148) — Donasi kesehatan lewat bagiberbagi.id: pemeriksaan, biaya pengobatan, dan alat kesehatan untuk warga yang menunda berobat karena keterbatasan biaya.

## Pemberdayaan

- **label** — Pemberdayaan
- **tagline** — Dapur dan usaha kecil warga tumbuh lewat order yang pasti dan alat yang memadai.
- **blurb** — Usaha kecil warga tumbuh dan mandiri.
- **title / h1** — Pemberdayaan Ekonomi & UMKM
- **seoDescription** (153) — Pemberdayaan ekonomi & UMKM bersama bagiberbagi.id: order rutin untuk dapur warga, modal dan peralatan usaha, serta pelatihan agar penghasilan berlanjut.

## Kemanusiaan

- **label** — Kemanusiaan
- **tagline** — Bantuan yang datang cepat saat bencana, dan tetap tinggal saat pemulihan.
- **blurb** — Respons cepat saat darurat dan pemulihan.
- **title / h1** — Bantuan Kemanusiaan & Bencana
- **seoDescription** (153) — Bantuan kemanusiaan & bencana lewat bagiberbagi.id: respons cepat kebutuhan dasar saat gempa, banjir, dan kebakaran, hingga pemulihan keluarga terdampak.

## Lingkungan

- **label** — Lingkungan
- **tagline** — Pohon yang meneduhkan, sungai yang bersih, dan sampah yang kembali berguna.
- **blurb** — Lingkungan yang lebih sehat dan tahan lama.
- **title / h1** — Peduli Lingkungan
- **seoDescription** (149) — Peduli lingkungan bersama bagiberbagi.id: penghijauan, bersih sungai, dan pengelolaan sampah komunitas untuk kota yang lebih teduh dan berkelanjutan.

---

## Aksi for the three empty pintu

Pendidikan, Kesehatan, and Kemanusiaan have no programme, so nothing here promises delivery,
names a programme, or implies a schedule. Each is interest-registration and says so. The pattern
is not invented — the existing `goods`, `money`, and `space` copy already speaks this way
(*"selama pintu ini masih kami siapkan"*), which is the honest register for a door being built.

All six carry `mechanism: conversation`. Drafts, to be replaced the moment the field team can say
something truer.

### Pendidikan

- **Titipkan nama pelajar yang kamu kenal** — Ada anak di sekitarmu yang terancam berhenti sekolah karena biaya? Kabari kami; datanya kami kumpulkan sambil program beasiswanya disiapkan.
- **Sisihkan buku dan alat sekolah layak pakai** — Simpan dulu, jangan dikirim. Kami kabari begitu penyalurannya siap, supaya tidak ada yang menumpuk tanpa tujuan.

### Kesehatan

- **Kabari kebutuhan berobat di sekitarmu** — Tetangga atau kerabat yang menunda berobat karena biaya bisa kamu daftarkan sekarang, sebelum layanannya kami buka.
- **Tawarkan waktumu sebagai tenaga kesehatan** — Dokter, perawat, bidan, atau ahli gizi yang bersedia membantu pemeriksaan warga, kami catat lebih dulu.

### Kemanusiaan

- **Daftar jadi relawan siaga** — Saat bencana terjadi, yang paling menentukan adalah siapa yang sudah siap sebelumnya. Tinggalkan kontak dan wilayahmu.
- **Siapkan dukungan yang bisa dipanggil mendadak** — Kendaraan, gudang, dapur, atau jaringan di daerah rawan. Kami hubungi hanya ketika benar-benar dibutuhkan.

---

## Notes on the drafting

**Every `seoDescription` opens with the phrase that field is actually searched by** — *bantuan
pangan*, *donasi pendidikan*, *donasi kesehatan*, *pemberdayaan ekonomi & UMKM*, *bantuan
kemanusiaan & bencana*, *peduli lingkungan*. This is where the search traffic given up by a
neutral `/peduli/` namespace is recovered, so the opening words are the working part of the line,
not decoration.

All six sit between 70 and 160 characters, matching the existing discipline and Google's cut-off.

**`CATEGORY_CONTENT.food` is not rewritten here.** It is a fully written story block — headline,
two paragraphs, a closing quote, stats, how-it-works, FAQ — and it now describes Pangan under an
unchanged key, since `food` survives as an id. Most
of it survives the axis change because it already talks about feeding people rather than about
the act of handing food over. It needs re-reading line by line against the new meaning, which is
an editing pass on real prose rather than a drafting job, and belongs with the owner.
