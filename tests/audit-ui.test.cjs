const test = require('node:test');
const assert = require('node:assert/strict');
process.env.TSX_TSCONFIG_PATH = 'tsconfig.app.json';
require('tsx/cjs');
const {CATEGORY_ORDER, CATEGORY_UI, migrateCategorySelection} = require('../src/lib/categories.ts');
const {eventBadges, deadlineTimeLabel} = require('../src/lib/eventInfo.ts');
test('audit categories are visible and old full selection migrates',()=>{
 for(const id of ['written-exam','exam-notice','stage-fee','registration-program']) assert.ok(CATEGORY_UI[id]);
 const old=['application','essay','recommendation','documents','first-result','interview','final-result','additional-result','registration'];
 assert.deepEqual(migrateCategorySelection(old,4),CATEGORY_ORDER);
 assert.deepEqual(migrateCategorySelection(['interview']),['interview']);
});
test('excluded dates are omitted by UI and both ICS span semantics',()=>{
 const {calendarSegments,buildIcsFile}=require('../src/lib/ics.ts');
 const {buildDayEntries,ongoingCountOn}=require('../src/lib/dayEntries.ts');
 const e={id:'x',uid:'x@test',university:'POSTECH',universityId:'postech',categoryId:'additional-result',admissionDetail:'일반Ⅰ',rawSchedule:'12.24~29 18:00; 12.25~27 제외',note:'차수별 공지 확인',startDate:'2026-12-24',endDate:'2026-12-29',deadlineDate:'2026-12-29',isDateRange:true,timeLabels:['18:00'],excludedDates:['2026-12-25','2026-12-26','2026-12-27']};
 assert.deepEqual(calendarSegments(e).map(x=>[x.uid,x.startDate,x.endDate]),[['x@test','2026-12-24','2026-12-24'],['x-part-2026-12-28@test','2026-12-28','2026-12-29']]);
 assert.equal(ongoingCountOn([e],'2026-12-25'),0);
 assert.deepEqual(buildDayEntries([e],'2026-12-25'),[]);
 const ics=buildIcsFile([e]).replace(/\r\n[ \t]/g,'');
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,2);
 assert.equal((ics.match(/BEGIN:VALARM/g)||[]).length,3);
 assert.match(ics,/DTEND;VALUE=DATE:20261225/);
 assert.match(ics,/DTSTART;VALUE=DATE:20261228/);
 assert.doesNotMatch(buildIcsFile([{...e,rawSchedule:'미확인 11.10 14:00'}]),/BEGIN:VALARM/);
});
test('review regressions: time badges, versioned custom selection and alarms',()=>{
 const old=['application','essay','recommendation','documents','first-result','interview','final-result','additional-result'];
 assert.deepEqual(migrateCategorySelection(old,4),old);
 assert.deepEqual(migrateCategorySelection(old,3),CATEGORY_ORDER);
 const {buildIcsFile}=require('../src/lib/ics.ts');
 const e={id:'review',uid:'review@test',university:'연세대',categoryId:'additional-result',admissionDetail:'기회균형',rawSchedule:'12.23 20:00 이전',note:'',startDate:'2026-12-23',endDate:'2026-12-23',deadlineDate:'2026-12-23',isDateRange:false,timeLabels:['20:00'],excludedDates:[]};
 assert.ok(eventBadges(e).includes('20:00 이전'));
 assert.ok(!eventBadges(e).includes('12월 23일 이전'));
 for(const q of ['이전','이후']){
  const ics=buildIcsFile([{...e,rawSchedule:`12.23 20:00 ${q} 예정`}]).replace(/\r\n[ \t]/g,'');
  const alarms=ics.split('BEGIN:VALARM').slice(1).map(x=>x.split('END:VALARM')[0]);
  assert.equal(alarms.length,3);
  for(const a of alarms){assert.ok(a.includes(`20:00 ${q}`));assert.ok(a.includes('예정'));}
 }
 const dated={...e,categoryId:'final-result',timeLabels:[],rawSchedule:'12.23 이전'};
 assert.ok(eventBadges(dated).includes('12월 23일 이전'));
 const ics=buildIcsFile([dated]).replace(/\r\n[ \t]/g,'');
 assert.doesNotMatch(ics,/오늘 발표/);
 assert.match(ics,/이전/);
});
test('time qualifiers and uncertainty stay prominent',()=>{
 const e={categoryId:'final-result',rawSchedule:'12.18 18:00 이후 예정',timeLabels:['18:00'],excludedDates:[],deadlineDate:'2026-12-18'};
 assert.match(deadlineTimeLabel(e),/이후/);
 assert.ok(eventBadges(e).includes('예정'));
 assert.ok(eventBadges({...e,rawSchedule:'미확인 11.10 14:00'}).includes('공식 근거 미확인'));
});
