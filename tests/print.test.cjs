process.env.TSX_TSCONFIG_PATH = require('node:path').resolve(__dirname, '../tsconfig.app.json');
require('tsx/cjs');
const fs = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { PrintDocument, groupPrintEvents } = require('../src/components/PrintSchedule.tsx');
const data = JSON.parse(fs.readFileSync('public/data/admissions.json', 'utf8'));
const render = (universities, extra = {}) => renderToStaticMarkup(createElement(PrintDocument, {
  dataset: data, universities, status: 'ready', offlineSavedAt: null, ...extra,
}));
const text = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&');

test('only selected university events appear, deduplicated and chronologically sorted', () => {
  const groups = groupPrintEvents(data.events, ['UNIST', 'KAIST', 'UNIST']);
  assert.equal(groups.length, 2);
  assert.deepEqual(new Set(groups.flatMap(g => g.events.map(e => e.id))),
    new Set(data.events.filter(e => ['UNIST', 'KAIST'].includes(e.university)).map(e => e.id)));
  for (const group of groups) {
    assert.ok(group.events.every(e => e.university === group.university));
    assert.deepEqual(group.events.map(e => e.startDate), group.events.map(e => e.startDate).sort());
  }
  const html = render(['UNIST']);
  assert.match(html, /data-print-university="UNIST"/);
  assert.doesNotMatch(html, /data-print-university="(?:KAIST|고려대)"/);
  assert.equal((html.match(/data-print-event-id=/g) || []).length, data.events.filter(e => e.university === 'UNIST').length);
});

test('all raw dates, opening times, qualifiers and exclusions survive print markup', () => {
  const html = render(data.universities.map(u => u.name));
  const printed = text(html);
  for (const e of data.events) assert.ok(printed.includes(e.rawSchedule), e.id);
  assert.match(html, /<strong[^>]*>18:00<\/strong>/);
  assert.match(html, /<strong[^>]*>09:00<\/strong>/);
  assert.ok(printed.includes('12.18(금) 이전'));
  assert.ok(printed.includes('12.21(월)~12.23(수) 16:00'));
  assert.match(printed, /소인 유효/);
  assert.match(printed, /12.25~27\) 제외/);
  assert.doesNotMatch(printed, /12.24~25 제외/);
  const untimed = data.events.find(e => e.university === 'UNIST' && e.categoryId === 'final-result');
  const row = html.split(`data-print-event-id="${untimed.id}"`)[1].split('</tr>')[0];
  assert.doesNotMatch(row, /\d{2}:\d{2}/);
});

test('print includes every category and full date span, not screen filters', () => {
  const printed = text(render(['UNIST']));
  for (const e of data.events.filter(e => e.university === 'UNIST')) {
    assert.ok(printed.includes(e.category));
    assert.ok(printed.includes(e.rawSchedule));
  }
  assert.match(printed, /월·검색어·일정 종류 필터와 관계없이/);
  const source = fs.readFileSync('src/components/PrintSchedule.tsx', 'utf8');
  assert.doesNotMatch(source, /useVisibleEvents|categorySet|useLocation/);
});

test('print document has semantic three-column repeatable university headings and provenance', () => {
  const html = render(['UNIST']);
  assert.match(html, /class="print-document"/);
  assert.match(html, /<thead><tr><th colSpan="3"/);
  for (const label of ['일정', '전형', '날짜·시각']) assert.ok(html.includes(`scope="col">${label}</th>`));
  assert.match(html, /2027학년도/);
  assert.match(html, /선택 대학 1곳/);
  assert.match(html, /https:\/\/admissions.gshs.app/);
  assert.match(html, /대학 홈페이지/);
});

test('empty selection and unavailable data never print all universities', () => {
  for (const html of [render([]), render(['UNIST'], {status: 'loading'}), render(['UNIST'], {status: 'error'})]) {
    assert.doesNotMatch(html, /data-print-event-id=/);
  }
  assert.match(render([]), /선택한 대학이 없습니다/);
  assert.deepEqual(groupPrintEvents(data.events, []), []);
  assert.match(render(['UNIST'], {offlineSavedAt: '2026-09-06T00:00:00Z'}), /저장된 자료/);
});

test('mounted print host uses preferences universities but ignores even an empty category selection', () => {
  const admissionsPath = require.resolve('../src/hooks/useAdmissions.tsx');
  const preferencesPath = require.resolve('../src/hooks/usePreferences.tsx');
  const componentPath = require.resolve('../src/components/PrintSchedule.tsx');
  const originals = [admissionsPath, preferencesPath, componentPath].map(p => require.cache[p]);
  try {
    require.cache[admissionsPath] = { exports: { useAdmissions: () => ({ dataset: data, status: 'ready', offlineSavedAt: null }) } };
    require.cache[preferencesPath] = { exports: { usePreferences: () => ({ universities: ['UNIST'], categories: [], categorySet: new Set() }) } };
    delete require.cache[componentPath];
    const { PrintSchedule } = require(componentPath);
    const html = renderToStaticMarkup(createElement(PrintSchedule));
    assert.equal((html.match(/data-print-event-id=/g) || []).length, data.events.filter(e => e.university === 'UNIST').length);
    assert.doesNotMatch(html, /data-print-university="(?:KAIST|고려대)"/);
  } finally {
    [admissionsPath, preferencesPath, componentPath].forEach((p, i) => { require.cache[p] = originals[i]; });
  }
});

test('multi-date source rows identify their individual date without dropping the source', () => {
  // Keep a genuine compressed multi-date fixture: audited dates are now separate.
  const legacy = JSON.parse(require('node:child_process').execFileSync('git', ['show', 'de10294:public/data/admissions.json'], {encoding:'utf8'}));
  const html = render(['서울대'], {dataset: legacy});
  const split = legacy.events.filter(e => e.university === '서울대' && e.categoryId === 'additional-result');
  assert.ok(split.length > 1);
  for (const e of split) {
    const row = text(html.split(`data-print-event-id="${e.id}"`)[1].split('</tr>')[0]);
    assert.ok(row.includes(`해당일: ${e.deadlineDate}`));
    assert.ok(row.includes(e.rawSchedule));
  }
  assert.match(fs.readFileSync('src/styles/print.css', 'utf8'), /counter\(page\)/);
  assert.match(text(render(['UNIST'])), /전체 자료 범위/);
});

test('explicitly saved empty universities remain a choice on reload', () => {
  const { AdmissionsProvider } = require('../src/hooks/useAdmissions.tsx');
  const { PreferencesProvider, usePreferences } = require('../src/hooks/usePreferences.tsx');
  const previous = global.localStorage;
  global.localStorage = { getItem: key => key === 'gshs-admissions:preferences:v4'
    ? JSON.stringify({ version: 4, universities: [], categories: ['application'] }) : null };
  try {
    const Probe = () => { const p = usePreferences(); return createElement('span', null, `${p.hasChosen}:${p.universities.length}`); };
    const html = renderToStaticMarkup(createElement(AdmissionsProvider, null,
      createElement(PreferencesProvider, null, createElement(Probe))));
    assert.equal(html, '<span>true:0</span>');
  } finally { global.localStorage = previous; }
});
