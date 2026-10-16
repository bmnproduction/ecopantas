# Laporan tes lokal — ECO PANTAS Integrated

## Hasil terakhir

- `npm test`: **18 tes lulus, 0 gagal**.
- `npm run check`: lulus pada 7 halaman HTML dan 14 modul JavaScript, termasuk referensi lokal, ID HTML, Tailwind, SVG, CSS dan breakpoint.
- Empat bank/mekanik diuji statis: 20 kuis, empat misi eksplorasi, 15 benda pemilahan, dan asset/utility Tailwind tersedia.

## Yang diperiksa

- Pengelolaan sesi, satu deadline digital 7 menit dan status timeout.
- Penguncian tahap sesuai urutan dan transisi ke Aksi Nyata setelah tiga tahap digital selesai.
- Fallback penyimpanan ketika `localStorage` gagal dan pemilihan sesi yang lebih baru.
- Migrasi data lama v4/v5, data progres lama yang kehilangan metadata deadline.
- Validitas data soal, pilihan jawaban, asset bank eksplorasi, benda dan kategori pilah.
- Sintaks semua modul JavaScript, tautan lokal dari HTML, nama file aset, duplicate HTML IDs, struktur SVG dan media query responsif.

## Batas verifikasi

Browser otomatis pada lingkungan pembuatan dapat memblokir navigasi halaman lokal (`ERR_BLOCKED_BY_ADMINISTRATOR`), maka klik end-to-end pada browser nyata tidak diklaim telah lolos di lingkungan ini. Uji manual setelah ekstraksi melalui Live Server/local server tetap diperlukan—khususnya untuk sentuhan layar ponsel, drag-drop mouse/touch, tampilan ukuran layar perangkat Anda, dan deployment Vercel.

## Cara mengulangi tes

```bash
npm install
npm test
npm run check
npm run build
npm run serve
```

## Pemeriksaan HTTP/aset tambahan

- Server lokal `http://127.0.0.1:5173` merespons `200 OK` untuk 7 halaman HTML, Tailwind CSS, CSS tema, bank kuis JS, SVG kuis contoh, dan logo raster.
- Validasi file gambar: **136/136 raster** (PNG/JPG) berhasil diverifikasi dapat dibuka.
- Jumlah sprite SVG game: **129**; audit memastikan struktur SVG serta referensi lokal di dalam SVG tidak putus.
