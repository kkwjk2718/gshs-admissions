"""Durable corrections from the user-provided 2026-09-06 audit report.

Do not interpret the report as a fresh verification of later university notices.
University modules deliberately preserve unknown times and qualified dates.
"""
from collections import Counter
from datetime import date

EXTRA_CATEGORIES = [
    ('written-exam', '논술고사', '논술'),
    ('exam-notice', '고사장 안내', '고사장'),
    ('stage-fee', '2단계 전형료', '전형료'),
    ('registration-program', '등록 프로그램', '등록참여'),
]
NOTICE = ('2026.9.6 검증 보고서 기준 보정본 · 표시된 전형과 모집단위 대상이며 대학 전체 전형 안내가 아닙니다. '
          '예정·이전·이후·소인·도착 기준과 개인별 등록기한을 확인하세요. '
          'DGIST 일부 일정은 미확인, 건국대·KAIST는 후속 변경공지 확인 한계가 있습니다. '
          '빈칸은 절차가 불필요하다는 뜻이 아닙니다. 입학처 최종 확인 필수.')


def apply(payload):
    from audit_seoul import apply as seoul
    from audit_science import apply as science
    from audit_other import apply as other
    if payload['meta']['academicYear'] != 2027:
        raise ValueError('Only 2027 academic year is supported')
    for page in payload['admissionsTable']['pages']:
        for key, label in [('registration','합격자 등록'), ('writtenExam','논술고사'), ('examNotice','고사장 안내'), ('stageFee','2단계 전형료')]:
            if key not in page['columnKeys']:
                page['columnKeys'].append(key)
                page['columns'].append(dict(key=key, label=label))
    for module in (seoul, science, other):
        module(payload)
    for cid, label, short in EXTRA_CATEGORIES:
        if not any(c['id'] == cid for c in payload['categories']):
            payload['categories'].append(dict(id=cid, label=label, sourceLabel=label, shortLabel=short, eventCount=0))
    events = payload['events']
    events.sort(key=lambda e: (e['startDate'], e['deadlineDate'], e['university'], e['categoryId'], e['id']))
    counts = Counter(e['categoryId'] for e in events)
    schools = Counter(e['universityId'] for e in events)
    assert len({e['id'] for e in events}) == len(events), 'duplicate event id'
    assert len({e['uid'] for e in events}) == len(events), 'duplicate event UID'
    known_categories = {c['id'] for c in payload['categories']}
    for event in events:
        assert event['categoryId'] in known_categories
        assert date.fromisoformat(event['startDate']) <= date.fromisoformat(event['endDate'])
        assert event['deadlineDate'] == event['endDate']
        assert event['isDateRange'] == (event['startDate'] != event['endDate'])
    for category in payload['categories']:
        category['eventCount'] = counts[category['id']]
    for university in payload['universities']:
        university['eventCount'] = schools[university['id']]
    table = payload['admissionsTable']
    for page in table['pages']:
        for key,label in [('registration','합격자 등록'), ('writtenExam','논술고사'), ('examNotice','고사장 안내'), ('stageFee','2단계 전형료')]:
            if key not in page['columnKeys']:
                page['columnKeys'].append(key)
                page['columns'].append(dict(key=key,label=label))
    for page in table['pages']:
        for row in page['rows']:
            for key in page['columnKeys']:
                if key not in row['cells']:
                    row['cells'][key] = {'text': '', 'rowSpan': 1}
    table['rowCount'] = sum(len(p['rows']) for p in table['pages'])
    table['title'] = '2027학년도 대입 수시모집 전형일정 (검증 보고서 반영)'
    table['notice'] = NOTICE
    payload['meta'].update(eventCount=len(events), universityCount=len(schools),
                           tableRowCount=table['rowCount'], notice=NOTICE,
                           auditReportDate='2026-09-06',
                           dateRange=dict(start=min(e['startDate'] for e in events),end=max(e['endDate'] for e in events)))
