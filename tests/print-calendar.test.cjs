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
test('calendar scope enforces selected schools/categories and month, with full raw details', () => {
  const model = buildPrintCalendar(data.events, ['UNIST'], ['application'], month);
  const expected = data.events.filter(e => e.university === 'UNIST' && e.categoryId === 'application' && e.startDate <= '2026-09-30' && e.deadlineDate >= '2026-09-01');
  assert.deepEqual(new Set(model.events.map(e => e.id)), new Set(expected.map(e => e.id)));
  const html = render();
  assert.doesNotMatch(html, /KAIST|고려대/);
  assert.match(html, /2026년 9월/);
  assert.equal((html.match(/data-print-event-id=/g) || []).length, expected.length);
  for (const e of expected) assert.ok(html.replace(/<[^>]*>/g, '').includes(e.rawSchedule));
});
test('empty categories, empty schools, unavailable data never leak events', () => {
  for (const extra of [{universities: []}, {categories: []}, {status: 'loading'}, {status: 'error'}]) assert.doesNotMatch(render(extra), /data-print-event-id=/);
});
test('dense dates retain every event including same-school same-time variants and spanning ranges', () => {
  const template = data.events[0];
  const events = Array.from({length: 120}, (_, i) => ({...template, id: `dense-${i}`, university: 'UNIST', categoryId: 'application', startDate: '2026-08-31', deadlineDate: '2026-10-01', isDateRange: true, rawSchedule: `조건 ${i} 09:00~18:00 이전`, excludedDates: ['2026-09-02']}));
  const model = buildPrintCalendar(events, ['UNIST'], ['application'], month);
  assert.equal(model.events.length, 120);
  const html = render({events});
  assert.equal((html.match(/data-print-event-id=/g) || []).length, 120);
  for (const e of events) assert.ok(html.replace(/<[^>]*>/g, '').includes(e.rawSchedule));
  assert.match(html, /제외일: 2026-09-02/);
});
test('all real source qualifiers survive in December and grid labels reuse dayEntries', () => {
  const { buildDayEntries } = require('../src/lib/dayEntries.ts');
  const universities = data.universities.map(u => u.name);
  const categories = data.categories.map(c => c.id);
  const december = new Date('2026-12-01T12:00:00');
  const model = buildPrintCalendar(data.events, universities, categories, december);
  const html = render({universities, categories, month: december});
  const text = html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&');
  for (const e of model.events) assert.ok(text.includes(e.rawSchedule), e.id);
  assert.match(text, /12.18\(금\) 이전/);
  assert.match(render({universities, categories}).replace(/<[^>]*>/g, ''), /09:00/);
  assert.match(text, /제외일:/);
  for (const day of model.weeks.flat().filter(d => d.inside)) assert.deepEqual(day.entries, buildDayEntries(model.events, day.key));
  assert.doesNotMatch(html, /print-calendar-index/);
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
