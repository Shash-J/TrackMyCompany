import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { getDB, getCompaniesFromDB, getProfileFromDB, saveCompaniesToDB } from '../src/services/db';
import { initStorage, saveCompanies } from '../src/services/storage';
import type { Company } from '../src/types';

const local = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => local.get(key) ?? null,
  setItem: (key: string, value: string) => local.set(key, value),
} });
Object.defineProperty(globalThis, 'window', { value: new EventTarget() });
const company: Company = {
  id: 'one', name: 'Example', status: 'applied', tier: 'DREAM', ctc: '10 LPA',
  createdAt: '2026-10-14T00:00:00Z', updatedAt: '2026-10-14T00:00:00Z',
};

test('storage preserves ordering, shares initialization, and rolls back invalid writes', async () => {
  const db = await getDB();
  await saveCompaniesToDB([company, { ...company, id: 'two' }]);
  const first = initStorage();
  assert.equal(first, initStorage(), 'concurrent startup must share one initialization');
  assert.equal((await first).companies.length, 2);
  await saveCompanies([{ ...company, id: 'two' }, company]);
  assert.deepEqual((await getCompaniesFromDB()).map(c => c.id), ['two', 'one']);
  assert.ok(!('order' in (await getCompaniesFromDB())[0]));

  // Structured clone throws synchronously after clear() has already succeeded.
  await assert.rejects(saveCompaniesToDB([
    { ...company, id: 'replacement' },
    { ...company, id: 'invalid', notes: (() => {}) as unknown as string },
  ]));
  assert.deepEqual((await getCompaniesFromDB()).map(c => c.id), ['two', 'one']);

  await db.clear('companies');
  assert.deepEqual(await getCompaniesFromDB(), [], 'successful empty reads remain distinguishable from errors');
  db.close();
  await assert.rejects(getCompaniesFromDB(), 'read failure must not masquerade as an empty list');
  await assert.rejects(getProfileFromDB(), 'read failure must not masquerade as a missing profile');
});
