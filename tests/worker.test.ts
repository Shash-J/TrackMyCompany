import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function worker(options: { failInstall?: boolean; cached?: Response } = {}) {
  const handlers: Record<string, (event: any) => void> = {};
  const removed: string[] = [];
  let fetched = 0;
  let activated = false;
  const scope = 'https://example.test/TrackMyCompany/';
  const prefix = `trackmycompany-shell-${encodeURIComponent(scope)}-`;
  const context = {
    URL, Request, Response,
    self: {
      registration: { scope },
      addEventListener: (type: string, fn: (event: any) => void) => { handlers[type] = fn; },
      skipWaiting: async () => { activated = true; },
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => ({
        addAll: async () => { if (options.failInstall) throw new Error('asset unavailable'); },
        match: async () => options.cached,
      }),
      keys: async () => [prefix + 'old', prefix + '__BUILD_REVISION__', 'other-app', 'trackmycompany-v1.4.2'],
      delete: async (key: string) => { removed.push(key); return true; },
    },
    fetch: async () => { fetched++; throw new Error('offline'); },
  };
  vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), context);
  return { handlers, removed, prefix, fetched: () => fetched, activated: () => activated };
}

test('failed precaching never activates the incomplete worker', async () => {
  const w = worker({ failInstall: true });
  let done!: Promise<void>;
  w.handlers.install({ waitUntil: (promise: Promise<void>) => { done = promise; } });
  await assert.rejects(done);
  assert.equal(w.activated(), false);
});

test('activation only removes obsolete caches in this scope', async () => {
  const w = worker();
  let done!: Promise<void>;
  w.handlers.activate({ waitUntil: (promise: Promise<void>) => { done = promise; } });
  await done;
  assert.deepEqual(w.removed, [w.prefix + 'old']);
});

test('cached navigation does not try the network, including query-string launches', async () => {
  const w = worker({ cached: new Response('complete shell') });
  let response!: Promise<Response>;
  w.handlers.fetch({
    request: { method: 'GET', mode: 'navigate', url: 'https://example.test/TrackMyCompany/?source=home' },
    respondWith: (promise: Promise<Response>) => { response = promise; },
  });
  assert.equal(await (await response).text(), 'complete shell');
  assert.equal(w.fetched(), 0);
});

test('missing offline resource returns a Response and unrelated requests bypass the worker', async () => {
  const w = worker();
  let response!: Promise<Response>;
  w.handlers.fetch({
    request: new Request('https://example.test/TrackMyCompany/missing.js'),
    respondWith: (promise: Promise<Response>) => { response = promise; },
  });
  assert.equal((await response).type, 'error');
  for (const url of ['https://other.test/a.js', 'https://example.test/another-app/', 'https://example.test/TrackMyCompany/version.json?v=1']) {
    w.handlers.fetch({ request: new Request(url), respondWith: () => assert.fail('must bypass') });
  }
});
