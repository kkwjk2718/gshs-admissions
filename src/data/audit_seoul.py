"""2026-09-06 report corrections for six Seoul universities.

Mutates only their events/table rows; metadata and column definitions belong to
integration. Dates are inclusive, times are KST, timeLabels[0] is the deadline.
The supplied audit report is the evidence baseline, not a fresh web audit.
"""
from copy import deepcopy
from hashlib import sha256

SOURCES = {
    'snu': 'https://admission.snu.ac.kr/webdata/admission/files/2027susi.pdf (PDF 6, 8쪽); https://admission.snu.ac.kr/undergraduate/notice?bbsidx=174464&md=v',
    'yonsei': 'https://admission.yonsei.ac.kr/seoul/upload/guide/20260529204109T8NZNJ.PDF (PDF 14~15, 19~20쪽); https://admission.yonsei.ac.kr/seoul/admission/html/rolling/noticeView.asp?BBS_NO=3524; https://admission.yonsei.ac.kr/seoul/admission/html/rolling/noticeView.asp?BBS_NO=3523; https://admission.yonsei.ac.kr/seoul/upload/bbs/20260901101555635F26.PDF',
    'korea': 'https://oku.korea.ac.kr/attach/202607/1783652032558_0.pdf (2026-06-25판, PDF 9, 15, 22쪽)',
    'sungkyunkwan': 'https://admission.skku.edu/common/download.php?fpath=guide/20260813104526BBPE44.pdf&fname=2027.pdf (PDF 10~11쪽); https://admission.skku.edu/admission/html/rolling/guide.html',
    'hanyang': 'https://go.hanyang.ac.kr/resources/upload_data/mojib/20260818042807559_.pdf (PDF 8~9, 21, 24쪽)',
    'sogang': 'https://admission3.sogang.ac.kr/upload/BBS0014/20260609114515AV55WP.PDF (PDF 9쪽 오른쪽, 인쇄 15쪽)',
}
LABELS = {'application': '원서 접수', 'documents': '서류 제출', 'first-result': '1차 발표', 'interview': '면접', 'written-exam': '논술고사', 'exam-notice': '고사장 안내', 'stage-fee': '2단계 전형료', 'final-result': '합격자 발표', 'additional-result': '충원 합격자 발표', 'registration': '합격자 등록'}
COLUMNS = {'first-result': 'firstResult', 'final-result': 'finalResult', 'additional-result': 'additionalResult', 'written-exam': 'writtenExam', 'exam-notice': 'examNotice', 'stage-fee': 'stageFee'}
SCOPES = {
    'snu': ['일반전형', '기회균형특별전형(사회통합)'],
    'yonsei': ['논술전형, 기회균형', '활동우수형(자연)'],
    'korea': ['계열적합전형', '고른기회', '논술전형'],
    'sungkyunkwan': ['학생부종합(융합인재, 탐구인재)', '학생부종합(과학인재)'],
    'hanyang': ['학생부종합(면접형)', '논술전형'],
    'sogang': ['학생부종합(일반Ⅰ, 일반Ⅱ, 기회균형, 서강가치; 특성화고교졸업자 제외)'],
}


def _date(value):
    return value if len(value) == 10 else '2026-' + value


def apply(payload):
    """Apply the report in-place and return payload; repeat calls are identical."""
    existing = {e['id']: e for e in payload['events']}
    specs = []

    def add(u, key, cat, start, end=None, time=None, detail=None, condition='', rows=None, label=None):
        rows = list(range(len(SCOPES[u]))) if rows is None else rows
        detail = detail or ', '.join(SCOPES[u][i] for i in rows)
        start, end = _date(start), _date(end or start)
        event_id = key if key in existing else sha256(('seoul-audit-2027:' + u + ':' + key).encode()).hexdigest()[:24]
        # A semantic key always hashes the same way, including on subsequent calls.
        previous = existing.get(event_id)
        label = label or LABELS[cat]
        raw = start + ('~' + end if end != start else '')
        if time:
            raw += ' ' + time
        raw += ' | ' + label + ' | ' + detail + (' | ' + condition if condition else '')
        note = '2026-09-06 검증 보고서 반영. 공식 근거: ' + SOURCES[u] + '. 향후 변경 및 개인별 지정 시간은 입학처에서 최종 확인.'
        names = {'snu': '서울대', 'yonsei': '연세대', 'korea': '고려대', 'sungkyunkwan': '성균관대', 'hanyang': '한양대', 'sogang': '서강대'}
        event = dict(id=event_id, uid=previous['uid'] if previous else event_id + '@codex.local', universityId=u, university=names[u], categoryId=cat, category=LABELS[cat], sourceCategory={'application': '지원서 접수', 'interview': '면접 및 구술'}.get(cat, LABELS[cat]), title=f'{names[u]} {detail} {label}', taggedTitle=f'[{LABELS[cat]}] [{names[u]}] {detail} {label}', admissionDetail=detail, startDate=start, endDate=end, deadlineDate=end, isDateRange=start != end, timeLabels=[time] if time else [], excludedDates=[], rawSchedule=raw, note=note)
        event['description'] = f"대학: {names[u]}\n전형: {detail}\n구분: {label}\n원문 일정: {raw}\n안내: {note}"
        specs.append((event, rows))

    # Original logical events retain their identifiers even when dates/category change.
    application_ids = ['1e9be7397484c572890a8cf5', 'c969a9154b0bc1d175911904', 'cde173542bc9b429ebf609a4', '09c3a0f8eca765bf181b7abd', '2df1422f28bb522adf5deb0e', '1a5dcdc7d86cfae875940793']
    for u, eid in zip(SCOPES, application_ids):
        add(u, eid, 'application', '09-07' if u in ('snu', 'yonsei', 'korea') else '09-08', '09-09' if u in ('snu', 'yonsei', 'korea') else '09-11', '17:00' if u in ('yonsei', 'korea') else '18:00', condition='접수 시작 10:00' + ('; 온라인 자료 제공 동의도 9/9 17:00 마감' if u == 'yonsei' else ''))
    add('snu', 'a7475d04ea6518b30e24a1d3', 'documents', '09-07', '09-10', '18:00', detail='일반전형(음악대학 제외), 기회균형특별전형(사회통합)', condition='해당자 온라인 업로드; 기회균형 일부 예술 모집단위 포트폴리오는 우편/방문')
    add('snu', 'music-documents', 'documents', '10-12', '10-13', '18:00', detail='일반전형 음악대학 피아노과/관현악과 1단계 합격자', condition='10/12 10:00부터 해당자 온라인 서류 업로드', rows=[0])
    add('snu', '6f7bd10a70a5930ba4ec96a0', 'first-result', '11-20', time='18:00', detail='일반전형(음악대학 제외), 기회균형특별전형(사회통합)', condition='18:00 이후 발표', label='1차 발표 (18:00 이후)')
    add('snu', 'music-first', 'first-result', '10-08', time='18:00', detail='일반전형 음악대학', condition='18:00 이후 발표', rows=[0], label='1차 발표 (18:00 이후)')
    add('snu', 'b366ac51e4c0a16d1a54d8c0', 'interview', '11-27', detail='일반전형(수의과대학·의과대학·치의학과·음악대학 제외)', rows=[0])
    add('snu', 'general-medical-interview', 'interview', '11-28', detail='일반전형 수의과대학·의과대학·치의학대학원 치의학과', rows=[0])
    add('snu', 'd87d3a3d8a6b136ed85384d1', 'interview', '12-04', detail='기회균형특별전형(사회통합; 수의과대학·음악대학·의과대학 제외)', rows=[1])
    add('snu', 'equity-exception-interview', 'interview', '12-05', detail='기회균형특별전형(사회통합) 수의과대학·음악대학·의과대학', rows=[1])
    add('snu', 'stage-fee', 'stage-fee', '11-23', '11-24', '18:00', detail='일반전형(음악대학 제외), 기회균형특별전형(사회통합) 1단계 합격자', condition='11/23 10:00 납부 시작; 미납 시 2단계 응시 불가')
    add('yonsei', '1bca2feb1eb191bc6f1697bf', 'documents', '09-07', '09-10', '17:00', condition='9/7 10:00부터 해당자 온라인 PDF 업로드; 원서접수 마감과 다름')
    add('yonsei', '798af3471c1e1f7580fd2c57', 'written-exam', '10-10', detail='논술전형', rows=[0])
    add('yonsei', '7881e0da3906f66b617d8c6b', 'first-result', '10-26', detail='기회균형', rows=[0])
    add('yonsei', '7a7852a0c4b7c0e4d0701286', 'interview', '11-01', time='12:30', detail='기회균형', condition='12:30까지 입실; 10/31은 체육인재 면접이며 기회균형 일정 아님', rows=[0], label='면접 (12:30 입실 마감)')
    add('yonsei', 'f97b34dda035712c5d1665f2', 'first-result', '11-16', rows=[1])
    add('yonsei', 'f0119e882109601cfdeeb5b3', 'interview', '11-22', rows=[1], condition='입실 마감: 이과/생명/인공지능융합/약학/진리자유(자연) 08:30, 공과대학/치의예 12:30; 의예는 오전/오후 무작위 개별 안내. 개인별 배정 확인')
    add('korea', '1d5016237d21ee7a15cf4496', 'documents', '09-07', '09-09', '18:00', condition='9/7 10:00부터 해당자 온라인 PDF 업로드; 우편 제출 대상 서류와 별도')
    add('korea', 'eb3a9a0e14c15f4c97821f0f', 'documents', '09-10', condition='국내 우편 제출 대상 서류: 9/10 소인 유효; 온라인 마감시각 18:00 적용 안 됨', label='국내 우편 서류 제출 (소인 유효)')
    add('korea', 'overseas-documents', 'documents', '09-11', condition='국외 발송 대상 서류: 9/11 입학처 도착분; 국내 소인 기준과 구분', label='국외 발송 서류 도착 마감')
    add('korea', '17ec02eb67e293a3c1ae8348', 'first-result', '10-30', time='17:00', rows=[0])
    add('korea', '50a875b361cf05d5f0708bda', 'first-result', '10-23', time='17:00', rows=[1])
    add('korea', '6e866c921509b934d2d1b25a', 'interview', '11-08', detail='계열적합전형(자연계)', condition='학과별 08:00 또는 13:20까지 입실 완료; PDF 15쪽 확인', rows=[0])
    add('korea', 'humanities-interview', 'interview', '11-07', detail='계열적합전형(인문계)', condition='학과별 08:00 또는 13:20까지 입실 완료; PDF 15쪽 확인', rows=[0])
    add('korea', 'e9fa936bf7be0afe3809ae7b', 'interview', '10-31', time='08:00', condition='08:00까지 입실', rows=[1], label='면접 (08:00 입실 마감)')
    add('korea', '18cd9d3e6a6f9efef52cc237', 'exam-notice', '11-17', time='17:00', condition='논술 고사장 발표; 일괄합산 전형이므로 1단계 합격자 발표 아님', rows=[2])
    add('korea', '1e2599389275425d62dbd652', 'written-exam', '11-21', detail='논술전형(자연계)', rows=[2])
    add('korea', 'humanities-written', 'written-exam', '11-22', detail='논술전형(인문계)', rows=[2])
    add('sungkyunkwan', 'bb70c2707f19b1c3eb09cd29', 'documents', '09-08', '09-12', '14:00', condition='9/8 10:00부터 해당자 원서접수 사이트 PDF 업로드; 온라인 직접 입력 서식도 동일 마감')
    add('sungkyunkwan', '91fd46f821edfc30723c5bce', 'first-result', '10-27', rows=[1], label='면접대상자 및 시험장 발표', condition='과학인재 면접대상자 및 시험장 발표; 융합인재/탐구인재는 서류 100%로 1단계·면접 없음')
    add('sungkyunkwan', '5daa2110d01af66b8b5fa63d', 'interview', '11-01', rows=[1])
    add('hanyang', '8247c06b8e7e4773417344bf', 'documents', '09-08', '09-14', '17:00', condition='해당자 온라인 PDF 업로드; 9/14(월) 17:00까지')
    add('hanyang', '1aaf6ea63a7d6baca41ab862', 'first-result', '11-13', rows=[0], condition='예정', label='1차 발표 (예정)')
    for eid, day, scope in [('2db091e3f12513156b2c25de', '11-22', '공과대학 및 한양인터칼리지학부(자연)'), ('1e8ccc43ef97660a9bc14ff2', '12-05', '의과대학'), ('68fad7f3f7f8b3555c40dffa', '12-06', '사범대학')]:
        add('hanyang', eid, 'interview', day, detail='학생부종합(면접형) ' + scope, rows=[0])
    add('hanyang', 'ba118d3b1bdb768fdec87101', 'written-exam', '11-29', detail='논술전형(자연계열)', rows=[1])
    add('hanyang', 'humanities-written', 'written-exam', '11-28', detail='논술전형(상경/인문계열)', rows=[1])
    add('sogang', '92a2038e14fb1a429ab09450', 'documents', '09-08', '09-15', '18:00', condition='9/8 10:00부터 해당자 온라인 PDF; 우편/방문 불가. 서강가치 가톨릭지도자 추천인 확인서는 추천인이 이메일 송부하는 예외')
    finals = [('snu', 'aa0073305164d32bc9317faa', '18:00', '18:00 이후'), ('yonsei', '45acdb6bca62809a8a843d0f', '18:00', ''), ('korea', 'a52d295ecb998ca01522353d', '17:00', ''), ('sungkyunkwan', 'a18223b059655596c6d796fc', None, '12/18 이전; 정확한 발표일로 확정한 것이 아님'), ('hanyang', '5e8c7660bc9478331dc4d247', None, '예정'), ('sogang', '89cae8c0e0c5b065c8d8cb8b', '17:00', '예정')]
    for u, eid, time, condition in finals:
        add(u, eid, 'final-result', '12-18', time=time, condition=condition, label='합격자 발표' + (f' ({condition})' if condition else ''))
    for eid, day, n in [('3ca795271f74f9aab7af701d', '12-24', 1), ('496baffa48c7d046c163eaec', '12-28', 2)]:
        add('snu', eid, 'additional-result', day, time='14:00', label=f'{n}차 충원 합격자 발표')
    for i, (day, time) in enumerate([('12-23', '20:00'), ('12-24', '20:00'), ('12-26', '16:00'), ('12-27', '16:00'), ('12-28', '16:00'), ('12-29', '14:00')], 1):
        add('yonsei', '02775be3be18cb64c9c38edc' if i == 1 else f'additional-{i}', 'additional-result', day, time=time, condition=f'{time} 이전 발표; 전화충원 없음; 12/25 발표 없음', label=f'{i}차 충원 발표 ({time} 이전)')
    for i, (day, time) in enumerate([('12-23', '21:00'), ('12-24', '21:00'), ('12-27', '13:00'), ('12-28', '13:00'), ('12-28', '21:00')], 1):
        add('korea', '7ac6bdb61e13792041469be0' if i == 1 else f'additional-{i}', 'additional-result', day, time=time, condition='12/25·12/26 발표 없음; 계열적합전형은 5차까지', label=f'{i}차 충원 합격자 발표')
    add('korea', 'additional-6-written', 'additional-result', '12-29', time='14:00', rows=[2], condition='6차 홈페이지 발표; 계열적합전형 해당 없음', label='6차 충원 합격자 발표 (홈페이지)')
    add('korea', 'additional-6-equity', 'additional-result', '12-29', time='18:00', rows=[1], condition='6차 전화충원: 14:00부터 18:00까지 통보; 정각 일괄 발표 아님', label='6차 충원 전화 통보 (14:00~18:00)')
    for u, eid, condition in [('sungkyunkwan', '779b048d61be44e4f391d9ec', '세부 차수별 시각 미확정; 기간 내 매일 발표한다는 의미 아님'), ('hanyang', '8bb9f2924481f93e89eedb24', '세부 차수는 최초합격자 발표 시 별도 공지; 기간 내 매일 발표한다는 의미 아님'), ('sogang', 'f59d553b0e47d9100811e3f9', '차수별 발표 안내 확인; 기간 내 매일 발표한다는 의미 아님')]:
        add(u, eid, 'additional-result', '12-24', '12-29', '18:00', condition=condition)
    # Registration: never infer an opening time from another institution.
    for u in SCOPES:
        deadline = '14:00' if u in ('yonsei', 'korea') else '16:00'
        opening = '09:00' if u == 'snu' else '10:00'
        add(u, 'registration-first', 'registration', '12-21', '12-23', deadline, condition=('12/21 ' + opening + ' 시작; ' if u != 'sogang' else '시작시각 미기재; ') + '최초 합격자 문서등록', label='최초 합격자 문서등록')
    for i, start, end in [(1, '12-24', '12-25'), (2, '12-28', '12-29')]:
        add('snu', f'registration-{i}', 'registration', start, end, '16:00', condition=f'{start} 14:00 시작; 해당 차수 합격자', label=f'{i}차 충원 문서등록')
    for u, deadlines in [('yonsei', [('12-24','14:00'),('12-26','10:00'),('12-27','10:00'),('12-28','10:00'),('12-29','10:00'),('12-30','16:00')]), ('korea', [('12-24','14:00'),('12-27','10:00'),('12-28','10:00'),('12-28','17:00'),('12-29','10:00'),('12-30','10:00')])]:
        for i, (day, time) in enumerate(deadlines, 1):
            add(u, f'registration-{i}', 'registration', day, time=time, rows=[1,2] if u == 'korea' and i == 6 else None, condition='해당 차수 합격자 문서등록 마감; 개별 지정 등록기간 준수', label=f'{i}차 충원 문서등록 마감')
    for u in ('sungkyunkwan', 'hanyang', 'sogang'):
        add(u, 'registration-additional', 'registration', '12-24', '12-30', None if u == 'sogang' else '16:00', condition='전체 충원등록 범위; 합격 차수별 지정 기간 준수' + ('; 마감시각 미기재' if u == 'sogang' else ''), label='충원 합격자 문서등록')
    for u in ('snu', 'yonsei', 'korea', 'sungkyunkwan', 'hanyang'):
        start, end, time = ('2027-02-15', '2027-02-16', None) if u == 'korea' else ('2027-02-10', '2027-02-12', '16:00')
        opening = {'snu': '2/10 09:00 시작; ', 'hanyang': '2/10 10:00 시작; '}.get(u, '')
        add(u, 'tuition', 'registration', start, end, time, condition=opening + '등록금 전액 납부' + ('; 정확한 납부시각 미기재' if u == 'korea' else ''), label='등록금 납부')

    # Replace only owned university events, preserving other events byte-for-byte.
    payload['events'] = [e for e in payload['events'] if e['universityId'] not in SOURCES] + [e for e, _ in specs]
    # Materialize merged values BEFORE rewriting row-specific schedules.
    for page in payload['admissionsTable']['pages']:
        inherited = {}
        indexes = {}
        for row in page['rows']:
            u = row['universityId']
            for key, cell in list(row['cells'].items()):
                if cell is not None:
                    inherited[(u, key)] = deepcopy(cell)
                if u in SOURCES:
                    value = cell if cell is not None else inherited.get((u, key), {'text': ''})
                    row['cells'][key] = dict(deepcopy(value), rowSpan=1)
            if u not in SOURCES:
                continue
            idx = indexes.get(u, 0)
            indexes[u] = idx + 1
            row['cells']['admissionType'] = {'text': SCOPES[u][idx], 'rowSpan': 1}
            grouped = {}
            for event, rows in specs:
                if event['universityId'] == u and idx in rows:
                    col = COLUMNS.get(event['categoryId'], event['categoryId'])
                    grouped.setdefault(col, []).append(event['rawSchedule'])
            # Remove stale interview/first-result text when reclassified.
            for col in ('application', 'documents', 'firstResult', 'interview', 'writtenExam', 'examNotice', 'stageFee', 'finalResult', 'additionalResult', 'registration'):
                text = '\n'.join(grouped.get(col, []))
                if not text and col in ('firstResult', 'interview'):
                    if (u == 'sungkyunkwan' and idx == 0) or u == 'sogang':
                        text = '해당 없음: 위에 명시한 전형은 서류 100%, 면접 없음'
                    elif (u == 'korea' and idx == 2) or (u == 'hanyang' and idx == 1):
                        text = '해당 없음: 논술전형(고사장 안내/논술고사는 별도 열)'
                if u == 'yonsei' and idx == 0 and col == 'firstResult':
                    text += '\n논술전형은 1단계 합격자 발표 없음'
                if u == 'sogang' and col == 'registration':
                    text += '\n등록금 납부: 2027년 2월 중, 세부 날짜·시각 미확인(별도 확정일 이벤트 생성 안 함)'
                if u == 'snu' and idx == 0 and col == 'interview':
                    text += '\n음악대학 일반전형의 별도 실기/면접 세부 일정은 이 보고서 검증 범위 밖; 공식 요강 확인'
                row['cells'][col] = {'text': text, 'rowSpan': 1}
            row['auditSources'] = SOURCES[u]
            row['cells']['registration']['text'] += '\n등록 조건: 모집요강 및 개인별 안내 확인'
    return payload
