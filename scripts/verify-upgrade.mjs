// Optional release qualification using an actual previous production build:
// node scripts/verify-upgrade.mjs <baseline-dist>
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

if (!process.argv[2]) throw new Error('Provide the previous production build directory.');
let root = path.resolve(process.argv[2]);
const candidate = path.resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css',
    body: fs.readFileSync('public/fonts/inter.css', 'utf8').replaceAll('url(./', 'url(https://fonts.gstatic.com/') }));
  await context.route('https://fonts.gstatic.com/**', route => route.fulfill({ contentType: 'font/woff2',
    body: fs.readFileSync(path.join('public/fonts', path.basename(new URL(route.request().url()).pathname))) }));
  const company = { id: 'legacy-one', name: 'Legacy Student Record', status: 'applied', tier: 'DREAM', ctc: '10 LPA',
    oaStatus: 'shortlisted', oaCleared: true, notes: 'Retain exactly',
    createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' };
  await context.addInitScript(({ company }) => {
    Object.defineProperty(navigator, 'standalone', { value: true });
    if (!localStorage.getItem('upgrade_fixture')) {
      localStorage.setItem('track_my_company_profile_v1', JSON.stringify({ name: 'Legacy Student', batch: '2027' }));
      localStorage.setItem('track_my_company_companies_v1', JSON.stringify([company]));
      localStorage.setItem('upgrade_fixture', 'yes');
    }
  }, { company });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await page.getByRole('heading', { name: company.name, exact: true }).waitFor();
  const oldCache = await page.evaluate(() => caches.keys());
  assert.ok(oldCache.some(key => key === 'trackmycompany-v1.4.2'));
  await page.evaluate(async () => { await (await caches.open('unrelated-app')).put('/other', new Response('keep')); });
  root = candidate;
  await Promise.all([
    page.waitForEvent('load'),
    page.evaluate(() => { void navigator.serviceWorker.getRegistration().then(registration => registration.update()); }),
  ]);
  await page.getByRole('heading', { name: company.name, exact: true }).waitFor();
  const version = await (await context.request.get(origin + '/version.json')).json();
  const upgradedCaches = await page.evaluate(() => caches.keys());
  assert.ok(upgradedCaches.some(key => key.endsWith(version.revision)));
  assert.ok(upgradedCaches.includes('unrelated-app'));
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('heading', { name: company.name, exact: true }).waitFor();
  const snapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('track_my_company_snapshot_v2')));
  assert.deepEqual(snapshot.companies, [company]);
  assert.deepEqual(snapshot.profile, { name: 'Legacy Student', batch: '2027' });
  await page.getByTitle('Import or Export Excel / CSV').click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download Excel/i }).click();
  assert.match((await download).suggestedFilename(), /\.xlsx$/);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ version, legacyUpgrade: 'passed', offlineReload: 'passed',
    recordsPreserved: 'passed', firstOfflineExport: 'passed', unrelatedCache: 'preserved' }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
