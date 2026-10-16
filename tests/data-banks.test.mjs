import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUIZ_BANK } from '../js/data/quiz-bank.js';
import { EXPLORE_QUESTS } from '../js/data/exploration-bank.js';
import { SORT_ITEMS, SORT_BINS } from '../js/data/trash-bank.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('bank kuis memuat 20 soal dengan jawaban dan pembahasan lengkap', () => {
  assert.equal(QUIZ_BANK.length, 20);
  assert.equal(new Set(QUIZ_BANK.map(q => q.id)).size, 20);
  for (const q of QUIZ_BANK) {
    assert.match(q.id, /^q\d{2}$/);
    assert.ok(q.q && q.explain && q.hint, `soal ${q.id} harus punya pertanyaan, pembahasan, petunjuk`);
    assert.equal(q.choices.length, 3, `${q.id} harus memiliki tiga pilihan ramah anak`);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.choices.length, `${q.id} indeks jawaban tidak valid`);
  }
});

test('bank eksplorasi memiliki empat misi dan setiap ilustrasi tersedia', () => {
  assert.equal(EXPLORE_QUESTS.length, 4);
  assert.equal(new Set(EXPLORE_QUESTS.map(q => q.id)).size, 4);
  for (const q of EXPLORE_QUESTS) {
    assert.ok(q.prompt && q.hint && q.location);
    assert.equal(q.options.length, 3);
    assert.equal(q.options.filter(o => o.correct).length, 1, `${q.id} harus punya satu jawaban benar`);
    for (const option of q.options) {
      assert.ok(fs.existsSync(path.join(root, 'assets/games', option.src)), `aset hilang: ${option.src}`);
    }
  }
  assert.ok(fs.existsSync(path.join(root, 'assets/games/challenge-3-puzzle/clean-river.svg')));
});

test('bank pilah berisi 15 benda unik dan tiga wadah yang lengkap', () => {
  assert.equal(SORT_ITEMS.length, 15);
  assert.equal(new Set(SORT_ITEMS.map(item => item.id)).size, 15);
  assert.deepEqual(new Set(SORT_ITEMS.map(item => item.category)), new Set(['organic','recyclable','residual']));
  assert.equal(SORT_BINS.length, 3);
  for (const item of SORT_ITEMS) {
    assert.ok(item.name && item.explain && item.emoji);
    assert.ok(fs.existsSync(path.join(root, 'assets/games/challenge-1-trash/items', `${item.id}.svg`)), `ilustrasi benda ${item.id} hilang`);
  }
  for (const bin of SORT_BINS) assert.ok(fs.existsSync(path.join(root, 'assets/games', bin.src)), `ilustrasi wadah ${bin.src} hilang`);
});

test('Tailwind CSS sudah terbundel dan utility yang dipakai tersedia', () => {
  const css = fs.readFileSync(path.join(root, 'css/tailwind.css'), 'utf8');
  assert.match(css, /tailwindcss v4/);
  assert.match(css, /\.transition-transform/);
  assert.match(css, /\.hover\\:-translate-y-1/);
  assert.match(css, /\.focus-visible\\:ring-4/);
});
