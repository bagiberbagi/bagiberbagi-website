# The terms — what was seeded, what was withheld, and what needs the owner

**Status 11 August 2026: the shared block is written and shipping. The per-programme block is
empty and this document is the draft for it.**

The split is deliberate and follows one rule, stated in `design.md` decision 4:

> The shared block only says what `/syarat` already says.

Everything the shared block claims traces to a clause already published on `/syarat`, rewritten
into second person and into the register of someone about to donate. Nothing in it is new, so
nothing in it can be wrong in a way the site was not already wrong.

Everything that read like an improvement but was **not** already published went here instead. An
agent writing "pesanan ditutup H-2" from plausibility would be publishing an operational promise in
the owner's name that no one had made.

---

## 1. The shared block, as shipped

Seven items, in `src/content/ketentuan/ketentuan.json`. The right column is the `/syarat` clause
each one rests on.

| # | Judul | rests on `/syarat` section |
|---|---|---|
| 1 | Cara donasi diproses | Akun Pengguna + Donasi |
| 2 | Yang termasuk dalam donasi | Penggunaan Dana |
| 3 | Laporan penyaluran | Transparansi dan Pelaporan |
| 4 | Jadwal bisa berubah | Program dan Pelaksanaan |
| 5 | Kalau penyaluran tidak bisa dijalankan | Donasi (pengalihan) |
| 6 | Pembatalan dan pengembalian dana | Pembatalan dan Pengembalian Dana |
| 7 | Siapa yang menjalankan di lapangan | Program dan Pelaksanaan + Mitra |

Read the wording in the JSON file itself rather than a copy here, so there is only one version of
it to keep true.

---

## 2. Withheld from the shared block, because `/syarat` does not say it

Four lines that would each make the section more useful and none of which can be shipped without
the owner deciding they are true. If any of these is approved, it belongs in **both** places: this
section and `/syarat`, or the two documents start to diverge on the first one.

| proposed | why it was withheld |
|---|---|
| "Kami tidak pernah meminta pembayaran ke rekening pribadi di luar percakapan itu." | An anti-fraud line, and the single most protective sentence this section could carry. `/syarat` names transfer and e-wallet as the methods but says nothing about what is *not* a legitimate request. Needs the owner to confirm it is unconditionally true. |
| "Perubahan jadwal disampaikan lewat percakapan yang sama." | `/syarat` says the schedule may change; it does not promise anyone will be told. Promising a notification creates an obligation to send one. |
| "Pengalihan donasi diberitahukan lebih dulu, bukan setelahnya." | `/syarat` promises "transparansi kepada donatur" over a redirection, which is deliberately vague about timing. Shipped here as "disampaikan terbuka", matching the vagueness rather than resolving it. |
| "Bukti donasi bisa diminta lewat percakapan." | Not on `/syarat` at all, and a real question for anyone donating a meaningful amount. Whether a receipt exists is an operational fact only the owner knows. |
| "Donasi bersifat sekali jalan. Donasi rutin belum tersedia." | The one item here that **is** already published, but in the FAQ rather than in `/syarat`. Withheld for a different reason: copying it makes a second editable copy of the same sentence, and the FAQ is where a visitor already goes looking. Worth deciding which surface owns it rather than having both. |

---

## 3. The per-programme block — drafts and the questions behind them

Each block below is what that programme's page *could* say. The bold questions are the ones no one
but the owner can answer; a draft that depends on one is written with a `⟨…⟩` gap rather than a
guess.

Four active programmes have pages today. The inactive five need nothing until they open.

### Jumat Berkah

**Two of the three questions here are not "what is the value" but "is the value a rule".** The
donation panel directly above this section already prints "tutup Kamis 18.00" and "Bogor", both read
from `settings.site.nextAgenda`. That field describes the **next agenda**, one week at a time. A
terms sentence describes a standing arrangement. Only the owner can say whether the one is the
other, and until they do, neither value can be written into a term or derived into one — see
`design.md` decision 4.

> **Kapan pesanan ditutup**
> Penyaluran berjalan setiap Jumat, dan pesanan untuk Jumat itu ditutup ⟨sehari sebelumnya? jam
> berapa?⟩ supaya tim punya waktu memesan ke dapur mitra. Pesanan yang masuk setelah itu ikut Jumat
> berikutnya.

> **Area penyaluran**
> ⟨kota/kawasan yang boleh dijanjikan⟩. Kalau titik yang kamu maksud di luar area itu, sebut saja di
> percakapan, tim akan bilang apakah masih bisa dijangkau.

> **Isi satu porsi**
> ⟨nasi + lauk protein + sayur?⟩ dalam kemasan siap makan, dari dapur UMKM terkurasi.

- **Apakah "Kamis 18.00" itu aturan tetap tiap minggu, atau cuma tenggat pekan ini?** The blocking
  one. If it is a standing rule, this term can be written and it is the single most useful sentence
  on the page for anyone deciding on a Thursday night. If it moves week to week, the term has to be
  written without a time in it, or dropped.
- **Apakah "Bogor" itu area yang boleh dijanjikan, atau lokasi agenda terdekat saja?** Same shape.
  Jejak content documents Bogor as a place distributions have happened, which is not the same as a
  promise, and the difference is what someone in Jakarta is trying to work out.
- **Apa isi satu porsi?** `/syarat` says "makanan sehat bergizi" and the page says "sehat bergizi
  dari UMKM terkurasi", which is a claim about quality rather than contents. Nothing on the site
  answers it, so nothing was drafted.
- **Ada minimum pesanan atau tidak?** Not drafted either way, on purpose. The 6-porsi default was
  removed on the owner's instruction, *"aku mau melepaskan diri dari default 6porsi, biar orang
  pilih sesuka hati aja"*, which reads as no minimum, but that instruction was about the
  calculator's default rather than about what the kitchen will accept. A term saying "tidak ada
  minimum" would be a promise the site has never made.

### Ramadhan Berbagi

> **Kapan program ini buka**
> Hanya selama Ramadhan. Di luar bulan itu halamannya tetap ada sebagai catatan, tapi pesanan
> dibuka lagi menjelang Ramadhan berikutnya. ⟨Pesanan dibuka sejak …⟩

> **Tiga paket dan isinya**
> Sahur ⟨…⟩, Takjil ⟨…⟩, Buka Puasa ⟨…⟩. ⟨Harganya sama untuk ketiganya / berbeda per paket⟩.

- **Are the three packages one price or three?** This is the question the previous change left open
  as Q2 and it is now blocking a sentence rather than only a schema: `packages: string[]` assumes one
  price, which is true in the code today. If they differ, the terms would be the first place the
  site says so out loud.
- **Apa isi masing-masing paket?** A Takjil package and a Buka Puasa package are different meals
  and the site never says how.

### Community Giving

> **Untuk siapa program ini**
> Komunitas, kantor, keluarga, atau kelompok mana pun yang ingin menyalurkan bersama. Bentuk,
> jumlah, dan jadwalnya disusun lewat diskusi, jadi tidak ada paket tetap di halaman ini.

> **Berapa lama sebelum hari pelaksanaan**
> Beri jarak ⟨…⟩ dari tanggal yang kamu incar, supaya tim bisa mengunci dapur mitra dan relawan.

- **Berapa lead time yang realistis?** A group picking a date needs to know whether to ask two weeks
  out or two days.
- **Ada minimum jumlah orang atau nominal?** The page says packages are designed together, which
  reads as "no minimum" but does not say it.

### CSR Food Program

> **Untuk perusahaan**
> Paket, jadwal, dan bentuk laporan dirancang bersama tim kami, jadi tidak ada harga tetap di
> halaman ini. Diskusi dimulai dari anggaran dan tanggal yang kamu punya.

> **Dokumen untuk keperluan internal**
> ⟨Bukti transfer / kwitansi / surat keterangan penyaluran⟩ bisa disiapkan untuk laporan internal
> atau audit perusahaan. Sebutkan di awal diskusi supaya formatnya disiapkan sejak awal.

> **Berapa lama sebelum hari pelaksanaan**
> Beri jarak ⟨…⟩ dari tanggal yang kamu incar.

- **Which documents can actually be issued?** The most consequential question in this file for CSR.
  A company cannot book a donation without something on paper, and a page that promises "dokumentasi
  siap dipakai untuk laporan internal" while meaning photographs will disappoint whoever asks
  finance for approval. `/transparansi` may be the natural home for the general answer.
- **Ada minimum anggaran?** A company deciding whether to start the conversation at all is exactly
  the visitor this page is for.

---

## 4. How to write these in

No code is involved. In `/keystatic` → Program → the programme → Detail halaman → Ketentuan
program, one row per item, judul plus isi. The row order is the order on the page. Programme items
render open, above the shared ones.

To override a shared term for one programme, **type its judul again exactly** on the programme
(e.g. "Laporan penyaluran") and write the programme's own version. The shared one then does not
appear on that page. A judul that nearly matches produces two items instead of one, which is
visible on the page rather than silent.
