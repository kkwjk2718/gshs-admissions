process.env.TSX_TSCONFIG_PATH = require('node:path').resolve(__dirname, '../tsconfig.app.json');
require('tsx/cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { buildPrintCalendar, PrintCalendarDocument } = require('../src/components/PrintCalendar.tsx');
const { validCalendarDate } = require('../src/hooks/useCalendarMonth.tsx');
const data = JSON.parse(fs.readFileSync('public/data/admissions.json', 'utf8'));
const month = new Date('2026-09-01T12:00:00');
const render = (extra = {}) => renderToStaticMarkup(createElement(PrintCalendarDocument, { dataset: data, status: 'ready', offlineSavedAt: null, events: data.events, universities: ['UNIST'], categories: ['application'], month, monthSource: '현재 표시 중인 월', ...extra }));
test('calendar summary enforces selection and has no attached detail pages', () => {
  const model = buildPrintCalendar(data.events, ['UNIST'], ['application'], month);
  const expected = data.events.filter(e => e.university === 'UNIST' && e.categoryId === 'application' && e.startDate <= '2026-09-30' && e.deadlineDate >= '2026-09-01');
  assert.deepEqual(new Set(model.events.map(e => e.id)), new Set(expected.map(e => e.id)));
  const html = render();
  assert.doesNotMatch(html, /KAIST|고려대|print-calendar-details|print-calendar-index|data-print-event-id=/);
  assert.match(html, /한 달 · 한 장/);
  assert.match(html, /대학별 전체 일정/);
  assert.equal((html.match(/data-outside-month="false"/g) || []).length, 30);
});
test('calendar selection header lists every school without an overflow count', () => {
  const all = data.universities.map(u => u.name);
  for (const universities of [all.slice(0, 9), all]) {
    const html = render({ universities });
    const selection = html.match(/<p class="print-document__selection">([\s\S]*?)<\/p>/)[1].replace(/<[^>]+>/g, '');
    assert.equal(selection, `선택 대학 ${universities.length}곳 · ${universities.join(' / ')}`);
    assert.doesNotMatch(selection, /외\s*\d+곳/);
  }
});
test('empty categories, empty schools, unavailable data never leak entries', () => {
  for (const extra of [{universities: []}, {categories: []}, {status: 'loading'}, {status: 'error'}]) assert.doesNotMatch(render(extra), /data-print-phase=/);
});
test('six-week and dense months keep all days with explicit summary counts', () => {
  const dense = Array.from({length: 120}, (_, i) => ({...data.events[0], id: `dense-${i}`, university: 'UNIST', categoryId: 'application', startDate: '2026-08-01', deadlineDate: '2026-08-31', isDateRange: true}));
  const august = new Date('2026-08-01T12:00:00');
  const model = buildPrintCalendar(dense, ['UNIST'], ['application'], august);
  assert.equal(model.weeks.length, 6);
  assert.equal(model.events.length, 120);
  const html = render({events:dense, month:august});
  assert.equal((html.match(/data-outside-month="false"/g) || []).length,31);
  assert.match(html,/진행 중 120건/);
  assert.match(html,/--print-week-count:6/);
  assert.doesNotMatch(html,/print-calendar-details/);
});
test('all grouped calendar labels retain the existing dayEntries semantics', () => {
  const { buildDayEntries } = require('../src/lib/dayEntries.ts');
  const model = buildPrintCalendar(data.events, data.universities.map(u=>u.name), data.categories.map(c=>c.id), month);
  for (const day of model.weeks.flat().filter(d=>d.inside)) assert.deepEqual(day.entries,buildDayEntries(model.events,day.key));
});
test('saved empty categories remain empty after reload', () => {
  const { AdmissionsProvider } = require('../src/hooks/useAdmissions.tsx');
  const { PreferencesProvider, usePreferences } = require('../src/hooks/usePreferences.tsx');
  const previous = global.localStorage;
  global.localStorage = {getItem: key => key === 'gshs-admissions:preferences:v4' ? JSON.stringify({version: 4, universities: ['UNIST'], categories: []}) : null};
  try {
    const Probe = () => createElement('span', null, usePreferences().categories.length);
    assert.equal(renderToStaticMarkup(createElement(AdmissionsProvider, null, createElement(PreferencesProvider, null, createElement(Probe)))), '<span>0</span>');
  } finally { global.localStorage = previous; }
});
test('calendar dates reject impossible deep links', () => {
  assert.equal(validCalendarDate('2026-02-30'), null);
  assert.equal(validCalendarDate('2026-13-01'), null);
  assert.equal(validCalendarDate('2026-09-11'), '2026-09-11');
});
