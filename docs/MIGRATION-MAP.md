# Pemetaan empat game lama ke pengalaman belajar baru

Prinsip integrasi: **ubah alur dan tujuan belajar, pertahankan mekanik yang berguna**. Pemetaan berikut diterapkan dalam proyek ini.

| Mekanik/komponen lama | Tahap baru | Status integrasi |
|---|---|---|
| Eksplorasi: target vs. distraktor bergambar | Mata Alam | Empat misi dengan opsi bergambar, petunjuk, jawaban salah yang dapat dicoba lagi, dan feedback. |
| Puzzle susun gambar | Mata Alam | Puzzle 2×2 dari ilustrasi sungai sehat; sentuh dua potongan untuk bertukar tempat. Puzzle ikut menentukan selesainya tahap Mata. |
| Bank kuis lingkungan | Hati Peduli | 20 soal dimigrasikan ke `js/data/quiz-bank.js`, ilustrasi SVG per soal, penjelasan, petunjuk, lompat/navigasi soal, dan progres. |
| Drag-and-drop pilah sampah | Tangan Terampil | 15 benda dengan tiga wadah. Drag-drop dan alternatif sentuh benda → sentuh wadah berjalan pada satu handler delegasi. |
| Eksplorasi/praktik | Gotong Royong Cilik | Checklist aksi sederhana bersama pendamping; menjaga durasi layar tetap singkat. |
| Timer, sesi, progres, badge | Lintas halaman | Satu sumber kebenaran di `js/game-core.js`, storage key `ecoPantasSession_v6`, satu deadline bersama. |
| Karakter, ikon, latar, objek dan badge | Seluruh tahap | Aset raster dan SVG digabungkan; lokasi berada di `assets/images/` dan `assets/games/`. |

## Modul utama

- `js/data/exploration-bank.js`: target, opsi, petunjuk, dan ilustrasi eksplorasi.
- `js/data/quiz-bank.js`: bank soal dan penjelasan kuis.
- `js/data/trash-bank.js`: 15 benda dan tiga kategori wadah.
- `js/stations/mata.js`: eksplorasi + puzzle.
- `js/stations/hati.js`: Engklek Pintar/kuis.
- `js/stations/tangan.js`: pilah sampah.
- `js/stations/aksi-nyata.js`: checklist dengan pendamping.
- `js/game-core.js`: status satu sesi, deadline timer, progres, migrasi penyimpanan, lencana.

## Catatan kompatibilitas

Data lama v4/v5 dapat memiliki skema yang tidak seragam. Migrasi di `game-core.js` mencoba mempertahankan deadline dan progres yang bisa dikenali, tetapi belum bisa menjamin seluruh data produksi lama karena source repo asli tidak termasuk dalam ZIP tersebut. Simpan salinan data/proyek lama sebelum mengganti deployment.
