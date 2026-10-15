# STOKME - Dashboard Stok Toko

**Nama:** Muhammad Rizal
**NPM:** 2440304024
**Kelas:** A1
**Mata Kuliah:** Pemrograman Web 

## Deskripsi Aplikasi

STOKME adalah dashboard stok sederhana untuk pemilik toko kecil. Pengguna dapat mencari produk dengan cepat, menandai produk prioritas, melihat ringkasan data harga, dan menghitung margin keuntungan melalui form. Data produk diambil dari REST API DummyJSON.

**Konteks penggunaan:** pemilik toko kecil yang ingin memantau daftar barang dan menentukan produk yang perlu diprioritaskan.

**Rancangan visual:** tema abu-abu dan hitam dengan aksen kuning, memakai CSS variables agar warna mudah diubah dari satu tempat.

## Perhitungan Varian Berdasarkan NPM

NPM berakhir **024**, sehingga **X = 0, Y = 2, Z = 4**.

| Komponen | Nilai | Hasil |
|---|---|---|
| Dataset (X) | 0 | Products |
| Fitur utama (Y) | 2 | Favorite/Bookmark menggunakan localStorage |
| Validasi form (Z) | 4 | Dua input yang saling berkaitan divalidasi |
| Challenge | S = 0 + 2 + 4 = 6, C = 6 mod 4 = 2 | Loading indicator + pencarian dengan debounce |

## Dataset / API

- Endpoint: `https://dummyjson.com/products`
- Analisis data yang dihitung dengan JavaScript: rata-rata harga, produk termahal, dan jumlah kategori.

## Fitur Utama dan Challenge

| Fitur | Keterangan |
|---|---|
| Daftar produk | Data diambil dari REST API dan ditampilkan sebagai kartu |
| Produk prioritas (Y=2) | Pengguna menandai produk favorit, disimpan di localStorage |
| Form hitung margin (Z=4) | Validasi harga beli dan harga jual yang saling berkaitan (harga jual harus lebih besar dari harga beli) |
| Pencarian dengan debounce (C=2) | Pencarian berjalan setelah pengguna berhenti mengetik |
| Loading, success, dan error state | Status pemuatan data ditampilkan ke pengguna |
| Ringkasan data | Statistik dihitung otomatis dengan JavaScript |

## Teknologi

- HTML5 (semantic HTML dan accessibility dasar)
- CSS3 (Flexbox, CSS Grid, media query, CSS variables)
- Vanilla JavaScript (Fetch API, async/await, DOM, Web Storage)
- Tanpa framework atau library eksternal

## Aksesibilitas dan Responsive

- Elemen semantik: `header`, `nav`, `main`, `section`, `form`, `fieldset`, `output`, `footer`
- Skip link untuk pengguna keyboard
- Setiap input memiliki `label`, dan pesan error berupa teks (tidak hanya warna)
- Indikator fokus keyboard yang jelas
- Breakpoint: mobile (default, 1 kolom), tablet (>= 768px, 2 kolom), desktop (>= 1024px, 4 kolom)

## Cara Menjalankan


## Endpoint REST API


## Screenshot


## AI Usage Log

| Tanggal | AI/Tool | Tujuan | Prompt/Ringkasan | Bagian Digunakan | Verifikasi/Modifikasi |
|---|---|---|---|---|---|
| 15 Okt 2026 | Claude | Memahami soal PTS dan menentukan varian NIM | Meminta ringkasan soal dan perhitungan varian dari NIM | Perhitungan varian di README | Dihitung ulang sendiri dan dicocokkan dengan tabel pada soal |
| 15 Okt 2026 | Claude | Menyusun struktur project dan HTML semantik | Meminta panduan langkah demi langkah dan struktur file | index.html, struktur folder | Dipelajari tiap elemen, nama aplikasi dan identitas diisi sendiri |
| 15 Okt 2026 | Claude | Menyusun CSS responsive dan tema | Meminta panduan CSS responsive dengan tema abu-abu hitam | css/style.css | Diuji di DevTools (375px, 768px, 1280px), warna disesuaikan |