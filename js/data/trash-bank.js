// Data pilah sampah dipisah dari logika interaksi agar mudah disunting.
export const SORT_ITEMS = [
  { id:'banana-peel', name:'Kulit pisang', category:'organic', emoji:'🍌', explain:'Kulit pisang berasal dari tumbuhan dan dapat diolah menjadi kompos.' },
  { id:'dry-leaves', name:'Daun kering', category:'organic', emoji:'🍂', explain:'Daun kering dapat dikumpulkan untuk bahan kompos.' },
  { id:'vegetable-scraps', name:'Sisa sayuran', category:'organic', emoji:'🥬', explain:'Sisa sayuran dapat diolah menjadi kompos bila dikelola dengan benar.' },
  { id:'plastic-bottle', name:'Botol plastik', category:'recyclable', emoji:'🧴', explain:'Botol plastik kosong dan bersih dapat dikumpulkan untuk didaur ulang.' },
  { id:'plastic-wrapper', name:'Bungkus plastik', category:'residual', emoji:'🥡', explain:'Bungkus plastik tertentu sulit didaur ulang dan masuk residu sesuai aturan setempat.' },
  { id:'drink-can', name:'Kaleng minuman', category:'recyclable', emoji:'🥫', explain:'Kaleng kosong dapat didaur ulang. Jangan pegang kaleng tajam di dunia nyata.' },
  { id:'cardboard', name:'Kardus', category:'recyclable', emoji:'📦', explain:'Kardus bersih dan kering bisa dipakai kembali atau didaur ulang.' },
  { id:'used-paper', name:'Kertas bekas', category:'recyclable', emoji:'📄', explain:'Kertas bersih dan kering dapat dikumpulkan untuk didaur ulang.' },
  { id:'newspaper', name:'Koran bekas', category:'recyclable', emoji:'📰', explain:'Koran bekas dapat dikumpulkan bersama bahan kertas daur ulang.' },
  { id:'coconut-shell', name:'Tempurung kelapa', category:'organic', emoji:'🥥', explain:'Tempurung kelapa berasal dari tumbuhan; beberapa tempat dapat mengolahnya atau memanfaatkannya kembali.' },
  { id:'glass-bottle', name:'Botol kaca', category:'recyclable', emoji:'🍾', explain:'Botol kaca dapat didaur ulang, tetapi pecahan kaca berbahaya dan hanya boleh ditangani orang dewasa.' },
  { id:'plastic-container', name:'Wadah plastik', category:'recyclable', emoji:'🥣', explain:'Wadah plastik yang sesuai dapat dikosongkan, dibersihkan, lalu dikumpulkan.' },
  { id:'egg-carton', name:'Wadah telur karton', category:'recyclable', emoji:'🧺', explain:'Wadah telur berbahan kertas yang bersih dapat dikumpulkan untuk diolah kembali.' },
  { id:'used-tissue', name:'Tisu bekas', category:'residual', emoji:'🧻', explain:'Tisu bekas umumnya masuk residu. Jangan menyentuh tisu kotor sungguhan saat bermain di luar.' },
  { id:'twigs', name:'Ranting kecil', category:'organic', emoji:'🌿', explain:'Ranting kecil dan daun dapat dikumpulkan untuk kompos atau pengolahan organik.' }
];
export const SORT_BINS = [
  { id:'organic', label:'Organik', subtitle:'Sisa tumbuhan dan makanan', src:'challenge-1-trash/bins/organic.svg', emoji:'🍃' },
  { id:'recyclable', label:'Daur ulang / guna ulang', subtitle:'Benda bersih yang dapat diolah', src:'challenge-1-trash/bins/recyclable.svg', emoji:'♻️' },
  { id:'residual', label:'Residu', subtitle:'Sampah yang belum dapat diolah kembali', src:'challenge-1-trash/bins/residual.svg', emoji:'🗑️' }
];

