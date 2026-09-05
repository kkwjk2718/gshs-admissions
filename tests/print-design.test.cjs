process.env.TSX_TSCONFIG_PATH = require('node:path').resolve(__dirname, '../tsconfig.app.json');
require('tsx/cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createElement} = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const data = require('../public/data/admissions.json');
const {PrintCalendarDocument} = require('../src/components/PrintCalendar.tsx');
const {PrintDocument} = require('../src/components/PrintSchedule.tsx');
test('calendar design adds month marker and semantic day/phase hooks without changing data',()=>{
 const html=renderToStaticMarkup(createElement(PrintCalendarDocument,{dataset:data,status:'ready',events:data.events,universities:['UNIST'],categories:data.categories.map(c=>c.id),month:new Date('2026-09-01T12:00:00'),monthSource:'현재 표시 중인 월',offlineSavedAt:null}));
 assert.match(html,/class="print-month-mark"/);
 assert.match(html,/data-weekday="0"/);
 assert.match(html,/data-print-phase="start"/);
 assert.match(html,/data-print-phase="end"/);
 const expected=data.events.filter(e=>e.university==='UNIST' && e.startDate<='2026-09-30' && e.deadlineDate>='2026-09-01');
 assert.equal((html.match(/data-print-event-id=/g)||[]).length,expected.length);
});
test('schedule design uses numbered university sections and category labels, never color alone',()=>{
 const html=renderToStaticMarkup(createElement(PrintDocument,{dataset:data,status:'ready',universities:['UNIST'],offlineSavedAt:null}));
 assert.match(html,/class="print-section-number"/);
 assert.match(html,/class="print-category-label"/);
 for(const event of data.events.filter(e=>e.university==='UNIST')) assert(html.includes(event.category));
});
