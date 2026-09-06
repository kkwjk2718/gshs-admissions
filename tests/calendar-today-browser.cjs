const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/admissions-audit-browser/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({headless:true});
 try {
  for (const [suffix, expected] of [['/', '2026-09-07'], ['/?d=2027-02-12', '2027-02-12'], ['/?d=invalid', '2026-09-07']]) {
   const context = await browser.newContext({timezoneId:'Asia/Seoul'});
   const page = await context.newPage();
   await page.clock.install({time:new Date('2026-09-07T01:30:00+09:00')});
   await page.addInitScript(() => sessionStorage.setItem('gshs-admissions:calendar-month:v1','2026-08-01'));
   const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
   await page.goto((process.env.TEST_URL || 'http://127.0.0.1:18791')+suffix,{waitUntil:'networkidle'});
   const selected=page.locator('[aria-selected="true"]');
   await selected.waitFor();
   const label=await selected.getAttribute('data-day');
   assert.equal(label,expected);
   if(!suffix.includes('2027')) await page.locator('.tag--today').first().waitFor();
   assert.deepEqual(errors,[]);
   console.log(JSON.stringify({suffix,expected,label,errors}));
   await context.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
