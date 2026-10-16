# ECO PANTAS — Petualangan Ksatria Anjuk Ladang

**Versi: 2.1.0 · HTML + CSS + JavaScript modular + Tailwind CSS v4**

ECO PANTAS menghubungkan empat pengalaman belajar: **Mata → Hati → Tangan → Aksi Nyata**. Mekanik dari versi lama tetap dipakai sebagai variasi, bukan lagi sebagai empat permainan yang berdiri sendiri.

> Penting: jangan membuka HTML langsung dari dalam ZIP atau lewat `file://`. Ekstrak ZIP sepenuhnya, lalu jalankan melalui server lokal. Screenshot versi sebelumnya memperlihatkan halaman dibuka dari jendela sementara ZIP; pada mode itu browser dapat memblokir modul JavaScript dan aset, sehingga halaman terlihat seperti HTML polos. Versi ini menampilkan petunjuk ekstraksi saat dibuka dengan `file://`.

## Empat tahap belajar dan empat mekanik game

| Tahap belajar | Mekanik lama yang digabung | Isi interaksi |
|---|---|---|
| **1. Mata Alam** | Eksplorasi + puzzle gambar | Anak menemukan empat benda/aksi yang membantu lingkungan, lalu menyusun puzzle sungai sehat 2×2. |
| **2. Hati Peduli** | Kuis bergambar | Bank **20 soal** bertema ekologi, perilaku peduli, air, energi, satwa, dan kebiasaan baik. Ada petak soal, navigasi, petunjuk, jawaban ulang, dan penjelasan. |
| **3. Tangan Terampil** | Pilah sampah | Anak memilah **15 benda** ke tiga kategori. Mendukung drag-and-drop pada komputer dan sentuh benda lalu sentuh wadah pada perangkat layar sentuh. |
| **4. Gotong Royong Cilik** | Aksi dunia nyata | Checklist kegiatan sederhana bersama guru/orang tua, dengan konfirmasi pendamping. Tahap ini bukan mini-game layar tambahan. |

Konsep baru menjaga alur pedagogisnya: mengamati, memahami, berlatih, kemudian bertindak di dunia nyata. Puzzle dan kuis dibuat sebagai variasi pada tahapan yang relevan.

## Cara menjalankan di Windows

### Pilihan A — server bawaan proyek

1. Ekstrak ZIP melalui **Klik kanan → Extract All / Ekstrak Semua**.
2. Buka folder `eco-pantas-integrated` di Visual Studio Code.
3. Pastikan Node.js terpasang.
4. Buka **Terminal → New Terminal**, kemudian jalankan:

```bash
npm install
npm run build
npm run serve
```

5. Buka `http://localhost:5173` di Chrome.

`npm run build` menyusun ulang CSS Tailwind, lalu menjalankan audit kode dan seluruh tes. Untuk mencoba versi yang CSS-nya telah disertakan tanpa mengompilasi ulang, cukup jalankan `npm run serve` setelah mengekstrak ZIP.

### Pilihan B — Live Server

Buka folder yang sudah diekstrak di VS Code, klik kanan `index.html`, lalu pilih **Open with Live Server**. Pastikan alamat browser diawali `http://127.0.0.1:...` atau `http://localhost:...`, bukan `file://` dan bukan direktori sementara di dalam ZIP.

## Tailwind CSS

Tailwind CSS v4 dipakai bersama stylesheet khusus ECO PANTAS. CSS Tailwind terkompilasi sudah disertakan di `css/tailwind.css`, jadi halaman tetap memiliki gaya dasar tanpa mengunduh framework dari CDN atau mengandalkan internet.

- Sumber masukan Tailwind: `css/tailwind.input.css`
- CSS terkompilasi yang dipakai halaman: `css/tailwind.css`
- Gaya visual ECO PANTAS: `css/style.css`
- Kompilasi ulang setelah mengganti/menambahkan utility class: `npm run build:css`
- Pantau perubahan ketika mengembangkan UI: `npm run watch:css`

Rujukan perintah CLI Tailwind v4: [dokumentasi/CLI Tailwind CSS](https://tailwindcss.com/docs/installation).

## Struktur utama

```text
index.html                     Beranda dan popup informasi pembuat
peta.html                      Peta empat tahap dan progres
pendamping.html                Panduan guru/orang tua dan ringkasan sesi
stasiun/
  mata.html                    Eksplorasi + puzzle 2×2
  hati.html                    Kuis bergambar (20 soal)
  tangan.html                  Pilah 15 benda dengan tiga wadah
  aksi-nyata.html              Checklist aksi di luar layar
css/
  tailwind.input.css           Input kompilasi Tailwind v4
  tailwind.css                 Hasil kompilasi (disertakan)
  style.css                    Tema visual, game UI, responsif
js/
  game-core.js                 Satu sumber sesi, progres, badge, timer
  map.js, home.js, pendamping.js
  station-shell.js              Layout dan kontrol stasiun bersama
  data/                         Bank kuis, eksplorasi, dan pilah sampah
  stations/                     Mekanik setiap tahap
assets/images/                  Gambar PNG/JPG milik proyek
assets/games/                   Sprite SVG game lama dan ilustrasi mekanik
scripts/serve.mjs               Server statis lokal
 tests/                          Tes regresi dan audit proyek
vercel.json                     Konfigurasi hosting statis Vercel
```

## Sesi, timer, dan progres

- Penyimpanan utama: `ecoPantasSession_v6`.
- Sesi digital memiliki satu deadline **7 menit** yang sama di Mata, Hati, dan Tangan; pindah halaman tidak mengulang timer.
- Setelah tiga stasiun digital selesai, timer dihentikan dan Aksi Nyata dapat dilakukan dengan pendamping.
- Progres disimpan di browser lokal, tidak tersinkron otomatis antar perangkat.
- Ada adapter awal untuk data `ecoGameSession_v4`/`ecoGameSession_v5`; format historis yang tidak ikut bersama source repo asli belum dapat dijamin 100% kompatibel. Data lama tidak sengaja dihapus ketika metadata timer tidak lengkap.
- Tombol reset sesi tersedia di panel pendamping. Gunakan hanya saat ingin memulai ulang untuk uji coba.

## Pengujian

Memerlukan Node.js modern (disarankan Node.js 20+ untuk Tailwind v4):

```bash
npm test
npm run check
```

`npm test` memeriksa alur sesi/timer, penguncian tahap, fallback penyimpanan, migrasi, validitas bank data dan utility Tailwind. `npm run check` memeriksa sintaks modul, tautan halaman/aset lokal, ID HTML ganda, struktur SVG, file CSS, Tailwind dan breakpoint responsif.

Tes otomatis bukan jaminan bahwa semua perangkat dan browser sudah tervalidasi. Setelah menjalankan proyek, lakukan uji manual di desktop dan ponsel sebelum deployment.

## Deployment ke Vercel

Impor folder/repository ini sebagai situs statis. Untuk deployment sederhana, **Build Command** dapat dibiarkan kosong karena CSS sudah disertakan dan **Output Directory** adalah `.` (root proyek). Jika ingin membangun ulang CSS saat deployment, gunakan:

- Build Command: `npm install && npm run build`
- Output Directory: `.`

File HTML berada di root proyek. Jangan mengunggah isi folder `stasiun/` saja.

## Batas integrasi saat ini

Paket ini menggabungkan aset dari lampiran `assets`, proyek `eco-pantas-v2`, dan `eco-pantas-fixed`. Ini adalah paket hasil integrasi yang berdiri sendiri; saya tidak mengubah repository GitHub atau deployment Vercel Anda secara langsung. Bandingkan dulu dengan repository online sebelum mengganti versi live.
