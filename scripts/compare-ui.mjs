import { chromium, devices } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
// Optional before/after visual check: node scripts/compare-ui.mjs <baseline-dist> <output-dir>
const [baseline, output] = process.argv.slice(2);
if (!baseline || !output) throw new Error('Provide baseline dist and screenshot output directory');
fs.mkdirSync(output, { recursive: true });
const servers = [baseline, 'dist'].map((dir, i) => spawn(process.execPath, ['scripts/test-server.mjs'], {
  env: { ...process.env, TEST_DIST: path.resolve(dir), TEST_PORT: String(4180 + i) }, stdio: 'pipe', windowsHide: true,
}));
for (const server of servers) await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); });
const browser = await chromium.launch();
const results = [];
try {
  for (const [device, options] of [['desktop', devices['Desktop Chrome']], ['mobile', devices['Pixel 7']]]) {
    const screenshots = [];
    for (let i = 0; i < 2; i++) {
      const context = await browser.newContext({ ...options, serviceWorkers: 'block' });
      // Supply the exact original Google font CSS/assets locally for baseline
      // determinism. The candidate already serves these same assets locally.
      await context.route('https://fonts.googleapis.com/**', route => route.fulfill({
        contentType: 'text/css', body: fs.readFileSync('public/fonts/inter.css','utf8').replaceAll('url(./', 'url(https://fonts.gstatic.com/'),
      }));
      await context.route('https://fonts.gstatic.com/**', route => route.fulfill({
        contentType: 'font/woff2', body: fs.readFileSync(path.join('public/fonts', path.basename(new URL(route.request().url()).pathname))),
      }));
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'standalone', { value: true });
        localStorage.setItem('track_my_company_profile_v1', JSON.stringify({ name: 'Test Student', batch: '2027' }));
        localStorage.setItem('track_my_company_companies_v1', JSON.stringify([
          { id: 'one', name: 'Example Systems', status: 'applied', tier: 'DREAM', ctc: '10 LPA', oaStatus: 'shortlisted', createdAt: '2026-09-01', updatedAt: '2026-09-01' },
          { id: 'two', name: 'Example Skipped', status: 'not_applied', tier: 'MASS', ctc: '4 LPA', rejectionReasonTags: ['CTC'], createdAt: '2026-09-02', updatedAt: '2026-09-02' },
        ]));
      });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${4180+i}`);
      await page.getByRole('heading', { name: 'Example Systems', exact: true }).waitFor();
      const shots = {};
      async function shot(name) {
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(0,0);
        shots[name] = await page.screenshot({ path: path.join(output, `${device}-${i ? 'after' : 'before'}-${name}.png`), fullPage: true, animations: 'disabled' });
      }
      await shot('dashboard');
      await page.getByRole('heading', { name: 'Example Systems', exact: true }).click();
      await shot('expanded-card');
      await page.getByRole('button', { name: 'My Stats', exact: true }).filter({ visible: true }).click();
      await page.getByText('Campus Analytics & Records').waitFor();
      await shot('statistics');
      await page.getByTitle('Import or Export Excel / CSV').click();
      await page.getByRole('heading', { name: 'Excel & CSV Data Hub' }).waitFor();
      await shot('spreadsheet');
      await page.goBack();
      await page.getByTitle('Student Profile').click();
      await page.getByRole('heading', { name: 'Student Profile', exact: true }).waitFor();
      await shot('profile');
      screenshots.push(shots);
      await context.close();
    }
    for (const name of Object.keys(screenshots[0])) {
      const identical = screenshots[0][name].equals(screenshots[1][name]);
      results.push({ device, screen: name, identical });
    }
  }
  fs.writeFileSync(path.join(output, 'visual-comparison.json'), JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  assert.ok(results.every(r => r.identical), 'UI screenshots differ; inspect before delivery');
} finally {
  await browser.close();
  for (const server of servers) server.kill();
}
