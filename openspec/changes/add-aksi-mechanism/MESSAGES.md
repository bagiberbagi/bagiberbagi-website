# The sixteen messages, drafted for the owner to evaluate

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

## The finding: two of them resisted being messages, and what was decided

Writing them surfaced something the design did not anticipate. Thirteen read as conversations.
Two did not:

| aksi | what it asks | why it resisted a message |
|---|---|---|
| **Dana, "Periksa dulu catatan penyalurannya"** | open `/jejak/` and read | its whole point is *don't message us yet, go look* |
| **Pohon, "Rawat pohon yang sudah ada"** | water a tree near you | asks nothing of bagiberbagi at all |

Three options were put up: `none` for both, a new `link` kind, or one of each. The recommendation
was the third.

**Decided 10 August 2026, and the recommendation was not taken:** *"bagus kalo semua action by
default ngobrol via whatsapp aja."* Every aksi defaults to `conversation`.

That is the better call on the structure, and it is worth saying why rather than just recording it.
A `link` kind would have been a fourth branch in a union whose three members were each justified by
something the site already does, added for exactly one entry. The rule the design set for itself
was to model what exists, and one row is not enough evidence to widen a union.

What it leaves is a copy problem, not a schema problem, and copy is the cheaper place to solve it.
Dana's aksi tells the reader to check the record **before** sending money, so a button under it
saying "chat us" would argue with the sentence above it. So the message is written to agree with
that sentence instead: it says the reader has already looked. Pohon's is written as "here is what I
am already doing, what else helps" rather than as a request for help.

`none` stays in the schema, but as the honest state for an aksi whose message has not been written
yet, rather than as a destination anything is designed to land on.

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

**10. Periksa dulu catatan penyalurannya**
> Halo, saya sudah melihat catatan penyalurannya di halaman Jejak & Dampak. Ada beberapa hal yang ingin saya tanyakan sebelum berdonasi.

*Written to agree with the aksi above it, which asks the reader to look before sending money. A
message that ignored that would put a "chat us" button under a sentence saying "go read first".*

**11. Daftar minat zakat atau sedekahmu**
> Halo, saya ingin mendaftar lebih dulu untuk zakat atau sedekah, supaya dikabari begitu jalurnya resmi dibuka.

**12. Bawa anggaran CSR kantormu**
> Halo, saya memegang anggaran CSR di kantor saya. Boleh kita bicarakan bentuk laporan dan dokumentasi yang kami butuhkan?

## Pohon

**13. Tunjuk titik yang panas**
> Halo, saya ingin menunjukkan jalan atau kawasan di sekitar saya yang terik dan belum punya peneduh. Ini lokasinya:

**14. Tawarkan lahan atau bibit**
> Halo, saya punya lahan yang bisa ditanami atau bibit yang siap dipindahkan.

**15. Rawat pohon yang sudah ada**
> Halo, saya ikut merawat pohon yang sudah tumbuh di sekitar saya. Apa lagi yang bisa saya lakukan?

*This aksi asks nothing of bagiberbagi, so the message is not a request for help. It reports what
the reader is already doing and asks what comes next.*

---

## Makanan, for completeness

Food's three sit outside the non-food count, and one of them was missed by the original brief:

| aksi | mechanism | message |
|---|---|---|
| Donasi paket | `quantity` | built by the card from the visitor's choice |
| Salurkan surplus | `conversation` | *needs one; not in the original count* → "Halo, saya punya surplus makanan yang masih layak dan ingin disalurkan. Boleh dijemput?" |
| Jadi mitra dapur | `conversation` | already exists: "Halo, saya punya usaha kuliner dan ingin jadi Mitra Dapur UMKM." |

So the count landed at **sixteen**: fifteen non-food plus food's "Salurkan surplus". The original
brief said fifteen, and it was wrong twice in opposite directions. Two of the nominal fifteen
looked like they were not messages, and the decision above turned them back into messages. Food's
"Salurkan surplus" was missed entirely, because it sat between two neighbours that already had
one.

---

## What to mark up

Read them as a set rather than one by one. The three things worth your eye:

1. **Register.** They use "saya" and stay plain. If the site's voice wants them warmer or more
   formal, say so once and all sixteen move together.
2. **The colon endings** (4, 7, 13). They hand the sentence to the sender to finish. That is either
   a helpful nudge or an unfinished-looking message, and only you can call it.
3. **Numbers 8 and 11**, which describe a situation rather than make a request. They are the two
   most likely to read as odd out loud.
