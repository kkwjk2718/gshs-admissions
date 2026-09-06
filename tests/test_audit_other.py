"""Regression tests for the report's remaining twelve universities."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('audit_other', ROOT / 'src/data/audit_other.py')
assert SPEC is not None and SPEC.loader is not None
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class AuditOtherTests(unittest.TestCase):
    def setUp(self):
        self.original = json.loads(subprocess.check_output(
            ['git', 'show', 'de10294:public/data/admissions.json'], cwd=ROOT, text=True))
        self.payload = audit.apply(copy.deepcopy(self.original))
        self.events = self.payload['events']

    def event(self, identity):
        return next(e for e in self.events if e['id'] == identity)

    def key(self, university, key):
        return next(e for e in self.events if e['university'] == university and e.get('auditOtherKey') == key)

    def rows(self, name):
        return [r for p in self.payload['admissionsTable']['pages'] for r in p['rows'] if r['university'] == name]

    def test_twice_equality_and_identity(self):
        before = copy.deepcopy(self.payload)
        self.assertEqual(audit.apply(self.payload), before)
        ids = [e['id'] for e in self.events]
        self.assertEqual(len(ids), len(set(ids)))
        for event in self.original['events']:
            self.assertEqual(self.event(event['id'])['uid'], event['uid'])

    def test_unowned_events_rows_metadata_unchanged(self):
        for e in self.original['events']:
            if e['university'] not in audit.NAMES:
                self.assertEqual(self.event(e['id']), e)
        for page in self.original['admissionsTable']['pages']:
            for row in page['rows']:
                if row['university'] not in audit.NAMES:
                    actual = next(r for p in self.payload['admissionsTable']['pages'] for r in p['rows'] if r['id'] == row['id'])
                    self.assertEqual(actual, row)
        for key in ('meta', 'categories', 'universities'):
            self.assertEqual(self.payload[key], self.original[key])

    def test_all_twelve_registration_tuition_and_notes(self):
        for name in audit.NAMES:
            first = self.key(name, 'first-registration')
            self.assertEqual((first['startDate'], first['endDate']), ('2026-12-21', '2026-12-23'))
            tuition = self.key(name, 'tuition')
            self.assertEqual((tuition['startDate'], tuition['endDate']), ('2027-02-10', '2027-02-12'))
            self.assertEqual(tuition['categoryId'], 'registration')
            for e in self.events:
                if e['university'] == name:
                    self.assertIn(audit.SOURCES[name], e['note'])
                    self.assertIn(e['rawSchedule'], e['note'])
                    self.assertIn(e['rawSchedule'], e['description'])
            rows = [r for r in self.rows(name) if not r['id'].endswith('-written')]
            self.assertTrue(all('본등록금' in r['cells']['registration']['text'] for r in rows))
        self.assertEqual(self.key('경북대', 'first-registration')['timeLabels'], ['15:00'])
        self.assertEqual(self.key('경희대', 'tuition')['timeLabels'], ['13:00'])
        self.assertEqual(self.key('서울과기대', 'tuition')['timeLabels'], ['14:00'])

    def test_no_invented_times(self):
        for name in ('중앙대', '아주대'):
            self.assertEqual(self.key(name, 'first-registration')['timeLabels'], [])
        for name in ('이화여대', '중앙대', '서울시립대', '아주대', '경북대'):
            self.assertEqual(self.key(name, 'tuition')['timeLabels'], [])
        ajou_doc = next(e for e in self.events if e['university'] == '아주대' and e['categoryId'] == 'documents')
        self.assertEqual(ajou_doc['timeLabels'], [])
        self.assertFalse(any(e.get('auditOtherKey') == 'additional-registration' and e['university'] == '세종대' for e in self.events))
        self.assertIn('개인별 기한', self.rows('세종대')[0]['cells']['registration']['text'])

    def test_written_exams_and_stage_fees(self):
        for identity, detail in [('63647a6517715a6240f5105f', '논술전형'), ('bbed90028617f0e5876b46c5', 'KU논술우수자'), ('46966c336f3a6d3deb0f7bcc', '논술전형')]:
            e = self.event(identity)
            self.assertEqual(e['categoryId'], 'written-exam')
            self.assertEqual(e['admissionDetail'], detail)
            self.assertEqual(e['category'], '논술고사')
            written_rows = [r for r in self.rows(e['university']) if r['id'].endswith('-written')]
            self.assertEqual(len(written_rows), 1)
            self.assertIn(e['rawSchedule'], written_rows[0]['cells']['writtenExam']['text'])
            self.assertIn('논술고사만 안내; 다른 일정은 입학처 확인', written_rows[0]['cells']['registration']['text'])
            self.assertNotEqual(written_rows[0]['cells']['firstResult']['text'], '해당 없음')
        for name, end, time in [('건국대', '2026-11-23', '14:00'), ('동국대', '2026-11-16', '16:00')]:
            e = self.key(name, 'stage-fee')
            self.assertEqual(e['endDate'], end)
            self.assertEqual(e['timeLabels'], [time])
            self.assertIn('발표 이후', e['rawSchedule'])
            self.assertIn('응시자격 상실', e['note'])
            self.assertTrue(any(e['rawSchedule'] in r['cells'].get('stageFee', {}).get('text', '') for r in self.rows(name)))
        self.assertIn('미확인', self.event('6155d424aa51bc22cc06fe75')['note'])
        self.assertEqual(self.event('6155d424aa51bc22cc06fe75')['timeLabels'], ['17:00'])

    def test_scope_exceptions(self):
        self.assertEqual(self.key('중앙대', 'convergence-med-first')['timeLabels'], ['14:00'])
        self.assertEqual(self.key('중앙대', 'convergence-med-interview')['startDate'], '2026-12-06')
        cau_other = next(r for r in self.rows('중앙대') if r['id'] == 'page-2-row-4')
        self.assertIn('의학부 외', cau_other['cells']['admissionType']['text'])
        self.assertEqual(cau_other['cells']['interview']['text'], '해당 없음')
        self.assertIn('약학부·간호학과 12/6', self.event('e39927f677a2ca76d1565a31')['rawSchedule'])
        self.assertIn('경영대학 자연계 제외', self.event('a2bd15091aff34ff5e0f8f5e')['admissionDetail'])
        self.assertIn('경영대학 자연계', self.key('국민대', 'human-interview')['admissionDetail'])
        self.assertIn('창의소프트학부', self.event('974f3dd7d248ba19cbc7a70a')['admissionDetail'])
        self.assertEqual(self.key('세종대', 'general-interview')['startDate'], '2026-11-22')
        self.assertIn('기회균형', self.event('51bf5abcfd237b6828fc6d2d')['admissionDetail'])
        self.assertEqual(self.key('서울과기대', 'special-interview')['startDate'], '2026-11-28')
        self.assertEqual(self.key('아주대', 'medical-first')['startDate'], '2026-12-12')
        self.assertEqual(self.key('아주대', 'medical-interview')['startDate'], '2026-12-14')
        self.assertIn('간호대학', self.event('787ac6dd9a4311131d15aa05')['admissionDetail'])
        self.assertIn('학생부종합', self.event('07fcf7d99af8a803e8bfea91')['admissionDetail'])
        self.assertIn('약학전공', self.event('b54583e2a302eb0a7ffec804')['rawSchedule'])

    def test_additional_results_and_qualifiers(self):
        for identity, time in [('0e9d79e967089f84489ce68f','22:00'), ('cbc19e27f23705a7ab76ca08','15:00'), ('507b65fe244b388d0cc54163','09:00')]:
            self.assertEqual(self.event(identity)['timeLabels'], [time])
        self.assertIn('예정', self.event('cbc19e27f23705a7ab76ca08')['rawSchedule'])
        self.assertIn('이후', self.event('0ef8572e4bb24825ca5511a5')['rawSchedule'])
        self.assertEqual(self.key('서울시립대', 'final-additional')['endDate'], '2026-12-29')
        self.assertEqual(self.key('경희대', 'first-additional')['timeLabels'], ['23:00'])
        self.assertEqual(self.event('f513a47fd24d43c357fa3293')['excludedDates'], ['2026-12-25','2026-12-26','2026-12-27'])
        self.assertEqual(self.event('59e700bb85fb423dcf22b80f')['startDate'], '2026-12-28')

    def test_documents_and_notices(self):
        self.assertEqual(self.key('경북대', 'pdf-upload')['deadlineDate'], '2026-09-11')
        self.assertEqual(self.key('경북대', 'original-documents')['deadlineDate'], '2027-01-20')
        self.assertIn('비동의자', self.key('경북대', 'pdf-upload')['admissionDetail'] + self.key('경북대', 'pdf-upload')['rawSchedule'])
        self.assertIn('도착', self.key('이화여대', 'foreign-originals')['rawSchedule'])
        self.assertIn('1/7 등기소인', self.key('경희대', 'original-documents')['rawSchedule'])
        self.assertEqual(self.key('경희대', 'exam-notice')['timeLabels'], ['18:00'])
        self.assertIn('예정', self.key('동국대', 'exam-notice')['rawSchedule'])
        self.assertNotIn('9.11(목)', self.event('9ee2e9bd3252040721eec6c5')['rawSchedule'])

    def test_materializes_unknown_inherited_cells_before_unmerge(self):
        payload = copy.deepcopy(self.original)
        page = next(p for p in payload['admissionsTable']['pages'] if p['page'] == 2)
        rows = [r for r in page['rows'] if r['university'] == '이화여대']
        page['columnKeys'].append('customEvidence')
        rows[0]['cells']['customEvidence'] = {'text': 'inherited evidence', 'rowSpan': 2}
        rows[1]['cells']['customEvidence'] = None
        audit.apply(payload)
        self.assertEqual(rows[1]['cells']['customEvidence'], {'text': 'inherited evidence', 'rowSpan': 1})
        self.assertEqual(rows[0]['cells']['customEvidence']['rowSpan'], 1)

    def test_every_event_is_represented_in_owned_table(self):
        for e in self.events:
            if e['university'] not in audit.NAMES: continue
            column = audit.COLUMNS[e['categoryId']]
            self.assertTrue(any(e['rawSchedule'] in r['cells'].get(column, {}).get('text', '') for r in self.rows(e['university'])), e['id'])


if __name__ == '__main__':
    unittest.main()
