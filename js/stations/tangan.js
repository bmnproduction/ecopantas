import { mountStation } from '../station-shell.js';
import { getSession, saveActivity, recordAttempt, completeStation, gameAsset, escapeHTML } from '../game-core.js';
import { SORT_ITEMS, SORT_BINS } from '../data/trash-bank.js';

const esc = value => escapeHTML(value);
let selected = null;
let sorted = {};

function say(root, kind, message) {
  const box = root.querySelector('#sort-feedback');
  if (box) box.innerHTML = `<div class="feedback-box ${kind}">${message}</div>`;
}
function finishedMarkup() {
  return `<div class="reward-panel"><div class="locked-emoji">♻️🌱</div><h2>Tangan Terampil!</h2><p class="activity-prompt">Semua 15 benda sudah dipilah. Kamu sudah belajar membedakan organik, benda yang dapat digunakan kembali/didaur ulang, dan residu.</p><img class="station-reward-character" src="${gameAsset('characters/raka/celebrate.svg')}" alt="Raka merayakan keberhasilan"><a class="button button-primary" href="../peta.html">Lanjut ke peta →</a></div>`;
}
function contentMarkup() {
  const session = getSession();
  const data = session.activities.tangan || {};
  const saved = data.sorted && typeof data.sorted === 'object' && !Array.isArray(data.sorted) ? data.sorted : {};
  sorted = Object.fromEntries(Object.entries(saved).filter(([id, category]) => SORT_ITEMS.some(item => item.id === id && item.category === category)));
  const alreadyDone = session.completed.tangan || SORT_ITEMS.every(item => sorted[item.id] === item.category);
  return `<div class="mode-ribbon"><span class="mode-ribbon-icon">🧺</span><div><strong>Misi pilah 15 benda</strong><small>Sentuh benda lalu wadah, atau seret benda ke wadah (desktop).</small></div><span class="mode-pill">GAME 4</span></div><div id="sorting-game-area">${alreadyDone ? finishedMarkup() : sortingMarkup()}</div><div id="sort-feedback" aria-live="polite"></div>`;
}
function sortingMarkup() {
  const count = Object.keys(sorted).length;
  const currentItem = SORT_ITEMS.find(item => !sorted[item.id]);
  return `<section class="sorting-stage">
    <div class="substage-head"><span class="step-label">MISI PEMILAHAN SAMPAH</span><span class="location-pill">🧺 ${count} / ${SORT_ITEMS.length} benda</span></div>
    <div class="guide-row"><img src="${gameAsset('characters/raka/pointing.svg')}" alt="Raka menunjukkan benda"><div><h2>Pilih benda, lalu pilih wadahnya.</h2><p>Gunakan benda bersih dalam permainan. Jangan menyentuh sampah asli yang kotor atau tajam.</p></div></div>
    <div class="sorting-progress"><span style="width:${count / SORT_ITEMS.length * 100}%"></span></div>
    <div class="sorting-layout redesigned-sorting-layout">
      <div class="items-column"><div class="column-heading"><strong>Benda yang perlu dipilah</strong><span>${count} selesai</span></div><div class="sorting-items redesigned-items">${SORT_ITEMS.map(item => {
        const isSorted = sorted[item.id] === item.category;
        return `<button type="button" class="sort-item redesigned-sort-item ${isSorted?'sorted':''} ${selected===item.id?'selected':''}" data-item="${item.id}" draggable="${!isSorted}" ${isSorted?'disabled':''} aria-label="${esc(item.name)}${isSorted?', sudah dipilah':''}"><span class="sort-item-picture"><img src="${gameAsset(`challenge-1-trash/items/${item.id}.svg`)}" alt="" loading="lazy"></span><strong>${esc(item.name)}</strong>${isSorted?'<small>✓ Terpilah</small>':selected===item.id?'<small>Dipilih</small>':''}</button>`;
      }).join('')}</div></div>
      <div class="bins-column"><div class="column-heading"><strong>Tempat pemilahan</strong><span>Pilih kategori yang tepat</span></div><div class="sorting-instruction" id="sort-instruction">${currentItem ? `Benda berikutnya: ${esc(currentItem.name)}.` : 'Semua benda sudah dipilah!'}</div><div class="bin-list redesigned-bin-list">${SORT_BINS.map(bin=>`<button type="button" class="bin-button redesigned-bin-button" data-bin="${bin.id}"><img src="${gameAsset(bin.src)}" alt="" loading="lazy"><span class="bin-copy"><strong>${bin.emoji} ${bin.label}</strong><small>${bin.subtitle}</small></span><span class="bin-arrow">→</span></button>`).join('')}</div><div class="safe-note">🛡️ <span>Di dunia nyata, mintalah bantuan guru/orang tua untuk memilah benda yang belum dikenal.</span></div></div>
    </div>
    <div class="sorting-bottom"><button type="button" class="hint-button" id="sort-hint">💡 Petunjuk Raka dan Sari</button><span>Jawaban belum tepat? Tidak apa-apa, coba lagi!</span></div>
  </section>`;
}
function render(root) {
  const area = root.querySelector('#sorting-game-area');
  if (!area) return;
  if (getSession().completed.tangan || SORT_ITEMS.every(item => sorted[item.id] === item.category)) {
    completeStation('tangan', { sorted: { ...sorted }, total: SORT_ITEMS.length, mechanic: 'drag-drop-sorting' });
    area.innerHTML = finishedMarkup();
  } else area.innerHTML = sortingMarkup();
}
function trySort(root, itemId, category) {
  const item = SORT_ITEMS.find(x => x.id === itemId);
  if (!item || sorted[item.id] === item.category) return;
  recordAttempt('tangan', { item: item.id, category, correct: item.category === category, mechanic: 'sorting' });
  if (item.category !== category) {
    say(root, 'try', `Belum tepat. ${esc(item.explain)} Coba wadah lain, ya.`);
    return;
  }
  sorted[item.id] = category;
  selected = null;
  saveActivity('tangan', { sorted: { ...sorted }, count: Object.keys(sorted).length });
  say(root, 'good', `Benar! ${esc(item.explain)}`);
  render(root);
  if (SORT_ITEMS.every(x => sorted[x.id] === x.category)) {
    say(root, 'good', 'Luar biasa! Semua benda sudah dipilah. Lencana <b>Tangan Terampil</b> berhasil didapatkan.');
  }
}

const session = getSession();
const previous = session.activities.tangan || {};
const old = previous.sorted && typeof previous.sorted === 'object' && !Array.isArray(previous.sorted) ? previous.sorted : {};
sorted = Object.fromEntries(Object.entries(old).filter(([id, category]) => SORT_ITEMS.some(item => item.id === id && item.category === category)));

mountStation({
  key: 'tangan',
  localControls: true,
  title: 'Tangan Terampil',
  kicker: 'STASIUN TANGAN · PILAH SAMPAH',
  subtitle: 'Mari bantu kampung tetap bersih. Kenali benda, pilih kelompoknya, dan pelajari alasan di balik setiap jawaban.',
  content: contentMarkup,
  onHint: ({ root }) => say(root, 'neutral', 'Organik: sisa tumbuhan dan makanan. Daur ulang/guna ulang: benda bersih yang dapat diolah kembali. Residu: bahan yang belum bisa diolah kembali; ikuti aturan setempat.'),
  init: ({ root }) => {
    const area = root.querySelector('#sorting-game-area');
    area.addEventListener('click', event => {
      const itemButton = event.target.closest('[data-item]');
      if (itemButton) {
        const item = SORT_ITEMS.find(x => x.id === itemButton.dataset.item);
        if (!item || sorted[item.id] === item.category) return;
        selected = item.id;
        render(root);
        say(root, 'neutral', `Kamu memilih ${esc(item.name)}. Sekarang pilih tempat pemilahannya.`);
        return;
      }
      const binButton = event.target.closest('[data-bin]');
      if (binButton) {
        if (!selected) { say(root, 'neutral', 'Sentuh satu benda terlebih dahulu, lalu pilih wadahnya.'); return; }
        trySort(root, selected, binButton.dataset.bin);
        return;
      }
      if (event.target.closest('#sort-hint')) say(root, 'neutral', 'Daun, kulit buah, dan sisa sayur termasuk organik. Benda bersih tertentu bisa didaur ulang. Bungkus plastik dan tisu bekas umumnya residu.');
    });
    area.addEventListener('dragstart', event => {
      const itemButton = event.target.closest('[data-item]');
      if (!itemButton || sorted[itemButton.dataset.item]) return;
      selected = itemButton.dataset.item;
      if (event.dataTransfer) { event.dataTransfer.setData('text/plain', selected); event.dataTransfer.effectAllowed = 'move'; }
    });
    area.addEventListener('dragover', event => {
      const bin = event.target.closest('[data-bin]');
      if (bin) { event.preventDefault(); bin.classList.add('drag-over'); }
    });
    area.addEventListener('dragleave', event => {
      const bin = event.target.closest('[data-bin]');
      if (bin && !bin.contains(event.relatedTarget)) bin.classList.remove('drag-over');
    });
    area.addEventListener('drop', event => {
      const bin = event.target.closest('[data-bin]');
      if (!bin) return;
      event.preventDefault();
      bin.classList.remove('drag-over');
      const transfer = event.dataTransfer?.getData('text/plain');
      const id = transfer || selected;
      if (id) trySort(root, id, bin.dataset.bin);
    });
    if (session.completed.tangan) say(root, 'good', 'Stasiun ini sudah selesai. Kamu boleh melihat kembali kelompok pemilahan.');
  }
});
