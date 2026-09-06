"""Independent report regression tests; never write the live JSON."""
import importlib.util
import json
import subprocess
import unittest
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('audit_seoul', ROOT / 'src/data/audit_seoul.py')
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class SeoulAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline = json.loads(subprocess.check_output(['git','show','de10294:public/data/admissions.json'],cwd=ROOT))
        cls.result = audit.apply(deepcopy(cls.baseline))
        cls.events = cls.result['events']
        cls.ids = {e['id']: e for e in cls.events}

    def select(self, university, category):
        return [e for e in self.events if e['universityId'] == university and e['categoryId'] == category]

    def test_idempotence(self):
        self.assertEqual(audit.apply(deepcopy(self.result)), self.result)

    def test_unrelated_data_untouched(self):
        for key in ('meta', 'categories', 'universities'):
            self.assertEqual(self.baseline[key], self.result[key])
        self.assertEqual([e for e in self.baseline['events'] if e['universityId'] not in audit.SOURCES], [e for e in self.events if e['universityId'] not in audit.SOURCES])
        before = [r for p in self.baseline['admissionsTable']['pages'] for r in p['rows'] if r['universityId'] not in audit.SOURCES]
        after = [r for p in self.result['admissionsTable']['pages'] for r in p['rows'] if r['universityId'] not in audit.SOURCES]
        self.assertEqual(before, after)

    def test_schema_and_uid_preservation(self):
        schema = set(self.baseline['events'][0])
        for e in self.events:
            self.assertEqual(set(e), schema)
            self.assertEqual(e['deadlineDate'], e['endDate'])
            self.assertLessEqual(e['startDate'], e['endDate'])
        for e in self.baseline['events']:
            self.assertIn(e['id'], self.ids)
            self.assertEqual(e['uid'], self.ids[e['id']]['uid'])
        self.assertTrue(all(n == 1 for n in Counter(e['id'] for e in self.events).values()))
        self.assertTrue(all(n == 1 for n in Counter(e['uid'] for e in self.events).values()))

    def test_sources_scope_and_table_consistency(self):
        rows = {}
        for page in self.result['admissionsTable']['pages']:
            for row in page['rows']:
                rows.setdefault(row['universityId'], []).append(row)
                if row['universityId'] in audit.SOURCES:
                    self.assertTrue(all(c['rowSpan'] == 1 for c in row['cells'].values()))
                    self.assertIn('https://', row['auditSources'])
                    self.assertIn('모집요강', row['cells']['registration']['text'])
        for e in self.events:
            if e['universityId'] not in audit.SOURCES:
                continue
            self.assertIn(audit.SOURCES[e['universityId']], e['note'])
            self.assertIn(e['admissionDetail'], e['title'])
            self.assertIn(e['admissionDetail'], e['taggedTitle'])
            self.assertIn(e['rawSchedule'], e['description'])
            col = audit.COLUMNS.get(e['categoryId'], e['categoryId'])
            self.assertTrue(any(e['rawSchedule'] in r['cells'][col]['text'] for r in rows[e['universityId']]))

    def test_yonsei_dates_and_track_separation(self):
        docs = self.select('yonsei', 'documents')[0]
        self.assertEqual((docs['endDate'], docs['timeLabels']), ('2026-09-10', ['17:00']))
        e = self.ids['7a7852a0c4b7c0e4d0701286']
        self.assertEqual((e['startDate'], e['admissionDetail'], e['timeLabels']), ('2026-11-01', '기회균형', ['12:30']))
        self.assertEqual(self.ids['798af3471c1e1f7580fd2c57']['admissionDetail'], '논술전형')
        self.assertEqual(self.ids['7881e0da3906f66b617d8c6b']['admissionDetail'], '기회균형')
        actual = [(e['startDate'][5:], e['timeLabels'][0]) for e in self.select('yonsei', 'additional-result')]
        self.assertEqual(actual, [('12-23','20:00'),('12-24','20:00'),('12-26','16:00'),('12-27','16:00'),('12-28','16:00'),('12-29','14:00')])
        self.assertTrue(all('이전' in e['title'] and '전화충원 없음' in e['rawSchedule'] for e in self.select('yonsei', 'additional-result')))
        self.assertEqual(len([e for e in self.select('yonsei', 'registration') if '충원' in e['title']]), 6)

    def test_korea_rounds_post_and_category(self):
        self.assertEqual(self.ids['18cd9d3e6a6f9efef52cc237']['categoryId'], 'exam-notice')
        self.assertEqual(self.ids['eb3a9a0e14c15f4c97821f0f']['timeLabels'], [])
        rounds = self.select('korea', 'additional-result')
        self.assertEqual([(e['startDate'][5:], e['timeLabels'][0]) for e in rounds[:5]], [('12-23','21:00'),('12-24','21:00'),('12-27','13:00'),('12-28','13:00'),('12-28','21:00')])
        self.assertFalse(any('계열적합' in e['admissionDetail'] for e in rounds[5:]))
        self.assertEqual(rounds[-1]['timeLabels'], ['18:00'])
        self.assertIn('14:00부터', rounds[-1]['rawSchedule'])
        tuition = next(e for e in self.select('korea','registration') if '등록금' in e['title'])
        self.assertEqual((tuition['startDate'], tuition['endDate'], tuition['timeLabels']), ('2027-02-15', '2027-02-16', []))

    def test_snu_fees_music_and_medical_exceptions(self):
        interviews = self.select('snu', 'interview')
        self.assertEqual({e['startDate'] for e in interviews}, {'2026-11-27','2026-11-28','2026-12-04','2026-12-05'})
        self.assertIn('음악대학 제외', self.ids['6f7bd10a70a5930ba4ec96a0']['admissionDetail'])
        self.assertIn('이후', self.ids['6f7bd10a70a5930ba4ec96a0']['title'])
        fee = self.select('snu', 'stage-fee')[0]
        self.assertEqual((fee['startDate'],fee['endDate'],fee['timeLabels']), ('2026-11-23','2026-11-24',['18:00']))
        self.assertIn('10:00', fee['rawSchedule'])
        self.assertIn('미납 시', fee['rawSchedule'])
        self.assertTrue(any(e['startDate'] == '2026-10-12' for e in self.select('snu','documents')))
        self.assertTrue(any(e['startDate'] == '2026-10-08' for e in self.select('snu','first-result')))

    def test_hanyang_skku_sogang_conditions(self):
        doc = self.select('hanyang','documents')[0]
        self.assertEqual(doc['timeLabels'], ['17:00'])
        self.assertIn('9/14(월)', doc['rawSchedule'])
        self.assertIn('공과대학', self.ids['2db091e3f12513156b2c25de']['title'])
        self.assertIn('의과대학', self.ids['1e8ccc43ef97660a9bc14ff2']['title'])
        self.assertIn('사범대학', self.ids['68fad7f3f7f8b3555c40dffa']['title'])
        self.assertEqual(len(self.select('hanyang','written-exam')),2)
        self.assertIn('이전', self.select('sungkyunkwan','final-result')[0]['title'])
        self.assertEqual(len(self.select('sungkyunkwan','additional-result')),1)
        self.assertTrue(all('특성화고교졸업자 제외' in e['admissionDetail'] for e in self.events if e['universityId'] == 'sogang'))
        self.assertIn('추천인이 이메일', self.select('sogang','documents')[0]['rawSchedule'])
        self.assertFalse(any(e['startDate'].startswith('2027-02') for e in self.events if e['universityId']=='sogang'))
        for u in audit.SOURCES:
            self.assertTrue(any('최초' in e['title'] for e in self.select(u,'registration')))
            self.assertTrue(any('충원' in e['title'] for e in self.select(u,'registration')))


if __name__ == '__main__':
    unittest.main()
