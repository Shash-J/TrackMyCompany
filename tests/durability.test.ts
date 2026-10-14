import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { getDB, getCompaniesFromDB, getProfileFromDB, migrateFromLocalStorage, STORAGE_REVISION_KEY } from '../src/services/db';
import { readStorage, SNAPSHOT_KEY, SAVE_ERROR } from '../src/services/persistence';
import {
  addCompany, deleteCompany, getCompanies, saveCompanies, saveProfile, patchCompany,
  importFromJSON, exportToJSON, mergeImportedCompanies,
} from '../src/services/storage';

const local = new Map<string, string>();
let failLocal = false;
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => local.get(key) ?? null,
  setItem: (key: string, value: string) => {
    if (failLocal) throw new DOMException('simulated local quota failure', 'QuotaExceededError');
    local.set(key, value);
  },
} });
Object.defineProperty(globalThis, 'window', { value: new EventTarget() });
const company = {
  id: 'one', name: 'Example', status: 'applied' as const, tier: 'DREAM' as const, ctc: '10 LPA',
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
};
const profile = { name: 'Original Student', batch: '2027' };
const nativePut = IDBObjectStore.prototype.put;
const failPut = (store: string) => {
  IDBObjectStore.prototype.put = function (...args) {
    if (this.name === store) throw new DOMException('simulated DB quota failure', 'QuotaExceededError');
    return nativePut.apply(this, args);
  };
};
async function seed() {
  IDBObjectStore.prototype.put = nativePut;
  failLocal = false;
  await saveCompanies([company]);
  await saveProfile(profile);
}

test('concurrent additions and independent field patches preserve every update', async () => {
  await seed();
  await Promise.all(Array.from({ length: 20 }, (_, i) => addCompany({ ...company, name: `Added ${i}` })));
  assert.equal((await getCompanies()).length, 21);
  await Promise.all([
    patchCompany('one', { notes: 'Retain this note' }),
    patchCompany('one', { oaCleared: true }),
  ]);
  const saved = (await getCompanies()).find(c => c.id === 'one')!;
  assert.equal(saved.notes, 'Retain this note');
  assert.equal(saved.oaCleared, true);
});

test('failure of both engines preserves memory, database and change notifications', async () => {
  await seed();
  const before = await readStorage();
  let notified = 0;
  const listener = () => notified++;
  window.addEventListener('storage-data-change', listener);
  failPut('companies');
  failLocal = true;
  try { await assert.rejects(saveCompanies([{ ...company, id: 'replacement' }]), { message: SAVE_ERROR }); }
  finally { IDBObjectStore.prototype.put = nativePut; failLocal = false; window.removeEventListener('storage-data-change', listener); }
  assert.equal(notified, 0);
  assert.deepEqual(await readStorage(), before);
  assert.deepEqual(await getCompaniesFromDB(), [company]);
});

test('fallback-only writes recover to IndexedDB before subsequent reads', async () => {
  await seed();
  failPut('companies');
  try { await saveCompanies([{ ...company, id: 'fallback', name: 'Fallback Saved' }]); }
  finally { IDBObjectStore.prototype.put = nativePut; }
  assert.equal((await getCompaniesFromDB())[0].id, 'one', 'failed DB replacement must roll back');
  assert.equal(JSON.parse(local.get(SNAPSHOT_KEY)!).companies[0].id, 'fallback');
  assert.equal((await getCompanies())[0].id, 'fallback');
  assert.equal((await getCompaniesFromDB())[0].id, 'fallback', 'newer checkpoint must be recovered');
});

test('fallback deletion of the final company stays empty after recovery', async () => {
  await seed();
  // Empty replacement has no company put; inject failure on the revision write.
  failPut('meta');
  try { await deleteCompany('one'); }
  finally { IDBObjectStore.prototype.put = nativePut; }
  assert.deepEqual(await getCompanies(), []);
  assert.deepEqual(await getCompaniesFromDB(), []);
  // A stale v1 mirror cannot resurrect an intentionally empty v2 dataset.
  local.set('track_my_company_companies_v1', JSON.stringify([company]));
  assert.deepEqual(await getCompanies(), []);
});

test('a DB commit survives unavailable mirrors and an older checkpoint', async () => {
  await seed();
  const old = local.get(SNAPSHOT_KEY)!;
  failLocal = true;
  try { await patchCompany('one', { notes: 'DB committed' }); }
  finally { failLocal = false; }
  assert.equal(local.get(SNAPSHOT_KEY), old);
  assert.equal((await getCompanies())[0].notes, 'DB committed');
  assert.equal(JSON.parse(local.get(SNAPSHOT_KEY)!).companies[0].notes, 'DB committed');
});

test('malformed backups and duplicate IDs make no writes', async () => {
  await seed();
  const before = await readStorage();
  const malformed = ['{}', '[]', 'null', '{', JSON.stringify({ profile: { name: 'Changed' }, companies: [null] }),
    JSON.stringify({ companies: [{ ...company, rejectionReasonTags: [7] }] }),
    JSON.stringify({ companies: [company, company] }),
    JSON.stringify({ companies: [{ ...company, status: 'invalid' }] })];
  for (const backup of malformed) assert.equal(await importFromJSON(backup), false);
  assert.deepEqual(await readStorage(), before);
});

test('restore rolls back both stores when a later profile write fails and fallback is full', async () => {
  await seed();
  failPut('profile');
  failLocal = true;
  try {
    await assert.rejects(importFromJSON(JSON.stringify({
      companies: [{ ...company, id: 'replacement' }], profile: { name: 'Replacement' },
    })), { message: SAVE_ERROR });
  } finally { IDBObjectStore.prototype.put = nativePut; failLocal = false; }
  assert.deepEqual(await getCompaniesFromDB(), [company]);
  assert.deepEqual(await getProfileFromDB(), profile);
});

test('restore and spreadsheet import save profile and companies in one fallback checkpoint', async () => {
  await seed();
  failPut('profile');
  try {
    assert.equal(await importFromJSON(JSON.stringify({ companies: [], profile: { name: 'Restored' } })), true);
  } finally { IDBObjectStore.prototype.put = nativePut; }
  assert.deepEqual((await readStorage()).companies, []);
  assert.equal((await readStorage()).profile?.name, 'Restored');
  await seed();
  const result = await mergeImportedCompanies([
    { ...company, id: 'different', notes: '', name: ' example ' },
    { ...company, id: 'two', name: 'New' },
    { ...company, id: 'three', name: 'Another New' },
  ], { name: 'Imported' });
  assert.equal(result.newItemsCount, 2);
  assert.deepEqual(result.companies.map(c => c.id), ['three', 'two', 'one']);
  assert.equal((await getProfileFromDB())?.name, 'Imported');
});

test('legacy partial backups and exported backups preserve the existing formats', async () => {
  await seed();
  assert.equal(await importFromJSON(JSON.stringify({ companies: [], profile: null })), true);
  assert.equal((await readStorage()).profile?.name, profile.name);
  assert.equal(await importFromJSON(JSON.stringify({ profile: { name: 'Legacy' } })), true);
  const exported = JSON.parse(await exportToJSON());
  assert.equal(exported.version, '1.0');
  assert.equal(exported.storageEngine, 'IndexedDB');
  assert.deepEqual(exported.companies, []);
  assert.equal(await importFromJSON(JSON.stringify(exported)), true);
});

test('a revision-zero checkpoint can restore a recreated database', async () => {
  await seed();
  local.set(SNAPSHOT_KEY, JSON.stringify({ schema: 2, revision: 0, companies: [company], profile }));
  const db = await getDB();
  await db.clear('companies');
  await db.clear('profile');
  await db.delete('meta', STORAGE_REVISION_KEY);
  assert.deepEqual((await readStorage()).companies, [company]);
  assert.deepEqual(await getProfileFromDB(), profile);
});

test('uncloneable replacement data cannot become a successful JSON fallback', async () => {
  await seed();
  const before = await readStorage();
  await assert.rejects(saveCompanies([{ ...company, notes: (() => {}) as unknown as string }]));
  assert.deepEqual(await readStorage(), before);
});

test('migration never overwrites populated stores and commits its flag atomically', async () => {
  await seed();
  const db = await getDB();
  await db.delete('meta', 'migrated_from_localstorage');
  local.set('track_my_company_companies_v1', JSON.stringify([{ ...company, name: 'Stale mirror' }]));
  local.set('track_my_company_profile_v1', JSON.stringify({ name: 'Stale Student' }));
  await migrateFromLocalStorage(db);
  assert.deepEqual(await getCompaniesFromDB(), [company]);
  assert.deepEqual(await getProfileFromDB(), profile);
  await db.clear('companies');
  await db.clear('profile');
  await db.delete('meta', 'migrated_from_localstorage');
  failPut('profile');
  try { await assert.rejects(migrateFromLocalStorage(db)); }
  finally { IDBObjectStore.prototype.put = nativePut; }
  assert.deepEqual(await getCompaniesFromDB(), []);
  assert.equal(await db.get('meta', 'migrated_from_localstorage'), undefined);
  await migrateFromLocalStorage(db);
  assert.equal((await getCompaniesFromDB())[0].name, 'Stale mirror');
  assert.equal((await getProfileFromDB())?.name, 'Stale Student');
});
