// Run against a local dev server. PLAYWRIGHT_MODULE may point to an external Playwright install.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.ADMISSIONS_BASE || 'http://127.0.0.1:18791';
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: 390, height: 844}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('gshs-admissions:preferences:v4', JSON.stringify({version: 4, universities: ['UNIST'], categories: ['application', 'interview', 'final-result', 'registration']}));
      window.print = () => { window.__printCalls = (window.__printCalls || 0) + 1; };
    });
    await page.goto(base + '/?d=2026-09-05');
    await page.locator('.calendar-toolbar h2').waitFor();
    assert.equal(await page.locator('.print-document').count(), 1);
    assert.equal(await page.locator('.print-calendar').count(), 0, 'native print defaults to full schedule');
    await page.locator('.app-header__print').click();
    await page.locator('#print-chooser[open]').waitFor();
    await page.locator('input[value="calendar"]').check();
    assert.equal(await page.locator('.print-calendar').getAttribute('data-print-month'), '2026-09');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#print-chooser').evaluate(d => d.open), false);
    assert.equal(await page.locator('.app-header__print').evaluate(el => el === document.activeElement), true);
    await page.getByRole('button', {name: '2026년 10월 보기', exact: true}).click();
    assert.equal(await page.locator('.print-calendar').getAttribute('data-print-month'), '2026-10');
    await page.locator('.app-header__print').click();
    await page.locator('[data-print-confirm]').click();
    await page.waitForFunction(() => window.__printCalls === 1);
    await page.locator('.app-nav a[href="/schedule"]').evaluate(a => a.click());
    await page.waitForURL('**/schedule');
    await page.waitForFunction(() => document.querySelector('.print-calendar')?.textContent.includes('마지막으로 본 달력 월'));
    assert.equal(await page.locator('.print-calendar').getAttribute('data-print-month'), '2026-10');
    assert.match(await page.locator('.print-calendar').textContent(), /마지막으로 본 달력 월/);
    await page.locator('.brand').click();
    await page.locator('.calendar-toolbar h2').waitFor();
    assert.equal(await page.locator('.calendar-toolbar h2').innerText(), '2026년 10월');
    // Arrow navigation beyond the grid changes the shared month, not only focus.
    const keys = await page.locator('[data-day]').evaluateAll(es => es.map(e => e.dataset.day));
    await page.locator(`[data-day="${keys.at(-1)}"] .day-number`).click();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.print-calendar').getAttribute('data-print-month'), '2026-11');
    await page.getByRole('button', {name: '오늘', exact: true}).click();
    const todayMonth = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`; });
    assert.equal(await page.locator('.print-calendar').getAttribute('data-print-month'), todayMonth);
    // Browser-menu print uses the already selected mode without invoking our print button.
    await page.emulateMedia({media: 'print'});
    assert.equal(await page.locator('.app-shell').isVisible(), false);
    assert.equal(await page.locator('.print-calendar').isVisible(), true);
    assert.equal(await page.locator('.print-calendar').evaluate(el => getComputedStyle(el).page), 'calendar');
    await page.emulateMedia({media: 'screen'});
    await page.locator('.app-header__print').click();
    await page.locator('input[value="schedule"]').check();
    await page.locator('[data-print-cancel]').click();
    assert.equal(await page.locator('.print-calendar').count(), 0);
    assert.equal(await page.locator('.print-document').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('PASS: mobile chooser, Escape/focus restoration, mode switch/native print CSS, arrow/today/keyboard month sync, off-route retention, no overflow or page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
