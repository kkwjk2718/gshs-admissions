// tsx loads the production TS/TSX modules; Node runs the regression tests.
process.env.TSX_TSCONFIG_PATH = require('node:path').resolve(__dirname, '../tsconfig.app.json');
require('tsx/cjs');
const fs = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { CATEGORY_ORDER, CATEGORY_GROUPS, CATEGORY_UI, migrateCategorySelection } = require('../src/lib/categories.ts');
const { buildDayEntries } = require('../src/lib/dayEntries.ts');
const { buildIcsFile } = require('../src/lib/ics.ts');
const { eventBadges, deadlineTimeLabel, statusLabel } = require('../src/lib/eventInfo.ts');
const { EventRow } = require('../src/components/EventRow.tsx');
const data = JSON.parse(fs.readFileSync('public/data/admissions.json', 'utf8'));
const unist = data.events.filter(e => e.universityId === 'unist');

test('registration is ordered, grouped and rendered with correct calendar labels', () => {
  const event = unist.find(e => e.categoryId === 'registration');
  assert.ok(event);
  assert.ok(CATEGORY_ORDER.includes('registration'));
  assert.equal(CATEGORY_GROUPS.flatMap(g => g.ids).filter(id => id === 'registration').length, 1);
  assert.equal(CATEGORY_UI.registration.noun, '마감');
  assert.equal(buildDayEntries([event], '2026-12-21')[0].label, '합격자 등록 시작');
  const end = buildDayEntries([event], '2026-12-23')[0];
  assert.equal(end.label, '등록 마감');
  assert.equal(end.lines[0].time, '16:00');
  assert.equal(statusLabel(event, '2026-12-22'), '등록 중');
  assert.equal(deadlineTimeLabel(event), '16:00 마감');
  const ics = buildIcsFile([event]).replace(/\r\n[ \t]/g, '');
  assert.match(ics, /SUMMARY:UNIST 합격자 등록 16:00 마감/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261221/);
  assert.match(ics, /DTEND;VALUE=DATE:20261224/);
  const html = renderToStaticMarkup(createElement(EventRow, { event, onSelect() {}, today: '2026-12-22' }));
  assert.match(html, /합격자 등록/);
  assert.match(html, /그릿인재전형/);
  assert.match(html, /16:00 마감/);
});

test('opening times are visible without replacing deadline times', () => {
  for (const event of unist.filter(e => ['application', 'essay', 'documents'].includes(e.categoryId))) {
    assert.ok(eventBadges(event).includes('09:00 시작'));
    assert.equal(deadlineTimeLabel(event), '18:00 마감');
    assert.equal(buildDayEntries([event], event.deadlineDate)[0].lines[0].time, '18:00');
    const html = renderToStaticMarkup(createElement(EventRow, { event, onSelect() {} }));
    assert.match(html, /09:00 시작/);
    assert.match(html, /18:00 마감/);
  }
});

test('Dec 18 이전 is a prominent rendered badge, not only raw detail', () => {
  const event = unist.find(e => e.categoryId === 'final-result');
  const html = renderToStaticMarkup(createElement(EventRow, { event, onSelect() {} }));
  assert.match(html, /class="badge">12월 18일 이전/);
  assert.equal(unist.filter(e => e.categoryId === 'first-result').length, 1);
  assert.equal(unist.filter(e => e.categoryId === 'interview' && e.admissionDetail === '그릿인재전형').length, 1);
});

test('old all-category selection includes registration but custom selections survive', () => {
  const oldAll = CATEGORY_ORDER.filter(id => id !== 'registration');
  assert.deepEqual(migrateCategorySelection(oldAll), CATEGORY_ORDER);
  assert.deepEqual(migrateCategorySelection(['application', 'interview']), ['application', 'interview']);
  assert.deepEqual(migrateCategorySelection([]), []);
});
