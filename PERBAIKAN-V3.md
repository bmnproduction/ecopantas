# ECO PANTAS V3 — Paket fokus

Paket ini sengaja hanya berisi proyek aktif `eco-pantas-integrated` agar tidak tertukar dengan folder proyek lama, arsip PANTAS-GONAS, atau aset opsional duplikat.

## Jalankan
1. Ekstrak folder ZIP seluruhnya.
2. Buka folder `eco-pantas-v3-fixed` di VS Code.
3. Dengan Node.js 20+, jalankan `npm install`, lalu `npm run build`, lalu `npm run serve`.
4. Buka `http://localhost:5173`.

Alternatif: gunakan Live Server pada `index.html`. Jangan membuka HTML langsung dari dalam ZIP.

## Isi utama
- `index.html`: beranda
- `peta.html`: peta alur belajar
- `stasiun/mata.html`: eksplorasi + puzzle
- `stasiun/hati.html`: 20 soal kuis
- `stasiun/tangan.html`: 15 benda pemilahan
- `stasiun/aksi-nyata.html`: checklist aksi bersama pendamping
- `js/game-core.js`: sesi, progres, badge, dan satu timer
- `css/tailwind.css` + `css/style.css`: Tailwind terbundel dan tema ECO PANTAS

Halaman stasiun kini memiliki pesan pemulihan yang terlihat jika modul game tidak berhasil dimuat, bukan membiarkan teks “Menyiapkan petualangan…” selamanya.
