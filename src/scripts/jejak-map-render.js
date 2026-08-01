// Penggambar peta. Dipisah dari jejak-map.js supaya Leaflet dan CSS-nya jatuh
// ke chunk async sendiri: halaman jejak tak memuat satu byte pun dari sini
// sampai pengunjung menekan "Tampilkan peta".
//
// Leaflet dipakai karena embed bawaan OpenStreetMap cuma sanggup satu marker,
// sementara satu penyaluran sering berpindah beberapa titik yang berdekatan.
// Ubinnya tetap dari OpenStreetMap: tanpa API key, tanpa akun, tanpa tagihan
// per tampilan.
import L from 'leaflet';
// `?inline` menyerahkan CSS-nya sebagai string, bukan sebagai berkas terpisah.
// Bedanya nyata: `import 'leaflet/dist/leaflet.css'` biasa membuat Vite menaruh
// <link> stylesheet di setiap halaman jejak, dan stylesheet menahan render,
// jadi pembaca yang tak pernah membuka peta tetap menunggu CSS peta. Sebagai
// string, CSS-nya ikut chunk async ini dan baru masuk halaman saat dipasang.
import leafletCss from 'leaflet/dist/leaflet.css?inline';

/**
 * Pin digambar sendiri sebagai divIcon, bukan memakai ikon bawaan Leaflet. Dua
 * alasan: ikon bawaan berupa berkas PNG yang path-nya gampang putus lewat
 * bundler, dan pin sendiri bisa memakai warna pintu yang sedang berlaku.
 * Nomornya hanya muncul saat titiknya lebih dari satu, supaya cocok dengan
 * daftar di bawah peta.
 */
function pin(color, number) {
  // Warna dan nomor dijahit ke dalam string SVG, jadi keduanya disaring dulu.
  // Keduanya datang dari markup kita sendiri hari ini, tapi yang menyusun HTML
  // dari nilai luar sebaiknya tak bergantung pada asal nilainya tetap begitu.
  const fill = /^#[0-9a-f]{3,8}$/i.test(color) ? color : '#F4791D';
  const n = Number.isFinite(number) ? String(Math.trunc(number)) : '';
  const face = n
    ? `<circle cx="15" cy="14.5" r="9.5" fill="#fff"/><text x="15" y="19" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="${fill}">${n}</text>`
    : `<circle cx="15" cy="14.5" r="5.5" fill="#fff"/>`;
  return L.divIcon({
    html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.72 0 0 6.72 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.72 23.28 0 15 0Z" fill="${fill}"/>${face}</svg>`,
    className: '',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

/** Sekali per halaman, walau kelak ada lebih dari satu peta di satu halaman. */
let styleReady = false;
function injectStyle() {
  if (styleReady) return;
  const style = document.createElement('style');
  style.textContent = leafletCss;
  document.head.append(style);
  styleReady = true;
}

export function renderMap(container, points, color) {
  injectStyle();

  // scrollWheelZoom mati supaya menggulir halaman tidak tersangkut di peta;
  // yang mau memperbesar tetap bisa lewat tombol +/- atau cubit dua jari.
  const map = L.map(container, { scrollWheelZoom: false });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);

  const many = points.length > 1;
  points.forEach((point, i) => {
    // bindPopup mem-parse string sebagai HTML, jadi nama titik diserahkan
    // sebagai elemen ber-textContent. Nama itu datang dari Keystatic, dan isi
    // yang diketik editor tak seharusnya bisa jadi markup di halaman publik.
    const popup = document.createElement('span');
    popup.className = 'font-semibold';
    popup.textContent = point.label;

    L.marker([point.lat, point.lng], {
      icon: pin(color, many ? i + 1 : null),
      title: point.label,
      alt: point.label,
    })
      .addTo(map)
      .bindPopup(popup);
  });

  if (many) {
    // maxZoom menjaga titik-titik yang cuma berjarak puluhan meter tidak membuat
    // peta melompat ke perbesaran ekstrem tempat tak ada lagi konteks jalan.
    map.fitBounds(
      points.map((p) => [p.lat, p.lng]),
      { padding: [40, 40], maxZoom: 17 }
    );
  } else {
    map.setView([points[0].lat, points[0].lng], 16);
  }
}
