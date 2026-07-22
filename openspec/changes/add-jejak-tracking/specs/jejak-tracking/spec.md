## ADDED Requirements

### Requirement: Jejak sebagai satu kali program berjalan di lapangan

Sistem SHALL memodelkan setiap kali sebuah program berjalan di lapangan sebagai satu entry `jejak` yang mengacu ke tepat satu program lewat relasi, dan MUST menurunkan pintu dari `program.pintu` alih-alih menyimpannya di jejak, sehingga taksonomi tetap sumber tunggal.

#### Scenario: Jejak menempel ke program dan mewarisi pintu

- **WHEN** sebuah entry `jejak` punya `program: jumat-berkah`
- **THEN** `getJejakByProgram('jumat-berkah')` memuat entry itu
- **AND** entry itu dihitung di bawah pintu `food` karena `jumat-berkah.pintu === 'food'`, tanpa field pintu di jejak

#### Scenario: Jejak mengacu program tak dikenal

- **WHEN** sebuah entry `jejak` mengacu program yang tidak ada di collection `programs`
- **THEN** build MUST gagal atau entry itu MUST diabaikan dari semua agregasi (tidak boleh menghasilkan halaman/hitungan yatim)

### Requirement: Halaman detail jejak

Sistem SHALL menghasilkan satu halaman per entry `jejak` yang published di `/jejak/[slug]`, memuat judul, tanggal, lokasi, baris metrics, galeri, body naratif, tautan ke program induk, dan OG image.

#### Scenario: Jejak published dapat halaman

- **WHEN** entry `jejak` punya `published: true`
- **THEN** `/jejak/[slug]/` ter-generate dengan metrics, galeri, dan body-nya
- **AND** halaman menautkan kembali ke halaman program induk

#### Scenario: Jejak draft tidak ter-route

- **WHEN** entry `jejak` punya `published: false`
- **THEN** tidak ada halaman `/jejak/[slug]/` dihasilkan
- **AND** entry itu tidak muncul di listing atau agregasi mana pun

### Requirement: Agregasi metrik sum-by-label

Sistem SHALL mengagregasi `metrics[{label, value}]` lintas jejak dengan menjumlahkan `value` per `label` identik, dan MUST menyediakan agregasi ini pada level program (`getProgramImpact`) dan level pintu (`getPintuImpact`).

#### Scenario: Metrik dijumlahkan per label

- **WHEN** dua jejak dari program yang sama punya `metrics` `[{porsi, 120}]` dan `[{porsi, 80}]`
- **THEN** `getProgramImpact` untuk program itu melaporkan `porsi: 200`

#### Scenario: Agregat pintu menjumlah semua program di dalamnya

- **WHEN** pintu `food` menaungi program `jumat-berkah` dan `ramadhan-berkah`, masing-masing punya jejak ber-metrik
- **THEN** `getPintuImpact('food')` melaporkan total metrik gabungan kedua program plus jumlah jejak dan jumlah program

#### Scenario: Hanya jejak published yang dihitung

- **WHEN** sebuah jejak `published: false`
- **THEN** metriknya tidak masuk agregat program maupun pintu

### Requirement: Halaman rekam jejak per pintu dengan breakdown per program

Sistem SHALL menyediakan `/berbagi/[category]/jejak` yang menampilkan header counter agregat pintu (dari `getPintuImpact`), galeri gabungan, dan breakdown per-program di mana tiap kartu program menampilkan total metrik, jumlah jejak (ditampilkan sebagai "× kali"), dan aksen warna pintu.

#### Scenario: Header counter memakai angka real

- **WHEN** pengunjung membuka `/berbagi/makanan/jejak`
- **THEN** counter menampilkan total metrik terhitung dari jejak pintu `food`, bukan angka hardcoded

#### Scenario: Breakdown mengurutkan program menurut dampak

- **WHEN** pintu punya beberapa program dengan total metrik berbeda
- **THEN** breakdown menampilkan kartu tiap program dengan total metrik & jumlah jejaknya sehingga program berdampak tinggi terlihat
- **AND** tiap kartu menautkan ke halaman program yang bersangkutan

#### Scenario: Pintu tanpa jejak tampil kosong dengan anggun

- **WHEN** sebuah pintu belum punya jejak apa pun
- **THEN** halaman tetap render tanpa error, menampilkan keadaan kosong alih-alih counter/galeri palsu

### Requirement: Blok jejak di halaman program

Halaman program (`/[program]`) SHALL menampilkan blok yang mendaftar jejak program itu (`getJejakByProgram`) beserta agregat program tersebut, sehingga satu program yang berjalan berkali-kali memperlihatkan seluruh jejaknya.

#### Scenario: Program dengan banyak jejak

- **WHEN** `jumat-berkah` punya beberapa entry jejak published
- **THEN** halaman `/jumat-berkah/` menampilkan daftarnya (terbaru dahulu) dengan tautan ke tiap `/jejak/[slug]`

#### Scenario: Program tanpa jejak

- **WHEN** sebuah program belum punya jejak
- **THEN** blok jejak disembunyikan atau menampilkan keadaan kosong, tanpa error

### Requirement: Section jejak terbaru di beranda

Beranda SHALL menampilkan section "Jejak Terbaru" berisi kartu jejak terbaru lintas pintu dengan tautan ke halaman detail masing-masing.

#### Scenario: Beranda menampilkan jejak terbaru

- **WHEN** ada jejak published
- **THEN** beranda menampilkan sejumlah kartu jejak terbaru (terurut tanggal menurun) yang menaut ke `/jejak/[slug]`

#### Scenario: Belum ada jejak

- **WHEN** belum ada satu pun jejak published
- **THEN** section jejak terbaru disembunyikan (tidak menampilkan blok kosong di beranda)

### Requirement: OG image dan SEO halaman jejak

Sistem SHALL menghasilkan OG image build-time untuk tiap halaman jejak dan mengintegrasikan meta title/description-nya ke pipeline SEO yang ada.

#### Scenario: Halaman jejak punya share image

- **WHEN** `/jejak/[slug]/` di-build
- **THEN** OG image untuk route itu ikut ter-generate lewat `open-graph/[...route].ts`
- **AND** meta title/description resolve mengikuti urutan yang sudah ada (prop → `seo.pages[]` → default)
