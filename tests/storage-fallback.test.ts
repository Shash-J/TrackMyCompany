import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { getDB } from '../src/services/db';
import { initStorage } from '../src/services/storage';

test('a read failure after DB open loads the existing localStorage fallback', async () => {
  const companies = [{ id: 'fallback', name: 'Retained Company', status: 'applied', tier: 'DREAM', ctc: '10 LPA' }];
  Object.defineProperty(globalThis, 'localStorage', { value: {
    getItem: (key: string) => key.includes('companies') ? JSON.stringify(companies)
      : key.includes('profile') ? JSON.stringify({ name: 'Retained Student' }) : null,
  } });
  const db = await getDB();
  await db.put('meta', { key: 'migrated_from_localstorage', value: true });
  // Open succeeds but the data transaction fails (e.g. browser storage fault).
  const transaction = db.transaction.bind(db);
  db.transaction = ((stores: any, ...args: any[]) => {
    if (Array.isArray(stores) && stores.includes('companies')) throw new Error('simulated read failure');
    return (transaction as any)(stores, ...args);
  }) as typeof db.transaction;
  const loaded = await initStorage();
  assert.equal(loaded.companies[0].name, 'Retained Company');
  assert.equal(loaded.profile?.name, 'Retained Student');
  db.close();
});
