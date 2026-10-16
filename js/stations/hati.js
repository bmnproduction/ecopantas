import { mountStation } from '../station-shell.js';
import { getSession, saveActivity, recordAttempt, completeStation, gameAsset, escapeHTML } from '../game-core.js';
import { QUIZ_BANK } from '../data/quiz-bank.js';

const TOTAL = QUIZ_BANK.length;
const safeIndex = value => Number.isInteger(Number(value)) ? Math.min(TOTAL - 1, Math.max(0, Number(value))) : 0;
const safeSolved = value => Array.isArray(value) ? [...new Set(value.filter(id => QUIZ_BANK.some(q => q.id === id)))] : [];
const esc = value => escapeHTML(value);
let index = 0;
let solved = [];
let answerStates = {};
let revealedHint = false;

function say(root, kind, message) {
  const feedback = root.querySelector('#hati-feedback');
  if (feedback) feedback.innerHTML = `<div class="feedback-box ${kind}">${message}</div>`;
}
function completedMarkup() {
  return `<div class="reward-panel"><div class="locked-emoji">💚🪷</div><h2>Hati Peduli!</h2><p class="activity-prompt">Kamu sudah menjawab seluruh 20 soal. Kamu belajar menjaga alam, menyayangi makhluk hidup, berhemat, bersikap sopan, dan bergotong royong.</p><img class="station-reward-character" src="${gameAsset('characters/sari/celebrate.svg')}" alt="Sari merayakan keberhasilan"><div class="result-summary">Lencana Hati Peduli sudah tersimpan. Selanjutnya, gunakan tangan terampil untuk memilah 15 benda.</div><a class="button button-primary" href="../peta.html">Lanjut ke peta →</a></div>`;
}
function quizMarkup() {
  const q = QUIZ_BANK[index];
  const isSolved = solved.includes(q.id);
  const state = answerStates[q.id] || '';
  const correct = q.choices[q.correct];
  return `<section class="quiz-stage">
    <div class="substage-head"><span class="step-label">ENGKLEK PINTAR NUSANTARA</span><span class="location-pill">🪷 Soal ${index + 1} / ${TOTAL}</span></div>
    <div class="quiz-step-track" aria-label="Progres 20 soal">${QUIZ_BANK.map((item,i)=>`<button type="button" class="quiz-step ${solved.includes(item.id)?'done':i===index?'current':''}" data-question-index="${i}" aria-label="Buka soal ${i+1}" title="Soal ${i+1}">${i+1}</button>`).join('')}</div>
    <div class="quiz-question-layout">
      <div class="quiz-illustration-card"><img src="${gameAsset(`challenge-2-quiz/questions/${q.id}.svg`)}" alt="Ilustrasi soal tentang ${esc(q.q)}" loading="lazy"><div class="quiz-illustration-caption">Amati gambar, lalu pikirkan jawabannya.</div></div>
      <div class="quiz-question-copy"><div class="question-overline">SOAL ${String(index + 1).padStart(2,'0')} · TEMAN BUMI</div><h2>${esc(q.q)}</h2><p>Pilih satu jawaban. Jawaban yang belum tepat boleh dicoba lagi.</p><div class="quiz-answer-grid">${q.choices.map((choice,i)=>`<button type="button" class="quiz-answer ${isSolved&&i===q.correct?'is-correct':''} ${state==='wrong'&&i===Number(answerStates[`${q.id}:lastChoice`])?'is-wrong':''}" data-answer-index="${i}" ${isSolved?'disabled':''}><span class="answer-emoji">${choice[0]}</span><span>${esc(choice[1])}</span><span class="answer-check">${isSolved&&i===q.correct?'✓':''}</span></button>`).join('')}</div></div>
    </div>
    <div class="quiz-scorebar"><div><strong>${solved.length} dari ${TOTAL}</strong><span>soal dijawab dengan benar</span></div><div class="scorebar-track"><span style="width:${solved.length / TOTAL * 100}%"></span></div><div class="quiz-score-percent">${Math.round(solved.length / TOTAL * 100)}%</div></div>
    <div class="quiz-navigation"><button type="button" class="button button-soft" id="hati-prev" ${index===0?'disabled':''}>← Sebelumnya</button><button type="button" class="hint-button" id="hati-hint">💡 Petunjuk</button><button type="button" class="button button-soft" id="hati-skip">Lewati dulu ↷</button><button type="button" class="button button-primary" id="hati-next">${index===TOTAL-1?'Periksa jawaban':'Berikutnya →'}</button></div>
    <div class="quiz-explanation ${isSolved?'is-visible':''}" id="hati-explanation" aria-live="polite">${isSolved?`<strong>Benar!</strong> ${esc(q.explain)}`:revealedHint?`<strong>Petunjuk Sari:</strong> ${esc(q.hint)}`:'Pilih jawaban untuk melihat penjelasannya.'}</div>
  </section>`;
}
function render(root) {
  const session = getSession();
  const game = root.querySelector('#hati-game-area');
  if (!game) return;
  if (session.completed.hati || solved.length === TOTAL) {
    completeStation('hati', { solved: [...solved], correctCount: solved.length, total: TOTAL });
    game.innerHTML = completedMarkup();
    return;
  }
  revealedHint = false;
  game.innerHTML = quizMarkup();
}
function persist() { saveActivity('hati', { questionIndex: index, solved: [...solved], answerStates: { ...answerStates }, correctCount: solved.length, total: TOTAL }); }
function finishIfReady(root) {
  if (solved.length === TOTAL) {
    completeStation('hati', { solved: [...solved], correctCount: solved.length, total: TOTAL, mechanic: 'engklek-quiz' });
    root.querySelector('#hati-game-area').innerHTML = completedMarkup();
    say(root, 'good', 'Luar biasa! Semua soal sudah dijawab dengan benar. Lencana Hati Peduli didapatkan.');
    return true;
  }
  return false;
}

const initial = getSession();
const saved = initial.activities.hati || {};
index = safeIndex(saved.questionIndex ?? saved.round ?? 0);
solved = safeSolved(saved.solved);
answerStates = saved.answerStates && typeof saved.answerStates === 'object' && !Array.isArray(saved.answerStates) ? { ...saved.answerStates } : {};
// Compatibility: the old Hati round implementation had three questions and a correctCount field.
// It is intentionally not promoted to 20/20; previous credit stays available in history without
// incorrectly marking unseen questions complete.

mountStation({
  key: 'hati',
  localControls: true,
  title: 'Hati Peduli',
  kicker: 'STASIUN HATI · ENGKLEK PINTAR',
  subtitle: 'Setiap petak berisi pertanyaan kecil tentang menjaga alam. Amati ilustrasi, pilih jawaban, baca penjelasannya, dan coba lagi bila perlu.',
  content: () => `<div class="mode-ribbon"><span class="mode-ribbon-icon">🪷</span><div><strong>Kuis bergaya Engklek</strong><small>20 soal bergambar · bebas meninjau soal sebelumnya.</small></div><span class="mode-pill">GAME 3</span></div><div id="hati-game-area">${initial.completed.hati ? completedMarkup() : quizMarkup()}</div><div id="hati-feedback" aria-live="polite"></div>`,
  onHint: ({ root }) => {
    const q = QUIZ_BANK[index];
    say(root, 'neutral', `Petunjuk Sari: ${esc(q.hint)}`);
  },
  init: ({ root }) => {
    const area = root.querySelector('#hati-game-area');
    area.addEventListener('click', event => {
      const answer = event.target.closest('[data-answer-index]');
      if (answer) {
        const q = QUIZ_BANK[index];
        if (solved.includes(q.id)) return;
        const choiceIndex = Number(answer.dataset.answerIndex);
        const choice = q.choices[choiceIndex];
        const isCorrect = choiceIndex === q.correct;
        recordAttempt('hati', { question: q.id, choice: choice[1], correct: isCorrect });
        answerStates[q.id] = isCorrect ? 'correct' : 'wrong';
        answerStates[`${q.id}:lastChoice`] = choiceIndex;
        if (isCorrect) {
          if (!solved.includes(q.id)) solved.push(q.id);
          answerStates[q.id] = 'correct';
          persist();
          render(root);
          say(root, 'good', `Benar! ${esc(q.explain)}`);
          finishIfReady(root);
        } else {
          persist();
          render(root);
          say(root, 'try', `Belum tepat. ${esc(q.explain)} Coba pilihan lain, ya.`);
        }
        return;
      }
      const target = event.target.closest('[data-question-index]');
      if (target) { index = Number(target.dataset.questionIndex); persist(); render(root); return; }
      if (event.target.closest('#hati-prev')) { if (index > 0) { index--; persist(); render(root); } return; }
      if (event.target.closest('#hati-next')) {
        if (solved.length === TOTAL) { finishIfReady(root); return; }
        if (index < TOTAL - 1) { index++; persist(); render(root); }
        else {
          const firstUnsolved = QUIZ_BANK.findIndex(q => !solved.includes(q.id));
          if (firstUnsolved >= 0) { index = firstUnsolved; persist(); render(root); say(root, 'neutral', 'Ada soal yang belum benar. Kamu bisa kembali ke petak yang belum selesai.'); }
        }
        return;
      }
      if (event.target.closest('#hati-skip')) {
        const q = QUIZ_BANK[index];
        if (index < TOTAL - 1) { index++; persist(); render(root); say(root, 'neutral', `Soal ${q.id.slice(1)} dilewati. Kamu bisa kembali lewat nomor petak di atas.`); }
        else { const firstUnsolved = QUIZ_BANK.findIndex(item => !solved.includes(item.id)); index = firstUnsolved < 0 ? TOTAL - 1 : firstUnsolved; persist(); render(root); say(root, 'neutral', 'Kamu bisa kembali ke petak yang belum selesai.'); }
        return;
      }
      if (event.target.closest('#hati-hint')) {
        revealedHint = true;
        const q = QUIZ_BANK[index];
        const explanation = root.querySelector('#hati-explanation');
        if (explanation) { explanation.classList.add('is-visible'); explanation.innerHTML = `<strong>Petunjuk Sari:</strong> ${esc(q.hint)}`; }
        say(root, 'neutral', q.hint);
      }
    });
  }
});
