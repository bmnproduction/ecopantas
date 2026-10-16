// Bank misi eksplorasi dari mode Jelajah Kampung.
export const EXPLORE_QUESTS = [
  {
    id: 'plant', location: 'Kebun', emoji: '🪴',
    prompt: 'Tanaman terlihat layu. Benda mana yang dapat membantu merawatnya?',
    hint: 'Tanaman membutuhkan air yang cukup. Cari alat untuk menyiram.',
    options: [
      { id: 'watering-can', label: 'Penyiram tanaman', src: 'challenge-4-exploration/targets/watering-can.svg', correct: true, why: 'Betul! Siram tanaman secukupnya, sebaiknya bersama pendamping.' },
      { id: 'stone', label: 'Batu sungai', src: 'challenge-4-exploration/decoys/stone.svg', correct: false, why: 'Batu tidak dapat menggantikan air yang dibutuhkan tanaman.' },
      { id: 'sandals', label: 'Sandal', src: 'challenge-4-exploration/decoys/sandals.svg', correct: false, why: 'Sandal bukan alat untuk merawat tanaman.' }
    ]
  },
  {
    id: 'water', location: 'Rumah', emoji: '🚰',
    prompt: 'Kita selesai mencuci tangan. Pilih benda yang membantu menghemat air.',
    hint: 'Air tidak perlu terus mengalir saat tidak digunakan.',
    options: [
      { id: 'bird', label: 'Burung', src: 'challenge-4-exploration/decoys/bird.svg', correct: false, why: 'Burung adalah makhluk hidup, bukan alat untuk menutup air.' },
      { id: 'close-tap', label: 'Keran ditutup', src: 'challenge-4-exploration/targets/close-tap.svg', correct: true, why: 'Benar! Menutup keran setelah digunakan membantu menghemat air.' },
      { id: 'bridge', label: 'Jembatan', src: 'challenge-4-exploration/decoys/bridge.svg', correct: false, why: 'Jembatan tidak menghentikan air dari keran.' }
    ]
  },
  {
    id: 'village', location: 'Kampung', emoji: '🧺',
    prompt: 'Daun kering berserakan di halaman. Pilih alat yang cocok untuk mengumpulkannya.',
    hint: 'Pilih alat yang bisa menampung daun dengan aman, bukan benda tajam atau kotor.',
    options: [
      { id: 'bamboo-basket', label: 'Keranjang bambu', src: 'challenge-4-exploration/targets/bamboo-basket.svg', correct: true, why: 'Hebat! Keranjang dapat membantu mengumpulkan daun kering. Lakukan bersama orang dewasa.' },
      { id: 'chicken', label: 'Ayam', src: 'challenge-4-exploration/decoys/chicken.svg', correct: false, why: 'Ayam adalah hewan yang perlu dijaga, bukan alat untuk membersihkan halaman.' },
      { id: 'plastic-bottle', label: 'Botol plastik', src: 'challenge-4-exploration/targets/plastic-bottle.svg', correct: false, why: 'Botol plastik bukan alat untuk mengumpulkan daun kering.' }
    ]
  },
  {
    id: 'river', location: 'Sungai', emoji: '🌳',
    prompt: 'Apa yang bisa membantu membuat kampung teduh dan menjadi tempat hidup burung?',
    hint: 'Cari tanaman berkayu yang tumbuh besar dan tetap perlu dirawat.',
    options: [
      { id: 'river-leaf', label: 'Daun di sungai', src: 'challenge-4-exploration/decoys/river-leaf.svg', correct: false, why: 'Daun adalah bagian tumbuhan, tetapi bukan jawaban untuk menambah pohon peneduh.' },
      { id: 'young-tree', label: 'Pohon muda', src: 'challenge-4-exploration/targets/young-tree.svg', correct: true, why: 'Ya! Pohon dapat memberi keteduhan dan menjadi tempat hidup hewan. Rawat tanpa merusaknya.' },
      { id: 'river-stone', label: 'Batu sungai', src: 'challenge-4-exploration/decoys/river-stone.svg', correct: false, why: 'Batu tidak tumbuh menjadi pohon peneduh.' }
    ]
  }
];
