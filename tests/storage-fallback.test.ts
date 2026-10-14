import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { getDB } from '../src/services/db';
import { initStorage } from '../src/services/storage';

test('a read failure after DB open loads the existing localStorage fallback', async () => {
  const companies = [{ id: 'fallback', name: 'Retained Company', status: 'applied', tier: 'DREAM', ctc: '10 LPA' }];
  Object.defineProperty(globalThis, 'localStorage', { value: {
    getItem: (key: string) => key.includes('companies') ? JSON.stringify(companies) : JSON.stringify({ name: 'Retained Student' }),
  } });
  const db = await getDB();
  await db.put('meta', { key: 'migrated_from_localstorage', value: true });
  // Open succeeds but the data transaction fails (e.g. browser storage fault).
  db.getAll = async () => { throw new Error('simulated read failure'); };
  const loaded = await initStorage();
  assert.equal(loaded.companies[0].name, 'Retained Company');
  assert.equal(loaded.profile?.name, 'Retained Student');
  db.close();
});
