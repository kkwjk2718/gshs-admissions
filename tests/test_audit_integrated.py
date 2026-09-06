import copy
import json
import re
import subprocess
import sys
import unittest
from datetime import date, timedelta
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/data'))
from audit_2027 import apply
from generate_admissions_data import apply_unist_2027_overrides, build_ics, unfold_ics
from calendar_segments import active_segments

class IntegratedAuditTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.before = json.loads(subprocess.check_output(['git','show','de10294:public/data/admissions.json'],cwd=ROOT))
        cls.data = copy.deepcopy(cls.before)
        apply(cls.data)

    def test_full_generator_idempotence_and_published(self):
        second = copy.deepcopy(self.data)
        apply_unist_2027_overrides(second)
        apply(second)
        self.assertEqual(second,self.data)
        self.assertEqual(self.data,json.loads((ROOT/'public/data/admissions.json').read_text()))
        self.assertEqual(build_ics(self.data['events']).replace(b'\r\n',b'\n'),(ROOT/'public/data/admissions.ics').read_bytes())

    def test_all_universities_registration_and_integrity(self):
        p=self.data
        events=p['events']
        self.assertEqual(len(p['universities']),24)
        self.assertEqual({u['id'] for u in p['universities']},{e['universityId'] for e in events if e['categoryId']=='registration'})
        self.assertEqual(p['meta']['eventCount'],len(events))
        for key in ['id','uid']:
            self.assertEqual(len({e[key] for e in events}),len(events))
        before={e['id']:e for e in self.before['events']}
        after={e['id']:e for e in events}
        self.assertTrue(set(before).issubset(after),'preserve existing logical events/UIDs')
        for key,e in before.items(): self.assertEqual(e['uid'],after[key]['uid'])
        for c in p['categories']:self.assertEqual(c['eventCount'],sum(e['categoryId']==c['id'] for e in events))
        for u in p['universities']:self.assertEqual(u['eventCount'],sum(e['universityId']==u['id'] for e in events))
        for page in p['admissionsTable']['pages']:
            self.assertIn('registration',page['columnKeys'])
            for row in page['rows']:
                self.assertTrue(row['cells'].get('registration',{}).get('text'),row['id'])
                for key,cell in row['cells'].items():
                    if cell and cell['text'] and key not in page['columnKeys']:
                        self.fail(f'hidden populated table column {row["id"]}: {key}')

    def test_no_essay_exam_misclassification(self):
        events={e['id']:e for e in self.data['events']}
        for key in ['798af3471c1e1f7580fd2c57','ba118d3b1bdb768fdec87101','63647a6517715a6240f5105f','bbed90028617f0e5876b46c5','46966c336f3a6d3deb0f7bcc']:
            self.assertEqual(events[key]['categoryId'],'written-exam')
        self.assertEqual(events['cdabfb4fa174f2d36e07636b']['categoryId'],'documents')
        self.assertIn('미확인',events['dd01881fb5806d236674bb88']['rawSchedule'])

    def test_ics_exclusions_and_uids(self):
        blocks='\n'.join(unfold_ics(build_ics(self.data['events']).decode())).split('BEGIN:VEVENT')[1:]
        by_uid={re.search(r'\nUID:(.*)',b)[1]:b for b in blocks}
        expected=sum(len(active_segments(e)) for e in self.data['events'])
        self.assertEqual(len(blocks),expected)
        self.assertEqual(len(by_uid),expected)
        for e in self.data['events']:
            for i,(start,end) in enumerate(active_segments(e)):
                name,sep,domain=e['uid'].partition('@')
                uid=e['uid'] if i==0 else f'{name}-part-{start}{sep}{domain}'
                block=by_uid[uid]
                self.assertIn('DTSTART;VALUE=DATE:'+start.replace('-',''),block)
                self.assertIn('DTEND;VALUE=DATE:'+(date.fromisoformat(end)+timedelta(days=1)).strftime('%Y%m%d'),block)
                self.assertIn('SUMMARY:',block)
                d=date.fromisoformat(start)
                while d<=date.fromisoformat(end):
                    self.assertNotIn(d.isoformat(),e['excludedDates'])
                    d+=timedelta(days=1)

if __name__=='__main__':unittest.main()
