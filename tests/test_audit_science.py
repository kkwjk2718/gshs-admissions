import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]

def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'src/data' / (name + '.py'))
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

audit = load('audit_science')
generator = load('generate_admissions_data')


class ScienceAuditTest(unittest.TestCase):
    def setUp(self):
        self.before = json.loads(subprocess.check_output(['git', 'show', 'de10294:public/data/admissions.json'], cwd=ROOT))
        self.data = copy.deepcopy(self.before)
        generator.apply_unist_2027_overrides(self.data)
        self.legacy = copy.deepcopy(self.data)
        audit.apply(self.data)
        self.events = {e['id']: e for e in self.data['events']}

    def matching(self, u, c):
        return [e for e in self.events.values() if e['universityId'] == u and e['categoryId'] == c]

    def test_idempotent_preserves_peers_and_uids(self):
        once = copy.deepcopy(self.data)
        audit.apply(self.data)
        self.assertEqual(once, self.data)
        self.assertEqual(len(self.events), len(self.data['events']))
        self.assertEqual(len({e['uid'] for e in self.data['events']}), len(self.events))
        for old in self.legacy['events']:
            self.assertEqual(old['uid'], self.events[old['id']]['uid'])
            if old['universityId'] not in audit.SOURCES:
                self.assertEqual(old, self.events[old['id']])
        oldrows = {r['id']: r for p in self.legacy['admissionsTable']['pages'] for r in p['rows']}
        for page in self.data['admissionsTable']['pages']:
            for row in page['rows']:
                if row['universityId'] not in audit.SOURCES:
                    self.assertEqual(oldrows[row['id']], row)
        for key in ('meta', 'universities', 'categories'):
            self.assertEqual(self.legacy[key], self.data[key])

    def test_kaist(self):
        extra = self.events['cdabfb4fa174f2d36e07636b']
        self.assertEqual(extra['categoryId'], 'documents')
        self.assertEqual(extra['timeLabels'], ['18:00'])
        self.assertIn('도착 기준', extra['rawSchedule'])
        self.assertFalse(self.matching('kaist', 'additional-result'))
        program, = self.matching('kaist', 'registration-program')
        self.assertIn('합격 취소', program['rawSchedule'])
        self.assertEqual(program['endDate'], '2026-11-04')
        self.assertEqual(len(self.matching('kaist', 'registration')), 2)
        self.assertTrue(any(e['endDate'] == '2026-09-11' and '고른기회' in e['admissionDetail'] for e in self.matching('kaist', 'documents')))

    def test_postech(self):
        interviews = self.matching('postech', 'interview')
        self.assertEqual({e['startDate']: e['admissionDetail'] for e in interviews}, {'2026-11-28': '일반전형Ⅰ', '2026-11-29': '일반전형Ⅱ, 반도체공학인재전형'})
        self.assertEqual(self.matching('postech', 'additional-result')[0]['excludedDates'], ['2026-12-25', '2026-12-26', '2026-12-27'])
        self.assertTrue(any(e['startDate'] == '2026-07-01' and not e['timeLabels'] for e in self.matching('postech', 'documents')))
        self.assertTrue(any(e['timeLabels'] == ['17:00'] for e in self.matching('postech', 'documents')))
        self.assertTrue(any(e['endDate'] == '2027-01-20' for e in self.matching('postech', 'registration')))

    def test_unverified_and_exclusive_dgist(self):
        for eid in ('dd01881fb5806d236674bb88', '5cc035ef36f1787a02df9a08'):
            e = self.events[eid]
            old = next(e for e in self.legacy['events'] if e['id'] == eid)
            for k in ('startDate', 'endDate', 'timeLabels'):
                self.assertEqual(old[k], e[k])
            for k in ('admissionDetail', 'rawSchedule', 'note'):
                self.assertIn('미확인', e[k])
        self.assertIn('11.10(화)', self.events['dd01881fb5806d236674bb88']['rawSchedule'])
        recs = self.matching('dgist', 'recommendation')
        self.assertEqual(len(recs), 2)
        self.assertTrue(all('학교장추천전형 전용' in e['admissionDetail'] for e in recs))
        self.assertTrue(any('조기졸업' in e['admissionDetail'] and e['endDate'] == '2026-09-16' for e in self.matching('dgist', 'documents')))
        self.assertEqual(next(e for e in self.matching('dgist', 'registration') if e['endDate'] == '2026-12-30')['timeLabels'], ['15:00'])

    def test_registrations_conditions_sources_and_table(self):
        for u in audit.SOURCES:
            self.assertTrue(self.matching(u, 'registration'), u)
        first = next(e for e in self.matching('gist', 'registration') if e['endDate'] == '2026-12-23')
        self.assertEqual(first['timeLabels'], [])
        self.assertTrue(any(e['timeLabels'] == ['22:00'] for e in self.matching('gist', 'registration')))
        self.assertIn('일반전형', self.events['unist-grit-registration-2027']['admissionDetail'])
        self.assertIn('탐구우수전형', self.events['unist-grit-registration-2027']['admissionDetail'])
        self.assertTrue(any(e['startDate'] == '2026-08-18' and '이메일' in e['rawSchedule'] for e in self.matching('unist', 'recommendation')))
        self.assertEqual(len(self.matching('kentech', 'registration')), 3)
        rows = [r for p in self.data['admissionsTable']['pages'] for r in p['rows'] if r['universityId'] in audit.SOURCES]
        for row in rows:
            for cell in row['cells'].values():
                self.assertIsNotNone(cell)
                self.assertEqual(cell['rowSpan'], 1)
            if not row['id'].startswith('science-dgist-'):
                self.assertIn('등록', row['cells']['registration']['text'])
        for e in self.events.values():
            if e['universityId'] in audit.SOURCES:
                self.assertTrue(e['sourceUrl'].startswith('https://'))
                self.assertIn(e['sourceUrl'], e['description'])
                col = audit.COLUMNS[e['categoryId']]
                self.assertTrue(any(e['rawSchedule'] in r['cells'].get(col, {}).get('text', '') for r in rows if r['universityId'] == e['universityId']), e['id'])


if __name__ == '__main__':
    unittest.main()
