# Manifest aset — ECO PANTAS Integrated

Aset dari tiga lampiran (`assets`, `eco-pantas-v2`, `eco-pantas-fixed`) disatukan tanpa menghapus koleksi sumber. Gambar PNG/JPG berada di `assets/images/`; sprite SVG game lama berada di `assets/games/`. `assets/svg/README.txt` hanya menjadi penanda folder tambahan, bukan direktori utama sprite.

## Aset tema / karakter

| File | Fungsi |
|---|---|
| `assets/images/logoecopantas.jpg` | Logo proyek |
| `assets/images/rakaposeberdiri.png`, `sariposeberdiri.png` | Karakter berpose diam/berdiri |
| `assets/images/rakaposeberpikir.png`, `sariposeberpikir.png` | Pose berpikir |
| `assets/images/rakaposemenunjuk.png`, `sariposemenunjuk.png` | Pose memberi petunjuk |
| `assets/images/rakaposesenang.png`, `sariposesenang.png` | Pose berhasil/senang |
| `assets/images/badgemataalam.png`, `badgehatipeduli.png`, `badgetanganterampil.png`, `badgeksatriagotongroyong.png` | Empat badge pembelajaran |

## Aset mekanik game yang dimigrasikan

- `assets/games/challenge-1-trash/`: 15+ ilustrasi sampah, tiga wadah pilah, alat bantu dan feedback.
- `assets/games/challenge-2-quiz/questions/`: 20 ilustrasi kuis (q01–q20) beserta ikon jawaban.
- `assets/games/challenge-3-puzzle/`: gambar untuk puzzle, bingkai papan dan feedback.
- `assets/games/challenge-4-exploration/`: target, distraktor, petunjuk dan marker eksplorasi.
- `assets/games/characters/`: pose Raka dan Sari berbasis SVG.
- `assets/games/backgrounds/`: latar home dan lingkungan.
- `assets/games/culture/`: ornamen budaya (batik/anyaman) untuk penggunaan tambahan.
- `assets/games/ui/`: ikon kontrol, petunjuk, navigasi, ulang dan status.

## Mengganti aset

Gunakan nama path dari string `asset(...)` di `js/game-core.js` atau `gameAsset(...)` untuk `assets/games/`. Jika mengganti gambar, pertahankan path yang dipakai modul, atau perbarui rujukannya sekaligus. Setelah mengubah kelas Tailwind dinamis, jalankan `npm run build:css`.

## Audio

Audio tidak dipaksa berjalan otomatis. Audio bisa ditambahkan kelak melalui kontrol eksplisit agar tidak mengejutkan atau mengganggu anak.
