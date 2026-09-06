"""Apply the user-supplied 2026-09-06 science audit, not a new verification.

Mutates events/table only. The caller owns category metadata, counts and ICS.
No unreported tuition dates or fees are inferred for these six institutions.
"""
from copy import deepcopy
from hashlib import sha256

SOURCES = {
    'kaist': ('https://admission.kaist.ac.kr/wz/api/board/48/2222/download/0', 'PDF 17, 20, 25쪽 / 창의도전 등록 안내'),
    'postech': ('https://adm-u.postech.ac.kr/wp-content/uploads/2025/05/2027%ED%95%99%EB%85%84%EB%8F%84_POSTECH_%EB%AA%A8%EC%A7%91%EC%9A%94%EA%B0%95_web.pdf', 'PDF 7, 40쪽'),
    'gist': ('https://www.gist.ac.kr/download/?file_id=sqfortm6tm7o0mkxkgtqpnurromtdu', 'PDF 32, 34, 37, 45쪽'),
    'unist': ('https://adm-u.unist.ac.kr/admission/guide/admissions-process.do?articleNo=105830&attachNo=591638&mode=download', 'PDF 32, 34, 42, 48, 51쪽'),
    'dgist': ('https://www.dgist.ac.kr/prog/mtcltnData/adm/sub04_05/view.do?mtcltnDataNo=73', 'PDF 25, 26, 29, 30쪽'),
    'kentech': ('https://admission.kentech.ac.kr/detail.do?menuurl=CMQ9%2FVd2MCqEcGDisnKXfA%3D%3D&board_seq=7653&row_num=19&pageNo=1&siteName=ipsi&lang=kor', '2026.6.25 파일 PDF 57쪽 / 책자 55쪽'),
}
NOTICES = {
    'gist': ['https://www.gist.ac.kr/uadm/html/sub03/0301.html?mode=V&no=223083'],
    'unist': ['https://adm-u.unist.ac.kr/admission/community/rolling-admissions.do?articleNo=307043&mode=view', 'https://adm-u.unist.ac.kr/admission/community/rolling-admissions.do?articleNo=307046&mode=view'],
    'dgist': ['https://www.dgist.ac.kr/bbs/BBSMSTR_000000000057/B000000111448Hn0lS8.do?mno=sub04_01', 'https://www.dgist.ac.kr/bbs/BBSMSTR_000000000057/list.do'],
}
SCOPES = {'kaist': '창의도전전형, 일반전형, 고른기회전형, 특기자전형, 반도체시스템전형', 'postech': '일반전형Ⅰ, 일반전형Ⅱ, 반도체공학인재전형', 'gist': '일반전형, 고른기회전형, 특기자전형', 'unist': '일반전형, 탐구우수전형, 그릿인재전형', 'dgist': '일반전형, 과학인재전형', 'kentech': '학생부종합(일반전형, 고른기회전형)'}
REGULAR = '일반전형, 고른기회전형, 특기자전형, 반도체시스템전형'
LABELS = {'application': '지원서 접수', 'essay': '자소서 입력', 'recommendation': '추천서 입력', 'documents': '서류 제출', 'first-result': '1차 발표', 'interview': '면접', 'final-result': '합격자 발표', 'additional-result': '충원 합격자 발표', 'registration': '합격자 등록', 'registration-program': '등록 프로그램'}
COLUMNS = {'application': 'application', 'essay': 'essay', 'recommendation': 'recommendation', 'documents': 'documents', 'first-result': 'firstResult', 'interview': 'interview', 'final-result': 'finalResult', 'additional-result': 'additionalResult', 'registration': 'registration', 'registration-program': 'registration'}


def apply(payload):
    """Idempotently correct science events, preserving every existing event UID."""
    events = payload['events']
    by_id = {e['id']: e for e in events}

    def edit(e, raw=None, scope=None, times=None, category=None):
        if raw is not None:
            e['rawSchedule'] = raw
        if scope is not None:
            e['admissionDetail'] = scope
        if times is not None:
            e['timeLabels'] = times
        if category:
            e['categoryId'] = category
        return e

    def add(u, key, category, start, end, raw, scope=None, time=None):
        identifier = sha256(('science-audit-2027:' + u + ':' + key).encode()).hexdigest()[:24]
        if identifier not in by_id:
            by_id[identifier] = {'id': identifier, 'uid': identifier + '@codex.local', 'universityId': u, 'university': u.upper()}
            events.append(by_id[identifier])
        e = by_id[identifier]
        e.update(startDate=start, endDate=end, deadlineDate=end, isDateRange=start != end, excludedDates=[])
        return edit(e, raw, scope or SCOPES[u], [] if time is None else [time], category)

    # Existing logical events retain identifiers even when misclassified.
    for e in list(events):
        u, c = e['universityId'], e['categoryId']
        if u not in SOURCES:
            continue
        if u in ('postech', 'gist', 'kentech'):
            e['admissionDetail'] = SCOPES[u]
        if u == 'kaist':
            if c in ('application', 'essay'):
                edit(e, '9.1(화)~9.9(수) 18:00 지원서·자기소개서·독서이력 작성')
            elif c == 'recommendation':
                edit(e, '9.10(목)~9.18(금) 18:00 교사추천서 최대 2부 선택 제출; 제출 시 담임교사 추천 1부 포함')
            elif e['id'] == '3d1c3af3b4586af9bee025c2':
                edit(e, '9.1(화)~9.9(수) 18:00 기본 서류; 고른기회 자격 추가서류는 별도 9.11 18:00 도착')
            if e['id'] == 'cdabfb4fa174f2d36e07636b':
                edit(e, '2027.1.12(화)~1.15(금) 18:00 도착 기준; 최종합격자 추가서류, 등기우편 또는 방문', SCOPES[u] + ' 최종합격자 추가서류 제출', ['18:00'], 'documents')
        elif u == 'postech':
            if e['id'] == '7a9f0ae094391748b5b04da7':
                edit(e, '9.1(화)~9.11(금) 국내 우편 소인 유효; 해외 발급서류/방문 대체는 별도 기한', times=[])
            elif c == 'interview':
                day = e['startDate'][-2:]
                edit(e, '11.' + day + ' 면접', '일반전형Ⅰ' if day == '28' else '일반전형Ⅱ, 반도체공학인재전형')
            elif c == 'additional-result':
                edit(e, '12.24(목) 10:00~12.29(화) 18:00; 크리스마스와 주말(12.25~27) 제외', times=['18:00'])
                e['excludedDates'] = ['2026-12-25', '2026-12-26', '2026-12-27']
        elif u == 'gist':
            if c in ('application', 'essay', 'recommendation'):
                edit(e, '9.7(월) 09:00~9.11(금) 18:00' + (' 교사추천서 필수 제출' if c == 'recommendation' else ''))
            elif e['id'] == '9d45ed142cd24a6d28bae1e6':
                edit(e, '9.7(월)~9.11(금) 국내 우편 9.11 소인 유효; 방문은 09:00~18:00; 해외 예외는 별도 9.18 도착', times=[])
            elif c in ('first-result', 'final-result'):
                edit(e, ('10.15(목)' if c == 'first-result' else '12.18(금)') + ' 18:00 예정')
        elif u == 'unist':
            if c == 'application':
                edit(e, '9.3(목) 09:00~9.10(목) 18:00', times=['18:00'])
            elif c in ('documents', 'essay'):
                edit(e, '9.3(목) 09:00~9.11(금) 18:00 온라인' + (' PDF 제출; 방문·우편 불가' if c == 'documents' else ' 자기소개서 입력'), times=['18:00'])
            elif e['id'] == '067d13b36c2238837f54cac4':
                edit(e, '9.3(목)~9.11(금) 18:00 국내 고교 온라인 교사추천서 선택 제출; 해외 고교는 별도 이메일 안내', '그릿인재전형(국내 고교 온라인 추천)', ['18:00'])
            elif e['id'] == 'unist-grit-registration-2027':
                edit(e, '12.21(월)~12.23(수) 16:00 최초 등록', SCOPES[u], ['16:00'])
            elif c == 'final-result':
                edit(e, '12.18(금) 이전 합격자 발표', SCOPES[u] + ' (12.18 이전)')
        elif u == 'dgist':
            if c in ('application', 'essay'):
                edit(e, '9.3(목) 09:00~9.10(목) 18:00')
            elif e['id'] == '5cc035ef36f1787a02df9a08':
                edit(e, '미확인: 서류 시작일 9.4(금)의 공식 근거 미확보; 기존 9.4~9.10 유지. 일반/과학인재 필수서류 마감 9.10(목) 18:00 확인', SCOPES[u] + ' (서류 시작일 미확인)', ['18:00'])
            elif e['id'] == 'f2ab5251582dc018483769fc':
                edit(e, '9.3(목) 09:00~9.16(수) 18:00 학교장추천전형 교사추천서 작성; 추천명단 입력과 별개', '학교장추천전형 전용 교사추천서')
            elif e['id'] == 'dd01881fb5806d236674bb88':
                edit(e, '미확인: 11.10(화) 14:00 과학인재 1차 발표는 공식 근거 미확보; 기존 날짜·시각 유지, 입학처 확인 필요', '과학인재전형 (1차 발표 날짜·시각 미확인)', ['14:00'])
            elif c == 'interview':
                edit(e, '11.25(수)~11.27(금) 중 시행 예정', '과학인재전형 (기간 중 지정일 시행 예정)')
            elif c == 'additional-result':
                edit(e, '12.24(목)~12.29(화) 18:00; 최종일 홈페이지 발표 14:00까지, 14:00~18:00 개별통보')
        elif u == 'kentech':
            if c == 'application':
                edit(e, '9.7(월) 10:00~9.11(금) 18:00')
            elif c == 'documents':
                edit(e, '9.7(월) 10:00~9.14(월) 18:00 해당자 등기우편, 9.14 소인 유효')
            elif c == 'additional-result':
                day = e['startDate'][-2:]
                edit(e, '12.' + day + ' 10:00 ' + ('1차' if day == '24' else '2차') + ' 충원 발표')

    add('kaist', 'eligibility', 'documents', '2026-09-11', '2026-09-11', '9.11(금) 18:00 도착 기준; 지원유형별 자격요건 관련 추가서류, 등기우편 또는 방문', '고른기회전형 자격요건 추가서류 해당자', '18:00')
    add('kaist', 'program', 'registration-program', '2026-10-29', '2026-11-04', '10.29(목)~11.4(수) 중 1일 이상 등록 프로그램 참여 필수; 미참여 시 등록 불가 및 합격 취소', '창의도전전형')
    add('kaist', 'early-registration', 'registration', '2026-10-29', '2026-11-06', '10.29(목)~11.6(금) 18:00 창의도전 등록; 등록 프로그램 1일 이상 참여 필수', '창의도전전형', '18:00')
    add('kaist', 'regular-registration', 'registration', '2026-12-18', '2026-12-23', '12.18(금)~12.23(수) 18:00 Regular 전형 등록', REGULAR, '18:00')
    add('postech', 'foreign-documents', 'documents', '2026-07-01', '2026-09-11', '7.1~9.11 도착분: 해외 발급서류', SCOPES['postech'] + ' 해외 발급서류 해당자')
    add('postech', 'visit-documents', 'documents', '2026-09-11', '2026-09-11', '9.11(금) 17:00까지 방문 대체 제출', SCOPES['postech'] + ' 방문 대체 제출자', '17:00')
    add('gist', 'foreign-documents', 'documents', '2026-09-18', '2026-09-18', '9.18(금) 도착까지 허용: 외국고 재학경험 증빙 및 해외교사 우편 추천', SCOPES['gist'] + ' 외국고 재학경험 증빙/해외교사 우편 추천 해당자')
    add('unist', 'foreign-recommendation', 'recommendation', '2026-08-18', '2026-09-11', '8.18~9.11 KST 이메일 선택 추천서 제출; 해외 고교 별도 안내 적용', SCOPES['unist'] + ' 해외 고교 출신자')
    add('dgist', 'principal-list', 'recommendation', '2026-09-03', '2026-09-16', '9.3(목) 09:00~9.16(수) 18:00 학교장 추천명단 입력; 교사추천서 작성과 별개', '학교장추천전형 전용 추천명단', '18:00')
    add('dgist', 'eligibility', 'documents', '2026-09-10', '2026-09-10', '9.10(목) 18:00까지 고른기회 자격서류 온라인 제출; 시작일 근거 없음', '고른기회전형 자격서류 해당자', '18:00')
    add('dgist', 'early-graduation', 'documents', '2026-09-16', '2026-09-16', '9.16(수) 18:00 조기졸업 추천공문 마감; 학교장추천전형 교사추천서와 다른 제출물', '일반전형, 과학인재전형 조기졸업 해당자', '18:00')

    registrations = [
        ('postech', 'first', '2026-12-21', '2026-12-23', '12.21 10:00~12.23 16:00 최초 예비등록', '16:00'),
        ('postech', 'additional', '2026-12-30', '2026-12-30', '충원 예비등록 발표차수별 지정기한 준수; 최종 12.30 16:00까지 (시작일 일괄 지정 아님)', '16:00'),
        ('postech', 'final', '2027-01-18', '2027-01-20', '2027.1.18 10:00~1.20 16:00 최종등록', '16:00'),
        ('gist', 'first', '2026-12-21', '2026-12-23', '12.21~12.23 최초 등록; 요강에 마감시각 미기재, 개별 안내 확인', None),
        ('gist', 'additional', '2026-12-24', '2026-12-30', '12.24~12.30 22:00 충원 등록; 개인별 지정기한 준수', '22:00'),
        ('unist', 'additional', '2026-12-30', '2026-12-30', '충원 등록 최종 마감 12.30 16:00; 개인별 지정기한 준수', '16:00'),
        ('dgist', 'first', '2026-12-21', '2026-12-23', '12.21 09:00~12.23 16:00 최초 등록', '16:00'),
        ('dgist', 'additional', '2026-12-30', '2026-12-30', '충원 등록 최종 12.30 15:00까지; 개인별 지정기한 준수', '15:00'),
        ('kentech', 'first', '2026-12-21', '2026-12-23', '12.21 10:00~12.23 16:00 최초 등록', '16:00'),
        ('kentech', 'additional-1', '2026-12-24', '2026-12-25', '12.24 10:00~12.25 16:00 1차 충원 등록', '16:00'),
        ('kentech', 'additional-2', '2026-12-26', '2026-12-27', '12.26 10:00~12.27 16:00 2차 충원 등록', '16:00'),
    ]
    for u, key, start, end, raw, time in registrations:
        add(u, 'registration-' + key, 'registration', start, end, raw, time=time)
    # Support invocation even without the legacy override, retaining its known UID.
    if 'unist-grit-registration-2027' not in by_id:
        e = add('unist', 'first-registration', 'registration', '2026-12-21', '2026-12-23', '12.21(월)~12.23(수) 16:00 최초 등록', time='16:00')
        e['id'] = 'unist-grit-registration-2027'
        e['uid'] = 'unist-grit-registration-2027@codex.local'

    for e in events:
        u = e['universityId']
        if u not in SOURCES:
            continue
        label = LABELS[e['categoryId']]
        e.update(category=label, sourceCategory=label)
        e['title'] = f"{e['university']} {label} · {e['admissionDetail']}"
        e['taggedTitle'] = f"[{label}] [{e['university']}] {e['admissionDetail']}"
        note = '사용자 제공 2026-09-06 검증 보고서 반영; 향후 변경공지 및 개인별 지정기한은 입학처에서 확인.'
        if u == 'kaist':
            note += ' 홈페이지 응답 지연으로 후속 변경공지 전체 미확인. 실제 충원발표는 필요시 입학처 별도 공지.'
        if u == 'gist':
            note += ' 현재 안내 범위는 일반·고른기회·특기자. 미수록 학교장추천전형의 학교장 추천대상 입력(9.14 09:00~9.18 18:00)은 교사추천서와 별개이며 이 전형들의 의무가 아님.'
        if '미확인' in e['rawSchedule']:
            note = '미확인: ' + e['rawSchedule'] + '\n' + note
        e['note'] = note
        e['sourceUrl'], e['sourcePages'] = SOURCES[u]
        e['sourceUrls'] = [SOURCES[u][0]] + NOTICES.get(u, [])
        e['description'] = '\n'.join([f"대학: {e['university']}", f"전형: {e['admissionDetail']}", f'구분: {label}', '원문 일정: ' + e['rawSchedule'], '근거: ' + SOURCES[u][1] + ' ' + ' '.join(e['sourceUrls']), '안내: ' + note])
    _table(payload)


def _table(payload):
    # Materialize inherited values BEFORE breaking row spans; never touch peers.
    rows = []
    for page in payload['admissionsTable']['pages']:
        inherited = {}
        for i, row in enumerate(page['rows']):
            for key, cell in list(row['cells'].items()):
                if cell is not None:
                    inherited[key] = (i + cell.get('rowSpan', 1), deepcopy(cell))
                if row['universityId'] in SOURCES:
                    if cell is None and key in inherited and i < inherited[key][0]:
                        row['cells'][key] = deepcopy(inherited[key][1])
                    if row['cells'].get(key) is not None:
                        row['cells'][key]['rowSpan'] = 1
            if row['universityId'] in SOURCES:
                rows.append(row)
    for row in rows:
        u = row['universityId']
        track = row['cells']['admissionType']['text'].replace('\n', '')
        if u in ('postech', 'gist', 'kentech'):
            row['cells']['admissionType']['text'] = SCOPES[u]
        groups = {}
        for e in sorted(payload['events'], key=lambda e: (e['startDate'], e['endDate'], e['id'])):
            if e['universityId'] != u:
                continue
            scope = e['admissionDetail']
            if u == 'kaist' and ('창의도전' in track) != ('창의도전' in scope) and not ('창의도전' in scope and '일반전형' in scope):
                continue
            if u == 'unist':
                target = next((t for t in ('일반전형', '탐구우수전형', '그릿인재전형') if t in track), '')
                if target not in scope:
                    continue
            if u == 'dgist':
                if ('학교장추천전형' in scope or '고른기회전형' in scope):
                    continue
                if ('일반전형' in track and '일반전형' not in scope) or ('과학인재' in track and '과학인재' not in scope):
                    continue
            groups.setdefault(COLUMNS[e['categoryId']], []).append(e['admissionDetail'] + ': ' + e['rawSchedule'])
        for key, texts in groups.items():
            row['cells'][key] = {'text': '\n'.join(dict.fromkeys(texts)), 'rowSpan': 1}
        if u == 'kaist':
            row['cells']['additionalResult'] = {'text': '필요시 입학처 별도 공지 (추가서류 제출은 서류 열 참조)', 'rowSpan': 1}
        if u == 'dgist':
            row['cells']['recommendation'] = {'text': '해당 없음: 학교장추천전형 교사추천서·추천명단은 별도 전형 전용; 조기졸업 추천공문은 서류 열 참조', 'rowSpan': 1}
        row['sourceUrl'], row['sourcePages'] = SOURCES[u]
        row['sourceUrls'] = [SOURCES[u][0]] + NOTICES.get(u, [])
    # Isolated procedure-only rows avoid assigning other tracks' schedules.
    page = next(p for p in payload['admissionsTable']['pages'] if any(r['universityId'] == 'dgist' for r in p['rows']))
    for key, scope, category in [('principal', '학교장추천전형', 'recommendation'), ('eligibility', '고른기회전형', 'documents')]:
        rid = 'science-dgist-' + key
        row = next((r for r in page['rows'] if r['id'] == rid), None)
        if row is None:
            row = {'id': rid, 'universityId': 'dgist', 'university': 'DGIST', 'cells': {}}
            index = max(i for i, r in enumerate(page['rows']) if r['universityId'] == 'dgist') + 1
            page['rows'].insert(index, row)
        row['cells'] = {k: {'text': '이 행은 해당 제출 절차만 안내; 그 외 일정은 미수록', 'rowSpan': 1} for k in page['columnKeys']}
        row['cells']['university']['text'] = 'DGIST'
        row['cells']['admissionType']['text'] = scope + ' (제출 절차만 안내)'
        matched = [e for e in sorted(payload['events'], key=lambda e: (e['startDate'], e['endDate'], e['id'])) if e['universityId'] == 'dgist' and scope in e['admissionDetail'] and e['categoryId'] == category]
        row['cells'][COLUMNS[category]]['text'] = '\n'.join(e['admissionDetail'] + ': ' + e['rawSchedule'] for e in matched)
        row['sourceUrl'], row['sourcePages'] = SOURCES['dgist']
        row['sourceUrls'] = [SOURCES['dgist'][0]] + NOTICES['dgist']
