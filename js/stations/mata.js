import { mountStation } from '../station-shell.js';
import { getSession, saveActivity, recordAttempt, completeStation, gameAsset, escapeHTML } from '../game-core.js';
import { EXPLORE_QUESTS } from '../data/exploration-bank.js';

// Stasiun Mata menggabungkan dua mekanik lama: eksplorasi objek dan puzzle gambar.
const PUZZLE_IMAGE = gameAsset('challenge-3-puzzle/clean-river.svg');
const DEFAULT_ORDER = [2, 0, 3, 1];

let found = [];
let puzzleOrder = [...DEFAULT_ORDER];
let selectedPiece = null;
let puzzleSolved = false;
let hintLevel = 0;

const safeFound = value => Array.isArray(value)
  ? [...new Set(value.filter(id => EXPLORE_QUESTS.some(q => q.id === id)))]
  : [];
const safeOrder = value => Array.isArray(value) && value.length === 4 && value.every(n => Number.isInteger(n) && n >= 0 && n < 4) && new Set(value).size === 4
  ? [...value] : [...DEFAULT_ORDER];
const esc = value => escapeHTML(value);

function getFeedbackTarget(root) { return root.querySelector('#mata-feedback'); }
function say(root, kind, message) {
  const target = getFeedbackTarget(root);
  if (target) target.innerHTML = `<div class="feedback-box ${kind}">${message}</div>`;
}
function gameContent() {
  const session = getSession();
  const data = session.activities.mata || {};
  found = safeFound(data.explorationFound);
  puzzleOrder = safeOrder(data.puzzleOrder);
  puzzleSolved = data.puzzleSolved === true || (session.completed.mata && data.puzzleSolved !== false);
  const current = EXPLORE_QUESTS.find(q => !found.includes(q.id));
  return `
    <div class="mode-ribbon"><span class="mode-ribbon-icon">🧭</span><div><strong>Jelajah Kampung + Puzzle</strong><small>Temukan 4 benda penting, lalu susun gambar sungai sehat.</small></div><span class="mode-pill">GAME 1 & 2</span></div>
    <div id="mata-game-area">${session.completed.mata ? finishMarkup() : (current ? questMarkup(current) : puzzleMarkup())}</div>
    <div id="mata-feedback" aria-live="polite"></div>
    <div class="station-bottom"><button type="button" id="mata-hint" class="hint-button">💡 Petunjuk Raka</button><a id="mata-map-link" class="button button-soft" href="../peta.html" ${session.completed.mata ? '' : 'hidden'}>Lanjut ke peta →</a></div>`;
}
function questMarkup(q) {
  const completed = found.length;
  const character = gameAsset('characters/raka/thinking.svg');
  return `<section class="game-substage">
    <div class="substage-head"><span class="step-label">JELAJAH ${completed + 1} DARI ${EXPLORE_QUESTS.length}</span><span class="location-pill">${q.emoji} ${q.location}</span></div>
    <div class="mini-progress" aria-label="Progres eksplorasi">${EXPLORE_QUESTS.map((x,i)=>`<span class="${found.includes(x.id)?'done':x.id===q.id?'current':''}" title="${esc(x.location)}"></span>`).join('')}</div>
    <div class="guide-row"><img src="${character}" alt="Raka sedang berpikir"><div><h2>${esc(q.prompt)}</h2><p>Pilih gambar yang paling membantu lingkungan.</p></div></div>
    <div class="explore-choice-grid">${q.options.map(option=>`<button type="button" class="explore-choice" data-explore-choice="${esc(option.id)}" aria-label="Pilih ${esc(option.label)}"><span class="explore-illustration"><img src="${gameAsset(option.src)}" alt="" loading="lazy"></span><strong>${esc(option.label)}</strong><span class="choice-press">Pilih ini</span></button>`).join('')}</div>
    <div class="mode-footer"><span>${completed} benda ditemukan</span><span>Amati · Pilih · Pelajari</span></div>
  </section>`;
}
function puzzleMarkup() {
  const slots = puzzleOrder.map((piece, slot) => {
    const positions = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
    return `<button type="button" class="puzzle-piece ${selectedPiece === slot ? 'is-selected' : ''}" data-puzzle-slot="${slot}" aria-label="Potongan ${slot+1}; gambar bagian ${piece+1}" style="background-image:url('${PUZZLE_IMAGE}');background-size:200% 200%;background-position:${positions[piece]}"><span>${slot + 1}</span></button>`;
  }).join('');
  return `<section class="game-substage">
    <div class="substage-head"><span class="step-label">GAME SUSUN GAMBAR</span><span class="location-pill">🧩 Puzzle 2 × 2</span></div>
    <div class="guide-row"><img src="${gameAsset('characters/sari/pointing.svg')}" alt="Sari memberi petunjuk"><div><h2>Susun sungai sehat!</h2><p>Sentuh dua potongan untuk menukar tempatnya sampai gambar menjadi utuh.</p></div></div>
    <div class="puzzle-wrap"><div class="puzzle-board" role="group" aria-label="Papan puzzle sungai sehat">${slots}</div><div class="puzzle-side-note"><span class="puzzle-emoji">🌊</span><strong>Air jernih membuat ikan nyaman.</strong><p>Gunakan gambar contoh di bawah untuk membantu menemukan susunan yang benar.</p><img class="puzzle-preview" src="${PUZZLE_IMAGE}" alt="Contoh gambar sungai sehat yang harus disusun" loading="lazy"><button type="button" class="button button-soft" id="puzzle-reset">Acak lagi ↻</button></div></div>
    <div class="mode-footer"><span>Eksplorasi selesai ✓</span><span>Susunan benar: ${puzzleOrder.every((value,index)=>value===index)?'4 / 4':'belum lengkap'}</span></div>
  </section>`;
}
function finishMarkup() {
  return `<section class="reward-panel"><div class="locked-emoji">🧩🌱</div><h2>Mata Alam Hebat!</h2><p class="activity-prompt">Kamu menemukan benda yang membantu kebun, rumah, kampung, dan sungai. Kamu juga berhasil menyusun gambar sungai sehat.</p><img class="station-reward-character" src="${gameAsset('characters/raka/celebrate.svg')}" alt="Raka merayakan keberhasilan"><div class="result-summary">Lencana Mata Alam tersimpan. Berikutnya, kita belajar memakai hati yang peduli.</div></section>`;
}
function completeMata(root) {
  puzzleSolved = true;
  saveActivity('mata', { explorationFound: [...found], puzzleOrder: [...puzzleOrder], puzzleSolved: true });
  completeStation('mata', { explorationFound: [...found], puzzleSolved: true, mode: 'exploration+puzzle' });
  const area = root.querySelector('#mata-game-area');
  if (area) area.innerHTML = finishMarkup();
  const mapLink = root.querySelector('#mata-map-link');
  if (mapLink) mapLink.hidden = false;
  say(root, 'good', 'Hebat! <b>Lencana Mata Alam</b> berhasil diraih. Kamu sudah menyelesaikan jelajah dan puzzle.');
}
function renderGame(root) {
  const area = root.querySelector('#mata-game-area');
  const session = getSession();
  const current = EXPLORE_QUESTS.find(q => !found.includes(q.id));
  if (session.completed.mata) {
    area.innerHTML = finishMarkup();
    root.querySelector('#mata-map-link').hidden = false;
  } else if (current) {
    area.innerHTML = questMarkup(current);
  } else if (puzzleSolved) {
    completeMata(root);
  } else {
    area.innerHTML = puzzleMarkup();
  }
}
function chooseExplore(root, optionId) {
  const quest = EXPLORE_QUESTS.find(q => !found.includes(q.id));
  if (!quest) return;
  const option = quest.options.find(x => x.id === optionId);
  if (!option) return;
  recordAttempt('mata', { mode: 'exploration', quest: quest.id, choice: optionId, correct: option.correct });
  if (!option.correct) {
    say(root, 'try', `Belum tepat. ${option.why} Coba gambar lain, ya.`);
    return;
  }
  if (!found.includes(quest.id)) found.push(quest.id);
  saveActivity('mata', { explorationFound: [...found] });
  say(root, 'good', option.why);
  if (found.length === EXPLORE_QUESTS.length) {
    const area = root.querySelector('#mata-game-area');
    area.innerHTML = puzzleMarkup();
    say(root, 'good', 'Semua titik kampung berhasil dijelajahi! Sekarang susun puzzle sungai sehat.');
  } else {
    renderGame(root);
    say(root, 'good', option.why);
  }
}
function clickPuzzlePiece(root, slot) {
  if (slot < 0 || slot > 3) return;
  if (selectedPiece === null) {
    selectedPiece = slot;
    root.querySelectorAll('[data-puzzle-slot]').forEach(el => el.classList.toggle('is-selected', Number(el.dataset.puzzleSlot) === slot));
    say(root, 'neutral', 'Potongan dipilih. Sekarang pilih potongan lain untuk menukar posisinya.');
    return;
  }
  if (selectedPiece === slot) {
    selectedPiece = null;
    root.querySelectorAll('[data-puzzle-slot]').forEach(el => el.classList.remove('is-selected'));
    return;
  }
  const temp = puzzleOrder[selectedPiece];
  puzzleOrder[selectedPiece] = puzzleOrder[slot];
  puzzleOrder[slot] = temp;
  selectedPiece = null;
  saveActivity('mata', { explorationFound: [...found], puzzleOrder: [...puzzleOrder], puzzleSolved: false });
  recordAttempt('mata', { mode: 'puzzle', order: [...puzzleOrder], correct: puzzleOrder.every((value,index)=>value===index) });
  if (puzzleOrder.every((value,index)=>value===index)) {
    completeMata(root);
  } else {
    renderGame(root);
    say(root, 'neutral', 'Bagus! Dua potongan sudah bertukar. Lihat lagi, lalu susun sampai gambarnya utuh.');
  }
}

const initial = getSession();
const initialData = initial.activities.mata || {};
found = safeFound(initialData.explorationFound);
puzzleOrder = safeOrder(initialData.puzzleOrder);
puzzleSolved = initialData.puzzleSolved === true;

mountStation({
  key: 'mata',
  localControls: true,
  title: 'Mata Alam',
  kicker: 'STASIUN MATA · JELAJAH DAN SUSUN',
  subtitle: 'Ayo jelajahi kebun, rumah, kampung, dan sungai. Temukan benda yang tepat lalu susun puzzle sungai sehat.',
  content: gameContent,
  onHint: ({ root }) => {
    const current = EXPLORE_QUESTS.find(q => !found.includes(q.id));
    if (current) say(root, 'neutral', current.hint);
    else if (!puzzleSolved) say(root, 'neutral', 'Pilih dua potongan puzzle secara bergantian untuk menukar tempatnya. Lihat warna langit, pepohonan, dan air.');
    else say(root, 'neutral', 'Hebat! Jelajah dan puzzle sudah selesai.');
  },
  init: ({ root }) => {
    const area = root.querySelector('#mata-game-area');
    area.addEventListener('click', event => {
      const choice = event.target.closest('[data-explore-choice]');
      if (choice) { chooseExplore(root, choice.dataset.exploreChoice); return; }
      const piece = event.target.closest('[data-puzzle-slot]');
      if (piece) { clickPuzzlePiece(root, Number(piece.dataset.puzzleSlot)); return; }
      if (event.target.closest('#puzzle-reset')) {
        puzzleOrder = [...DEFAULT_ORDER];
        if (puzzleOrder.every((v,i)=>v===i)) puzzleOrder=[1,0,3,2];
        selectedPiece = null;
        saveActivity('mata', { explorationFound: [...found], puzzleOrder: [...puzzleOrder], puzzleSolved: false });
        renderGame(root);
        say(root, 'neutral', 'Puzzle diacak kembali. Coba susun gambarnya.');
      }
    });
    const hint = root.querySelector('#mata-hint');
    hint.addEventListener('click', () => {
      const current = EXPLORE_QUESTS.find(q => !found.includes(q.id));
      if (current) say(root, 'neutral', current.hint);
      else if (!puzzleSolved) say(root, 'neutral', 'Sentuh dua potongan untuk menukar tempatnya. Potongan dengan langit ada di bagian atas gambar.');
    });
    if (!initial.completed.mata) say(root, 'neutral', 'Mulai dengan memilih benda yang paling membantu lingkungan. Jika belum tepat, Raka akan memberi penjelasan.');
  }
});
