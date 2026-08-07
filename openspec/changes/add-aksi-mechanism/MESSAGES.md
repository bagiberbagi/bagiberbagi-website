# The fifteen messages, drafted for the owner to evaluate

Q3 asked who writes these. Answered 7 August 2026: **"kamu isi aja nanti aku evaluasi."** So they
are drafted here rather than in the content files, because a draft in `src/content/aksi/*.json` is
already shipping. This is a document to read and mark up first.

Every message is written to be sent **by the visitor**, first person, matching the five that
already exist in the codebase:

```
Halo, saya ingin donasi program "Jumat Berkah". Boleh dibantu untuk jumlah porsinya?
Halo, saya ingin ikut jadi relawan bagiberbagi.id.
Halo, saya punya usaha kuliner dan ingin jadi Mitra Dapur UMKM.
Halo, kami tertarik menjalankan program CSR bersama bagiberbagi.id.
Halo, saya punya sumber daya untuk dibagikan lewat bagiberbagi.id.
```

The rule each draft follows: **carry the thing the aksi actually asks for**, so the team does not
open the chat and have to ask the first question. Where the aksi asks for a list, a location, or
photos, the message ends on a colon so the sender's own thumb finishes it.

---

## The finding: two of the fifteen are not messages

Writing them surfaced something the design did not anticipate. Thirteen are conversations. Two are
not, and forcing them into `conversation` would produce a message nobody would ever send.

| aksi | what it actually asks | honest kind |
|---|---|---|
| **Dana, "Periksa dulu catatan penyalurannya"** | open `/jejak/` and read | not a conversation. Its whole point is *don't message us yet, go look* |
| **Pohon, "Rawat pohon yang sudah ada"** | water a tree near you | asks nothing of bagiberbagi at all |

`design.md` states there is **no `link` kind**, on the grounds that nothing needs an editor-authored
URL and the one destination outside the card is derived from the programme relationship. The first
row above is a counter-example: its destination is `/jejak/`, a real page, and no relationship
derives it.

Three ways to close it, and the owner picks:

- **(a) `none` for both.** Cheapest, honest, and costs the Dana one its most useful property. It
  is the aksi that builds trust before money is asked for, and it currently names a page the
  visitor cannot reach from there.
- **(b) Add a `link` kind** carrying an editor-authored href. Answers the Dana row properly. Costs
  a fourth branch in a union whose three members were each justified by something the site already
  does, and opens the door to editors pasting arbitrary URLs.
- **(c) `none` for Pohon, and a `link` kind used only for internal routes** for Dana. Keeps the
  guard rail by validating the href starts with `/`.

**Recommendation: (c).** The Pohon one genuinely asks nothing, so `none` is not a compromise there,
it is correct. The Dana one names a real internal page and deserves to be clickable.

---

## Barang

**1. Pilah isi lemari**
> Halo, saya sudah menyisihkan beberapa barang yang masih layak pakai dan ingin membagikannya. Boleh dikabari begitu pintu Berbagi Barang dibuka?

**2. Kabari barang yang ada**
> Halo, saya ingin mengabari barang apa saja yang tersedia di tempat saya. Foto dan daftarnya saya kirim di sini ya.

**3. Bantu susun standarnya**
> Halo, saya terbiasa mengurus gudang dan pengiriman barang, dan ingin ikut membantu menyusun cara memilah serta mengantarnya.

## Waktu

**4. Kirim daftar keahlianmu**
> Halo, saya ingin mendaftar jadi relawan. Ini yang bisa saya kerjakan dan berapa jam saya luang tiap minggu:

**5. Ikut satu penyaluran dulu**
> Halo, saya ingin ikut membantu di satu penyaluran makanan lebih dulu. Kapan kegiatan terdekatnya?

**6. Ajak satu orang bergantian**
> Halo, saya dan satu teman ingin mendaftar jadi relawan yang bisa saling menggantikan jadwal.

## Ruang

**7. Daftarkan ruang atau kendaraanmu**
> Halo, saya ingin mendaftarkan ruang atau kendaraan yang bisa dipakai untuk kegiatan. Ini jenis, lokasi, dan hari kosongnya:

**8. Pinjamkan langsung ke sekitarmu**
> Halo, ruang saya sedang dipakai untuk kegiatan di sekitar saya, dan saya ingin ini tercatat sebagai bagian dari jejaring bagiberbagi.id.

**9. Kenalkan kami ke pengelolanya**
> Halo, saya ingin menyambungkan bagiberbagi.id dengan pengurus aula, masjid, atau gudang yang saya kenal.

## Dana

**10. Periksa dulu catatan penyalurannya** *(not a message, see the finding above)*
> Proposed instead: a link to `/jejak/`.

**11. Daftar minat zakat atau sedekahmu**
> Halo, saya ingin mendaftar lebih dulu untuk zakat atau sedekah, supaya dikabari begitu jalurnya resmi dibuka.

**12. Bawa anggaran CSR kantormu**
> Halo, saya memegang anggaran CSR di kantor saya. Boleh kita bicarakan bentuk laporan dan dokumentasi yang kami butuhkan?

## Pohon

**13. Tunjuk titik yang panas**
> Halo, saya ingin menunjukkan jalan atau kawasan di sekitar saya yang terik dan belum punya peneduh. Ini lokasinya:

**14. Tawarkan lahan atau bibit**
> Halo, saya punya lahan yang bisa ditanami atau bibit yang siap dipindahkan.

**15. Rawat pohon yang sudah ada** *(not a message, see the finding above)*
> Proposed instead: no control at all. It asks the reader to do something today, on their own.

---

## Makanan, for completeness

Food's three are not in the fifteen because two already exist in the code and one is not a message:

| aksi | mechanism | message |
|---|---|---|
| Donasi paket | `quantity` | built by the card from the visitor's choice |
| Salurkan surplus | `conversation` | *needs one; not in the original count* → "Halo, saya punya surplus makanan yang masih layak dan ingin disalurkan. Boleh dijemput?" |
| Jadi mitra dapur | `conversation` | already exists: "Halo, saya punya usaha kuliner dan ingin jadi Mitra Dapur UMKM." |

So the true count of messages to write was **fourteen**, not fifteen: thirteen non-food plus food's
"Salurkan surplus", with two of the nominal fifteen turning out not to be messages at all.

---

## What to mark up

Read them as a set rather than one by one. The three things worth your eye:

1. **Register.** They use "saya" and stay plain. If the site's voice wants them warmer or more
   formal, say so once and all fourteen move together.
2. **The colon endings** (4, 7, 13). They hand the sentence to the sender to finish. That is either
   a helpful nudge or an unfinished-looking message, and only you can call it.
3. **Numbers 8 and 11**, which describe a situation rather than make a request. They are the two
   most likely to read as odd out loud.
