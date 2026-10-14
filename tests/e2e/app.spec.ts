import { test, expect, type Page } from '@playwright/test';
const company = {
  id: 'fixture-one', name: 'Example Systems', status: 'applied', tier: 'DREAM', ctc: '10 LPA',
  oaStatus: 'shortlisted', oaCleared: true,
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
};
async function seed(page: Page) {
  await page.addInitScript(({ company }) => {
    // Install-mode fixture prevents the existing install prompt obscuring tests.
    Object.defineProperty(navigator, 'standalone', { value: true });
    if (!localStorage.getItem('test_seeded')) {
      localStorage.setItem('track_my_company_profile_v1', JSON.stringify({ name: 'Test Student', batch: '2027' }));
      localStorage.setItem('track_my_company_companies_v1', JSON.stringify([company]));
      localStorage.setItem('test_seeded', 'yes');
    }
  }, { company });
}
async function ready(page: Page, url = '/') {
  await page.goto(url);
  await expect(page.getByRole('heading', { name: company.name, exact: true })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}
async function records(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('trackmycompany_db', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<any[]>((resolve, reject) => {
      const request = db.transaction('companies').objectStore('companies').getAll();
      request.onsuccess = () => { db.close(); resolve(request.result); };
      request.onerror = () => reject(request.error);
    });
  });
}
test.beforeEach(async ({ request }) => { await request.post('/__test/mode?value=normal'); });
test.afterEach(async ({ request }) => { await request.post('/__test/mode?value=normal'); });

for (const base of ['/', '/TrackMyCompany/']) {
  test(`offline launch, first-use spreadsheet, fonts, and data survive at ${base}`, async ({ page, context }) => {
    await seed(page);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await ready(page, base);
    // No spreadsheet module is executed/downloaded by the page at startup.
    expect(await page.evaluate(() => performance.getEntriesByType('resource').some(e => e.name.includes('/assets/ImportExportModal-')))).toBe(false);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: company.name, exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.load('600 14px Inter'));
    expect(await page.evaluate(() => document.fonts.check('600 14px Inter'))).toBe(true);
    await page.getByTitle('Import or Export Excel / CSV').click();
    await expect(page.getByRole('heading', { name: 'Excel & CSV Data Hub' })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download Excel/i }).click();
    expect((await download).suggestedFilename()).toMatch(/\.xlsx$/);
    expect((await records(page))[0].name).toBe(company.name);
    expect(errors).toEqual([]);
  });
}

test('slow document network does not block a warm installed launch', async ({ page, request, context }) => {
  await seed(page);
  await ready(page);
  // Launch a new document with persistent origin storage and an installed
  // worker. Closing the first page also isolates its first-install lifecycle.
  await page.close();
  const launch = await context.newPage();
  await request.post('/__test/mode?value=slow');
  const start = Date.now();
  await launch.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(launch.getByRole('heading', { name: company.name, exact: true })).toBeVisible();
  const elapsed = Date.now() - start;
  console.log(`Warm launch with 5000ms document delay: ${elapsed}ms`);
  expect(elapsed).toBeLessThan(2500);
});

test('first installation does not reload an in-progress form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to TrackMyCompany' })).toBeVisible();
  const input = page.locator('input').filter({ visible: true }).first();
  await input.fill('Unsaved Student');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await expect(input).toHaveValue('Unsaved Student');
});

test('failed release keeps the previous offline shell and unrelated caches', async ({ page, request, context }) => {
  await seed(page);
  await ready(page);
  await page.evaluate(async () => { await (await caches.open('unrelated-app')).put('/other', new Response('keep')); });
  const before = await page.evaluate(() => caches.keys());
  await request.post('/__test/mode?value=update-broken');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await new Promise<void>((resolve, reject) => {
      registration!.addEventListener('updatefound', () => {
        const worker = registration!.installing!;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'redundant') resolve();
          if (worker.state === 'activated') reject(new Error('Broken worker activated'));
        });
      }, { once: true });
      registration!.update().catch(reject);
    });
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: company.name, exact: true })).toBeVisible();
  const after = await page.evaluate(() => caches.keys());
  for (const key of before) expect(after).toContain(key);
});

test('successful release replaces the shell and preserves student records', async ({ page, request, context }) => {
  await seed(page);
  await ready(page);
  const before = await page.evaluate(() => caches.keys());
  await request.post('/__test/mode?value=update-good');
  await Promise.all([
    page.waitForEvent('load'),
    page.evaluate(() => { void navigator.serviceWorker.getRegistration().then(r => r!.update()); }),
  ]);
  await expect.poll(() => page.evaluate(() => caches.keys()).catch(() => [])).toContainEqual(expect.stringContaining('test-update-good'));
  await expect(page.getByRole('heading', { name: company.name, exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: company.name, exact: true })).toBeVisible();
  expect((await records(page))[0].oaCleared).toBe(true);
  const after = await page.evaluate(() => caches.keys());
  for (const key of before.filter(k => k.startsWith('trackmycompany-shell-'))) expect(after).not.toContain(key);
});

test('new company does not inherit OA outcome from previously edited company', async ({ page }) => {
  await seed(page);
  await ready(page);
  await page.getByRole('heading', { name: company.name, exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Edit Company' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Edit Company' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Add Company', exact: true }).filter({ visible: true }).click();
  await page.getByRole('button', { name: 'Enter Manually Instead' }).click();
  await page.getByPlaceholder('e.g. Microsoft').fill('New Company');
  await page.getByRole('button', { name: 'Add Company to Tracker' }).click();
  await expect(page.getByRole('heading', { name: 'New Company', exact: true })).toBeVisible();
  expect((await records(page)).find(c => c.name === 'New Company')?.oaCleared).toBeUndefined();
});

test('undo not-shortlisted performs one consistent state transition', async ({ page }) => {
  await page.addInitScript(({ company }) => {
    Object.defineProperty(navigator, 'standalone', { value: true });
    localStorage.setItem('track_my_company_profile_v1', JSON.stringify({ name: 'Test Student' }));
    localStorage.setItem('track_my_company_companies_v1', JSON.stringify([{ ...company, oaStatus: 'not_shortlisted', oaCleared: undefined, oaRejectionReasonTags: ['CGPA'] }]));
  }, { company });
  await ready(page);
  await page.getByRole('heading', { name: company.name, exact: true }).click();
  await page.getByRole('button', { name: 'Undo (Writing OA)', exact: true }).click();
  await expect.poll(async () => (await records(page))[0].oaStatus).toBe('shortlisted');
  await page.reload();
  await page.getByRole('heading', { name: company.name, exact: true }).click();
  await expect(page.getByText('Writing OA ✓', { exact: true })).toBeVisible();
  const saved = (await records(page))[0];
  expect(saved.oaCleared).toBeUndefined();
  expect(saved.oaRejectionReasonTags).toBeUndefined();
});

test('failed version check never reports Latest', async ({ page }) => {
  await seed(page);
  await ready(page);
  await page.route('**/version.json*', route => route.fulfill({ status: 503, body: 'unavailable' }));
  const brand = page.getByTitle('Press and hold for site details & privacy');
  await brand.dispatchEvent('mousedown');
  const check = page.getByTitle('Check for application updates');
  await expect(check).toBeVisible();
  await brand.dispatchEvent('mouseup');
  await check.click();
  await expect(page.getByRole('button', { name: 'Check failed', exact: true })).toBeVisible();
});
