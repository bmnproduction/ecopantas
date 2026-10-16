import test from 'node:test';
import assert from 'node:assert/strict';

let caseNo = 0;
class TestStorage {
  constructor(seed = {}) { this.data = new Map(Object.entries(seed)); this.blocked = false; this.writeBlocked = false; }
  getItem(key) { if (this.blocked) throw new Error('storage blocked'); return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { if (this.blocked || this.writeBlocked) throw new Error('storage write blocked'); this.data.set(key, String(value)); }
  removeItem(key) { if (this.blocked) throw new Error('storage blocked'); this.data.delete(key); }
  clear() { this.data.clear(); }
}
async function loadCore(storage = new TestStorage(), sessionStore = new TestStorage()) {
  globalThis.localStorage = storage;
  globalThis.sessionStorage = sessionStore;
  globalThis.window = { dispatchEvent() {} };
  globalThis.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
  const core = await import(`../js/game-core.js?test=${++caseNo}`);
  return { core, storage };
}

test('sesi baru mempunyai satu deadline 7 menit dan progres awal bersih', async () => {
  const { core } = await loadCore();
  const initial = core.getSession();
  assert.equal(initial.status, 'ready');
  assert.deepEqual(initial.completed, { mata: false, hati: false, tangan: false, 'aksi-nyata': false });
  const started = core.startNewJourney('Raka');
  assert.equal(started.status, 'playing');
  assert.equal(started.childName, 'Raka');
  assert.ok(started.deadlineAt - started.startedAt === 420_000);
  assert.equal(core.remainingSeconds(), 420);
  assert.equal(core.formatTime(420), '07:00');
});

test('stasiun terkunci sesuai urutan dan satu rangkaian selesai sampai Aksi Nyata', async () => {
  const { core } = await loadCore();
  core.startNewJourney();
  assert.equal(core.isStationUnlocked('mata'), true);
  assert.equal(core.isStationUnlocked('hati'), false);
  assert.equal(core.isStationUnlocked('tangan'), false);
  assert.equal(core.isStationUnlocked('aksi-nyata'), false);
  core.completeStation('hati');
  assert.equal(core.getSession().completed.hati, false, 'stasiun terkunci tidak boleh ditandai selesai');
  core.completeStation('mata', { round: 3 });
  assert.equal(core.isStationUnlocked('hati'), true);
  core.completeStation('hati', { round: 3 });
  assert.equal(core.isStationUnlocked('tangan'), true);
  core.completeStation('tangan', { sorted: { a: 'organic' } });
  assert.equal(core.getSession().status, 'offline');
  assert.equal(core.getSession().deadlineAt, null);
  assert.equal(core.isStationUnlocked('aksi-nyata'), true);
  core.completeStation('aksi-nyata', { adultConfirmed: true });
  const final = core.getSession();
  assert.equal(final.status, 'completed');
  assert.equal(core.getProgress(final), 4);
  assert.equal(final.badges.length, 4);
});

test('Aksi Nyata tidak bisa diselesaikan sebelum tiga stasiun digital', async () => {
  const { core } = await loadCore();
  core.startNewJourney();
  core.completeStation('aksi-nyata', { adultConfirmed: true });
  assert.equal(core.getSession().completed['aksi-nyata'], false);
  assert.equal(core.getSession().status, 'playing');
});

test('timer yang lewat batas mengunci progres baru', async () => {
  const { core, storage } = await loadCore();
  core.startNewJourney();
  const s = JSON.parse(storage.getItem(core.STORAGE_KEY));
  s.deadlineAt = Date.now() - 1_000;
  s.lastUpdatedAt = Date.now() + 1;
  storage.setItem(core.STORAGE_KEY, JSON.stringify(s));
  core.completeStation('mata');
  assert.equal(core.getSession().status, 'timeup');
  assert.equal(core.getSession().completed.mata, false);
  assert.equal(core.remainingSeconds(), 0);
});

test('deadline yang rusak tidak membiarkan sesi playing selamanya', async () => {
  const { core, storage } = await loadCore();
  core.startNewJourney();
  const s = JSON.parse(storage.getItem(core.STORAGE_KEY));
  s.deadlineAt = null;
  s.lastUpdatedAt = Date.now() + 1;
  storage.setItem(core.STORAGE_KEY, JSON.stringify(s));
  assert.equal(core.remainingSeconds(), 0);
  assert.equal(core.getSession().status, 'timeup');
});

test('progres tetap bekerja dengan fallback memori ketika localStorage diblokir', async () => {
  const storage = new TestStorage();
  const sessionStore = new TestStorage();
  storage.blocked = true;sessionStore.blocked = true;
  const { core } = await loadCore(storage, sessionStore);
  core.startNewJourney('Sari');
  assert.equal(core.getSession().status, 'playing');
  core.completeStation('mata');
  assert.equal(core.getSession().completed.mata, true);
  assert.equal(core.getSession().childName, 'Sari');
});

test('migrasi sesi lama masih mempertahankan tantangan selesai yang dikenali', async () => {
  const storage = new TestStorage({ ecoGameSession_v5: JSON.stringify({ completed: { challenge1: true, challenge2: true } }) });
  const { core } = await loadCore(storage);
  const s = core.getSession();
  assert.equal(s.completed.tangan, true);
  assert.equal(s.completed.hati, true);
  assert.equal(s.schemaVersion, 6);
  assert.ok(storage.getItem(core.STORAGE_KEY));
});

test('jumlah riwayat percobaan dibatasi dan nama stasiun tidak valid diabaikan', async () => {
  const { core } = await loadCore();
  core.startNewJourney();
  for (let i = 0; i < 205; i++) core.recordAttempt('mata', { round: i });
  assert.equal(core.getSession().attempts.length, 200);
  const before = core.getSession().completed;
  core.completeStation('not-a-station');
  assert.deepEqual(core.getSession().completed, before);
});

test('migrasi menggabungkan data timer v5 dan progres challenge dari v4', async () => {
  const storage = new TestStorage({
    ecoGameSession_v5: JSON.stringify({ status: 'playing', startedAt: Date.now() - 5_000, deadlineAt: Date.now() + 415_000 }),
    ecoGameSession_v4: JSON.stringify({ completed: { challenge1: true, challenge2: true } })
  });
  const { core } = await loadCore(storage);
  const s = core.getSession();
  assert.equal(s.completed.tangan, true, 'progres challenge 1 dari v4 tetap terambil');
  assert.equal(s.completed.hati, true, 'progres challenge 2 dari v4 tetap terambil');
  assert.equal(s.status, 'playing');
  assert.ok(s.deadlineAt > Date.now());
  assert.match(s.migratedFrom, /ecoGameSession_v5/);
  assert.match(s.migratedFrom, /ecoGameSession_v4/);
});

test('semua stasiun digital yang selesai tetap membuka Aksi Nyata meski deadline lama lewat', async () => {
  const { core, storage } = await loadCore();
  const session = JSON.parse(JSON.stringify(core.startNewJourney()));
  session.completed.mata = true;
  session.completed.hati = true;
  session.completed.tangan = true;
  session.status = 'timeup';
  session.deadlineAt = Date.now() - 1_000;
  session.lastUpdatedAt = Date.now() + 1;
  storage.setItem(core.STORAGE_KEY, JSON.stringify(session));
  assert.equal(core.getSession().status, 'offline');
  assert.equal(core.isStationUnlocked('aksi-nyata'), true);
  assert.equal(core.remainingSeconds(), 0);
});


test('sessionStorage menjaga progres lintas pemuatan halaman saat localStorage diblokir', async () => {
  const localStore = new TestStorage();localStore.blocked = true;
  const sessionStore = new TestStorage();
  const first = await loadCore(localStore, sessionStore);
  first.core.startNewJourney('Raka');
  first.core.completeStation('mata');
  const second = await loadCore(localStore, sessionStore);
  assert.equal(second.core.getSession().status, 'playing');
  assert.equal(second.core.getSession().completed.mata, true);
  assert.equal(second.core.isStationUnlocked('hati'), true);
});


test('progres legacy tanpa metadata timer tetap dapat dilanjutkan dan tidak terhapus', async () => {
  const storage = new TestStorage({ ecoGameSession_v4: JSON.stringify({ completed: { challenge3: true }, activities: { challenge3: { round: 3 } } }) });
  const { core } = await loadCore(storage);
  const s = core.getSession();
  assert.equal(s.completed.mata, true);
  assert.equal(s.status, 'playing');
  assert.ok(s.deadlineAt > Date.now());
  assert.equal(s.activities.mata.round, 3);
  assert.equal(core.isStationUnlocked('hati'), true);
});


test('salinan sesi paling baru dipilih bila localStorage dan sessionStorage berbeda', async () => {
  const older = { schemaVersion: 6, lastUpdatedAt: 100, status: 'ready', completed: { mata: false, hati: false, tangan: false, 'aksi-nyata': false } };
  const newer = { schemaVersion: 6, lastUpdatedAt: 200, status: 'playing', startedAt: 150, deadlineAt: Date.now() + 410_000, childName: 'Sari', completed: { mata: true, hati: false, tangan: false, 'aksi-nyata': false } };
  const local = new TestStorage({ ecoPantasSession_v6: JSON.stringify(older) });
  const session = new TestStorage({ ecoPantasSession_v6: JSON.stringify(newer) });
  const { core } = await loadCore(local, session);
  const selected = core.getSession();
  assert.equal(selected.childName, 'Sari');
  assert.equal(selected.completed.mata, true);
  assert.equal(JSON.parse(local.getItem(core.STORAGE_KEY)).lastUpdatedAt, 200);
});

test('salinan memori yang lebih baru tidak ditimpa bila semua penulisan storage gagal', async () => {
  const local = new TestStorage();
  const session = new TestStorage();
  const { core } = await loadCore(local, session);
  core.getSession();
  local.writeBlocked = true;
  session.writeBlocked = true;
  core.startNewJourney('Sari');
  const selected = core.getSession();
  assert.equal(selected.status, 'playing');
  assert.equal(selected.childName, 'Sari');
});
