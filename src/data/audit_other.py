"""Report-backed corrections for twelve universities (2026-09-06).

Mutates and returns payload. No source fetch, metadata maintenance or publication.
Unknown times and unconfirmed department lists deliberately remain unspecified.
"""
from copy import deepcopy
from hashlib import sha256

NAMES = ('이화여대', '중앙대', '경희대', '서울시립대', '건국대', '동국대',
         '서울과기대', '국민대', '세종대', '아주대', '부산대', '경북대')
CATEGORIES = {'application': '지원서 접수', 'documents': '서류 제출',
              'first-result': '1차 발표', 'interview': '면접',
              'final-result': '합격자 발표', 'additional-result': '충원 합격자 발표',
              'registration': '합격자 등록', 'written-exam': '논술고사',
              'exam-notice': '고사장 안내', 'stage-fee': '2단계 전형료'}
COLUMNS = {'application': 'application', 'documents': 'documents',
           'first-result': 'firstResult', 'interview': 'interview',
           'final-result': 'finalResult', 'additional-result': 'additionalResult',
           'registration': 'registration', 'written-exam': 'writtenExam',
           'exam-notice': 'examNotice', 'stage-fee': 'stageFee'}
SOURCES = {
 '이화여대': '2027 모집요강 PDF 8~10, 42쪽: https://admission.ewha.ac.kr/upload/GUIDES/20260602125244F7AFE4.pdf',
 '중앙대': '현행 모집요강 PDF 12~13, 27, 32, 97~98쪽: https://admission.cau.ac.kr/detail.do?board_seq=3239',
 '경희대': '8/26 수정 모집요강 PDF 23~25, 41~43쪽: https://iphak.khu.ac.kr/submenu.do?menuurl=iRpJZN81uYxYKEjgpdzo4Q%3D%3D',
 '서울시립대': '8/31 수정 모집요강 PDF 14, 18, 25쪽: https://admission.uos.ac.kr/admissionNew/html/susi/info.do?menuid=2002001001000000000',
 '건국대': '교육청 제공 대학 공식 서울캠퍼스 모집요강 PDF 23~25, 31쪽: https://use.go.kr/component/file/ND_fileDownload.do?q_fileSn=884031&q_fileId=6d617533-da84-4a8a-be1f-f04a511a48c5 . 대학 서버 접근 제한으로 후속 수정 공지와 최신 안내는 미확인. 특히 9/11 17:00 원서 마감은 최신 입학처 재확인 필요.',
 '동국대': '7/15 현행 모집요강 PDF 22, 24, 33~34, 110~111쪽: https://ipsi.dongguk.edu/upload/file/20260715140521FRWQXB.PDF',
 '서울과기대': '현행 모집요강 PDF 20, 24쪽: https://admission.seoultech.ac.kr/ajaxfile/FR_SVC/FileDownload.do?FILE_NM=202608/1787729459834_0.pdf',
 '국민대': '6/22 모집요강 PDF 13~15쪽: https://admission.kookmin.ac.kr/common/file_download.php?id=contents&no=180&col=1',
 '세종대': '현행 모집요강 33, 43쪽: https://ipsi.sejong.ac.kr/ipsi/early/recruitment-guidelines.do',
 '아주대': '수정 모집요강 PDF 8쪽: https://www.iajou.ac.kr/_common/new_download_file.php?menu=boardfile&file_no=4601',
 '부산대': '공식 모집요강 PDF 13쪽, 책자 14~17쪽: https://go.pusan.ac.kr/down/mojib/RF%280%29_260611154120.pdf',
 '경북대': '9/4 현행 모집요강 14~15, 27, 42쪽(스캔 원문 대조): https://ipsi1.knu.ac.kr/upload_data/mojib/20260904091056_32.pdf',
}


def _date(value):
    return value if len(value) == 10 else '2026-' + value


def apply(payload):
    """Apply all report details, preserving existing event identity and other schools."""
    events = payload['events']
    owned = [e for e in events if e['university'] in NAMES]
    by_id = {e['id']: e for e in owned}
    rows = [r for p in payload['admissionsTable']['pages'] for r in p['rows']
            if r['university'] in NAMES]
    # Materialize inherited cells BEFORE changing anchors or inserting rows.
    for page in payload['admissionsTable']['pages']:
        original_rows = deepcopy(page['rows'])
        for i, row in enumerate(page['rows']):
            if row['university'] not in NAMES:
                continue
            for key in set(page['columnKeys']) | set(row['cells']):
                cell = row['cells'].get(key)
                if cell is None:
                    for j in range(i - 1, -1, -1):
                        anchor = original_rows[j]['cells'].get(key)
                        if anchor and j + anchor.get('rowSpan', 1) > i:
                            cell = deepcopy(anchor)
                            break
                if cell is not None:
                    row['cells'][key] = {**cell, 'rowSpan': 1}
        # All target anchors now independent, including formerly null cells.
    def school(name):
        return [e for e in owned if e['university'] == name]
    def change(identity, raw=None, detail=None, start=None, end=None, time=None, cat=None, excluded=None):
        e = by_id[identity]
        if raw is not None: e['rawSchedule'] = raw
        if detail is not None: e['admissionDetail'] = detail
        if start is not None:
            e['startDate'] = _date(start)
            e['endDate'] = _date(end or start)
        elif end is not None: e['endDate'] = _date(end)
        if time is not None: e['timeLabels'] = [time] if time else []
        if cat: e['categoryId'] = cat
        if excluded is not None: e['excludedDates'] = [_date(d) for d in excluded]
        return e
    def select(name, cat):
        return [e for e in school(name) if e['categoryId'] == cat]
    def one(name, cat, **kwargs):
        # Existing non-added event; deterministic new IDs are never the anchor.
        e = next(e for e in select(name, cat) if not e.get('auditOtherKey'))
        return change(e['id'], **kwargs)
    def add(name, key, cat, start, end=None, time='', raw='', detail=None):
        identity = sha256(('audit-other-2027:' + name + ':' + key).encode()).hexdigest()[:24]
        if identity not in by_id:
            base = school(name)[0]
            e = {'id': identity, 'uid': identity + '@codex.local',
                 'university': name, 'universityId': base['universityId'],
                 'admissionDetail': detail or base['admissionDetail'],
                 'excludedDates': [], 'auditOtherKey': key}
            events.append(e); owned.append(e); by_id[identity] = e
        return change(identity, raw=raw, detail=detail, cat=cat, start=start,
                      end=end, time=time, excluded=[])

    openings = dict(zip(NAMES, ['10:00'] * 6 + ['09:00', '10:00', '10:00', '09:00', '10:00', '09:00']))
    for name in NAMES:
        e = one(name, 'application')
        deadline = '17:00' if name == '건국대' else e['timeLabels'][0]
        raw = f"{e['startDate']} {openings[name]}~{e['endDate']} {deadline} 지원서 접수"
        if name == '중앙대': raw += '; 18:00 이전 기본자료 입력 완료자에 한해 결제 18:20까지 허용'
        change(e['id'], raw=raw, time=deadline)
    docs = {
      '이화여대': '9/8 10:00~9/11(금) 17:00 해당자 원서접수 사이트 PDF 직접 업로드; 온라인 학생부 제공 동의자는 별도 업로드 불필요',
      '중앙대': '9/8 10:00~9/15 16:00 해당자 온라인 업로드만; 우편/방문 불가',
      '경희대': '9/8 10:00~9/15 17:00 원서접수 사이트 PDF 업로드; 우편/방문 없음; 학생부 온라인 제공 동의자 등 업로드 불필요',
      '서울시립대': '9/7~9/11 해당자 등기우편, 마감일 등기소인분 유효; 방문 접수 불가',
      '건국대': '9/8 10:00~9/15 17:00 PDF 업로드 및 해당자 온라인 대체서식 입력; 우편/방문 불가',
      '동국대': '원서접수 이후~9/14 소인 유효; 해당자 우편제출, 방문 불가',
      '서울과기대': '9/7~9/17 17:00 학생부 대체서식 온라인 입력; 해당자 등기 제출은 마감일 소인 유효, 방문 불가',
      '국민대': '~9/15 18:00 해당자 원서접수 사이트 PDF 업로드',
      '세종대': '9/8 10:00~9/14 18:00; 등기우편은 9/14 소인 유효',
      '아주대': '~9/15 소인 유효; 모집요강 일정표에 마감시각 없음',
      '부산대': '9/8~9/14 해당자 등기 제출; 서류별 제출기준은 모집요강 책자 14~17쪽 확인',
      '경북대': '9/7~9/16 18:00 우편/택배 일반 제출기간; 해당자 온라인 PDF는 별도 9/11 18:00 마감으로 구분',
    }
    for name, raw in docs.items(): one(name, 'documents', raw=raw)
    for name in ('서울시립대', '동국대', '아주대', '부산대'): one(name, 'documents', time='')

    # Named, source-supported exceptions; no guessed complete department lists.
    ewha_natural = '통계학과, 화학나노과학과, 생명과학과, 지능형반도체공학전공, 화공신소재공학과, 환경공학과, 휴먼기계바이오공학과, 과학교육과, 수학교육과, 식품영양학과, 의예과, 간호학부, 약학전공, 미래산업약학전공, 뇌인지과학부, 컴퓨터공학과, 사이버보안학과, 인공지능데이터사이언스학부'
    one('이화여대', 'interview', detail='미래인재전형(면접형: 11/22 지정 자연계 모집단위)', time='', raw='11/22 13:20~19:00: ' + ewha_natural + '; 정식 학과명은 원문 참조')
    add('이화여대', 'human-interview', 'interview', '11-21', raw='11/21 13:20~19:00 인문과학대학, 경제학과, 경영학부, 의류산업학과, 국제사무학과, 스크랜튼학부, 국제학부', detail='미래인재전형(면접형: 11/21 지정 모집단위)')
    add('중앙대', 'convergence-med-first', 'first-result', '11-26', time='14:00', raw='11/26 14:00 융합형인재 의학부 1단계 발표; 의학부 외는 1단계/면접 없음', detail='학생부종합(융합형인재: 의학부)')
    add('중앙대', 'convergence-med-interview', 'interview', '12-06', raw='12/6 융합형인재 의학부 면접; 의학부 외 면접 없음', detail='학생부종합(융합형인재: 의학부)')
    one('중앙대', 'first-result', detail='학생부종합(탐구형인재)', raw='11/26 14:00 탐구형인재 1단계 발표')
    one('중앙대', 'interview', detail='학생부종합(탐구형인재: 모집단위별 지정일)', raw='12/5~12/6 중 모집단위별 하루; 의학부 12/5, 약학부·간호학과 12/6. 그 외 전체 학과 구분은 모집요강 PDF 27쪽 확인; 양일 모두 응시 아님')
    one('경희대', 'interview', raw='12/5~6 중 모집단위별 지정일, 지원 캠퍼스에서 실시. 서울캠퍼스 자연은 주로 12/6, 국제캠퍼스 자연은 단과대학별 12/5 또는 12/6. 의예과/한의예과/치의예과/약학대학 12/6 14:00~18:00; 전체 배정은 요강 확인')
    one('경희대', 'final-result', time='18:00', raw='12/18 18:00 최종 합격 발표')
    one('경희대', 'additional-result', raw='12/29 18:00 최종 충원 통보 마감; 2차 이후 세부 일정 추후 공지')
    add('경희대', 'first-additional', 'additional-result', '12-24', time='23:00', raw='1차 충원 12/24 23:00; 2차 이후 세부 일정 추후 공지')
    add('경희대', 'exam-notice', 'exam-notice', '12-02', time='18:00', raw='12/2 18:00 면접 고사장 확인')

    change('63647a6517715a6240f5105f', cat='written-exam', detail='논술전형', time='10:00', raw='10/3 10:00 논술전형 논술고사; 학생부종합전형Ⅰ 면접 아님')
    change('904e06e84757669e094fe0cb', detail='학생부종합전형Ⅰ(면접형: 자연)', time='10:00', raw='11/29 10:00 자연계 면접')
    add('서울시립대', 'human-interview', 'interview', '11-28', time='10:00', raw='11/28 10:00 인문/예체능 면접', detail='학생부종합전형Ⅰ(면접형: 인문/예체능)')
    one('서울시립대', 'final-result', raw='12/18 예정')
    one('서울시립대', 'additional-result', raw='12/24~12/28 중간 충원; 차수별 안내 확인', time='')
    add('서울시립대', 'final-additional', 'additional-result', '12-29', time='18:00', raw='12/29 18:00까지 최종 충원 발표', detail='학생부종합전형Ⅰ(면접형)')
    change('bbed90028617f0e5876b46c5', cat='written-exam', detail='KU논술우수자', time='', raw='11/21 KU논술우수자 논술고사: 인문/통합 09:20~11:00, 자연 14:00~15:40; KU자기추천 면접 아님')
    one('건국대', 'first-result', time='14:00', raw='11/20 14:00 예정 KU자기추천 1단계 발표')
    one('건국대', 'final-result', time='14:00', raw='12/18 14:00 예정 최종 합격 발표')
    change('5ba85c338c49a454bc8f538c', raw='12/5~6 중 모집단위별 하루. 이과대학/공과대학/사범대학 등 12/5; 수의과대학/건축대학/상허교양대학/첨단바이오공학부/생명공학부 등 12/6. 전체 분류는 PDF 23, 31쪽 확인')
    one('건국대', 'additional-result', start='12-28', end='12-29', raw='2차 이후 12/28~12/29 18:00까지; 12/25~27 매일 발표 아님', time='18:00')
    add('건국대', 'first-additional', 'additional-result', '12-24', time='10:00', raw='1차 충원 12/24 10:00', detail='학생부종합(KU자기추천)')
    add('건국대', 'stage-fee', 'stage-fee', '11-20', '11-23', '14:00', '1단계 합격자 발표 이후~11/23 14:00 2단계 전형료 납부; 미납 시 2단계 응시자격 상실', '학생부종합(KU자기추천) 1단계 합격자')
    change('46966c336f3a6d3deb0f7bcc', cat='written-exam', detail='논술전형', time='', raw='11/22 논술전형 논술고사: 자연 09:30~11:00, 인문Ⅰ 13:00~14:40, 인문Ⅱ 16:30~18:10; Do Dream 면접 아님')
    one('동국대', 'first-result', raw='11/13 예정')
    one('동국대', 'final-result', raw='12/18 예정')
    one('동국대', 'additional-result', start='12-24', end='12-29', time='18:00', raw='12/24~12/29 18:00까지 충원 발표; 차수별 안내 확인')
    change('b13f6693aa8a658583672421', raw='12/11~13 중 학과별 하루. 컴퓨터AI학부/전자전기공학부/물리학과 12/11; 시스템반도체학부/화학과/약학과 12/12; 통계학과 12/13. 그 외 PDF 34쪽 확인. 개인별 오전 09:00~12:00, 오후Ⅰ 13:00~16:00, 오후Ⅱ 17:00~20:00 중 지정; 3일 연속 면접 아님')
    add('동국대', 'stage-fee', 'stage-fee', '11-13', '11-16', '16:00', '1단계 발표 이후~11/16 16:00 2단계 전형료 납부; 미납 시 응시자격 상실', '학생부종합(Do Dream) 1단계 합격자')
    add('동국대', 'exam-notice', 'exam-notice', '11-17', raw='11/17 예정 면접고사장/개인별 시간 안내', detail='학생부종합(Do Dream)')

    change('51bf5abcfd237b6828fc6d2d', detail='학생부종합(기회균형: 특수교육대상자 제외)', raw='11/29 기회균형 면접(특수교육대상자 제외); 학우/창융 면접 아님; 정확한 입실 시간 별도 공지')
    change('6fd6eb503dd6436a4f26a723', raw='11/28 학교생활우수자/창의융합인재 면접; 정확한 입실 시간 별도 공지')
    add('서울과기대', 'special-interview', 'interview', '11-28', raw='11/28 기회균형 특수교육대상자 면접; 입실 시간 별도 공지', detail='학생부종합(기회균형: 특수교육대상자)')
    one('서울과기대', 'additional-result', raw='12/24 14:00~12/29 18:00 충원 발표 전체 범위; 매일 발표 의미 아님, 차수별 발표/등록 시각 별도 안내 준수')
    one('국민대', 'first-result', raw='11/17 14:00 예정')
    one('국민대', 'final-result', raw='12/18 17:00 예정')
    one('국민대', 'interview', detail='국민프런티어(자연계, 경영대학 자연계 제외)', raw='11/21 자연계 면접; 경영대학 자연계 모집단위 제외')
    add('국민대', 'human-interview', 'interview', '11-22', raw='11/22 인문/예체능 및 경영대학 자연계 모집단위 면접', detail='국민프런티어(인문/예체능 및 경영대학 자연계)')
    one('국민대', 'additional-result', raw='12/24~12/29 18:00까지; 세부 차수 별도 공지')
    one('세종대', 'first-result', time='17:00', raw='11/13 17:00 이후 안내 예정')
    one('세종대', 'final-result', raw='12/18 17:00 이후')
    one('세종대', 'interview', detail='세종인재 전형(면접형: 창의소프트학부)', raw='11/21 창의소프트학부만 면접; 인문/자연계열은 11/22')
    add('세종대', 'general-interview', 'interview', '11-22', raw='11/22 인문계열/자연계열 면접', detail='세종인재 전형(면접형: 인문/자연계열)')
    one('세종대', 'additional-result', raw='12/24~12/29 18:00까지; 세부 내용 및 충원 등록 개인별 기한은 최초합격자 발표 시 공지 예정')
    one('아주대', 'first-result', detail='ACE전형(의학과/약학과 제외), 첨단융합인재전형', raw='11/17 1단계 발표; ACE 의학과/약학과 제외(12/12 별도 발표)')
    add('아주대', 'medical-first', 'first-result', '12-12', raw='12/12 ACE 의학과/약학과 1단계 발표', detail='ACE전형(의학과/약학과)')
    add('아주대', 'medical-interview', 'interview', '12-14', raw='12/14 ACE 의학과/약학과 면접', detail='ACE전형(의학과/약학과)')
    change('0dd2814a2f5b2b5d03e57b62', detail='ACE전형(공과대학/첨단ICT융합대학)', raw='11/22 ACE 공과대학/첨단ICT융합대학 면접')
    change('787ac6dd9a4311131d15aa05', detail='ACE전형(소프트웨어/자연대학/간호대학)', raw='11/28 ACE 소프트웨어/자연대학/간호대학 면접')
    add('아주대', 'human-interview', 'interview', '11-29', raw='11/29 ACE 경영/인문/사회과학 면접', detail='ACE전형(경영/인문/사회과학)')
    one('아주대', 'additional-result', raw='12/24~12/29 중 주말·공휴일 제외(12/25, 12/26, 12/27 제외); 차수별 안내 확인', excluded=['12-25', '12-26', '12-27'], time='')
    for e in school('부산대'): e['admissionDetail'] = '학생부종합(지역인재전형)'
    change('133702b779d46dc509a33f3c', time='18:00', raw='1차 충원 12/24 18:00')
    change('0e9d79e967089f84489ce68f', time='22:00', raw='2차 충원 12/27 22:00')
    change('6bf59f079f8e7f4894dfc332', time='18:00', raw='3차 충원 12/29 18:00까지 개별 통보; 정각 발표 아님')
    change('cbc19e27f23705a7ab76ca08', time='15:00', raw='1차 충원 12/24 15:00 예정')
    change('507b65fe244b388d0cc54163', time='09:00', raw='2차 충원 12/27 09:00 예정')
    change('794796f4a6829eeccc573ba0', time='18:00', raw='3차 충원 12/29 10:00~18:00 전화충원 예정; 18:00은 통보 종료시각')
    one('경북대', 'final-result', raw='12/18 16:00 예정')
    add('경북대', 'pdf-upload', 'documents', '09-11', time='18:00', raw='9/11 18:00까지 학교생활기록부 온라인 제공 비동의자 등 해당 서류 PDF 업로드; 일반 우편/택배 9/16 기한과 다름', detail='학생부종합(일반학생전형) PDF 업로드 대상자')
    add('경북대', 'original-documents', 'documents', '2027-01-20', raw='2027/1/20까지 최종 등록한 PDF 업로드 대상자 원본 서류 제출', detail='학생부종합(일반학생전형) 최종 등록 PDF 업로드 대상자')
    add('이화여대', 'original-documents', 'documents', '12-28', '2027-01-08', raw='12/28~2027/1/8 소인 유효: 최종등록 PDF 제출자 원본 서류; 해외는 별도 1/11 17:00 도착', detail='미래인재전형 최종등록 PDF 제출자(국내 원본)')
    add('이화여대', 'foreign-originals', 'documents', '2027-01-11', time='17:00', raw='2027/1/11 17:00 도착 기준: 최종등록 PDF 제출자 해외 원본 서류', detail='미래인재전형 최종등록 PDF 제출자(해외 원본)')
    add('경희대', 'original-documents', 'documents', '2027-01-08', raw='2027/1/8까지 최종등록 해당자 원본 서류 제출; 1/7 등기소인 인정', detail='네오르네상스 최종등록 원본 제출 대상자')

    # Confirmed registration windows only. First time label is always the deadline.
    first = {
      '이화여대': ('10:00','14:00'), '중앙대': ('',''), '경희대': ('','13:00'),
      '서울시립대': ('10:00','16:00'), '건국대': ('10:00','14:00'), '동국대': ('','16:00'),
      '서울과기대': ('09:00','16:00'), '국민대': ('10:00','16:00'), '세종대': ('10:00','16:00'),
      '아주대': ('',''), '부산대': ('10:00','16:00'), '경북대': ('09:00','15:00')}
    tuition = {**first, '서울시립대': ('',''), '경북대': ('',''), '서울과기대': ('09:00','14:00'), '이화여대': ('','')}
    def common_detail(name):
        return {'이화여대':'미래인재전형(서류형/면접형)', '중앙대':'학생부종합(융합형인재/탐구형인재)',
                '서울과기대':'학교생활우수자/창의융합인재/기회균형',
                '아주대':'ACE전형/첨단융합인재전형', '부산대':'학생부종합(지역인재전형)'}.get(name, school(name)[0]['admissionDetail'])
    for name, (opening, deadline) in first.items():
        add(name, 'first-registration', 'registration', '12-21', '12-23', deadline,
            f'최초 온라인 문서등록 12/21 {opening}~12/23 {deadline}; ' + ('세부 시각은 합격자 유의사항 추후 공지' if not deadline else '지정기한 준수'), common_detail(name))
        opening, deadline = tuition[name]
        add(name, 'tuition', 'registration', '2027-02-10', '2027-02-12', deadline,
            f'본등록금 납부 2027/2/10 {opening}~2/12 {deadline}; 문서등록만으로 최종 등록 완료 아님', common_detail(name))
    additional = {
      '이화여대': ('12-30','12-30','', '충원등록 최종시한 12/30; 차수별 지정기한 준수'),
      '중앙대': ('12-24','12-30','', '충원 문서등록 12/24~30, 개별 지정기한; 구체 시각은 추후 유의사항 확인'),
      '경희대': ('12-30','12-30','13:00', '충원 문서등록 최종 마감 12/30 13:00; 차수별 지정기한 준수'),
      '서울시립대': ('12-30','12-30','', '최종 충원 등록 12/30; 차수별 지정기한 준수'),
      '건국대': ('12-30','12-30','14:00', '최종 충원 등록 마감 12/30 14:00; 차수별 지정기한 준수'),
      '동국대': ('12-30','12-30','16:00', '최종 충원 문서등록 마감 12/30 16:00; 차수별 지정기한 준수'),
      '서울과기대': ('12-25','12-30','22:00', '충원등록 전체 범위 12/25 14:00~12/30 22:00; 개인별 차수 마감 준수'),
      '국민대': ('12-24','12-30','', '충원등록 12/24~30 중 지정 기간; 개별 차수 마감 확인'),
      '아주대': ('12-30','12-30','', '최종 충원등록 12/30; 세부 시각은 합격자 유의사항 확인'),
    }
    for name, (start, end, deadline, raw) in additional.items():
        add(name, 'additional-registration', 'registration', start, end, deadline, raw, common_detail(name))
    for name, key, start, end, deadline, raw in [
      ('건국대','additional-reg-1','12-24','12-28','10:00','1차 충원 등록 12/24 10:00~12/28 10:00'),
      ('부산대','additional-reg-1','12-24','12-27','12:00','1차 충원 등록 12/24 18:00~12/27 12:00'),
      ('부산대','additional-reg-2','12-27','12-28','16:00','2차 충원 등록 12/27 22:00~12/28 16:00'),
      ('부산대','additional-reg-3','12-30','12-30','16:00','3차 충원 등록 12/30 10:00~16:00'),
      ('경북대','additional-reg-1','12-24','12-25','15:00','1차 충원 등록 12/24 15:00~12/25 15:00'),
      ('경북대','additional-reg-2','12-27','12-27','16:00','2차 충원 등록 12/27 09:00~16:00'),
      ('경북대','additional-reg-3','12-30','12-30','22:00','3차 충원 등록 12/30 10:00~22:00 예정'),
    ]: add(name, key, 'registration', start, end, deadline, raw, common_detail(name))

    for e in owned:
        cat = CATEGORIES[e['categoryId']]
        e.update(category=cat, sourceCategory=cat, deadlineDate=e['endDate'],
                 isDateRange=e['startDate'] != e['endDate'])
        e['title'] = f"{e['university']} {e['admissionDetail']} {cat}"
        e['taggedTitle'] = f"[{cat}] [{e['university']}] {e['admissionDetail']}"
        e['note'] = '2026-09-06 검증 보고서 반영. ' + SOURCES[e['university']] + ' 개인별 지정시간 및 향후 변경 공지는 입학처 확인. ' + e['rawSchedule']
        e['description'] = f"대학: {e['university']}\n전형: {e['admissionDetail']}\n구분: {cat}\n일정: {e['rawSchedule']}\n안내: {e['note']}"

    _table(payload, owned)
    return payload


def _table(payload, events):
    """Use scoped rows and columns, never attach written exams to interview tracks."""
    for page in payload['admissionsTable']['pages']:
        target = [r for r in page['rows'] if r['university'] in NAMES]
        if not target: continue
        def ensure_row(name, suffix, detail):
            identity = 'audit-other-' + suffix
            found = next((r for r in page['rows'] if r['id'] == identity), None)
            if found: return found
            base = next(r for r in target if r['university'] == name)
            row = {'id': identity, 'university': name, 'universityId': base['universityId'],
                   'cells': {key: {'text': '', 'rowSpan': 1} for key in page['columnKeys']}}
            row['cells']['university'] = {'text': name, 'rowSpan': 1}
            row['cells']['admissionType'] = {'text': detail, 'rowSpan': 1}
            index = max(i for i, r in enumerate(page['rows']) if r['university'] == name)
            page['rows'].insert(index + 1, row); target.append(row)
            return row
        for name, suffix, detail in [('중앙대','cau-medical','학생부종합(융합형인재: 의학부)'),
            ('서울시립대','uos-written','논술전형'), ('건국대','konkuk-written','KU논술우수자'),
            ('동국대','dongguk-written','논술전형'), ('서울과기대','seoultech-equity','학생부종합(기회균형)')]:
            if any(r['university'] == name for r in target): ensure_row(name, suffix, detail)
        for row in target:
            name = row['university']; rid = row['id']; cells = row['cells']
            if rid == 'page-2-row-4': cells['admissionType']['text'] = '학생부종합(융합형인재: 의학부 외)'
            if rid == 'page-2-row-5': cells['admissionType']['text'] = '학생부종합(탐구형인재)'
            if name == '부산대': cells['admissionType']['text'] = '학생부종합(지역인재전형)'
            relevant = [e for e in events if e['university'] == name]
            def accepts(e):
                detail = e['admissionDetail']; cat = e['categoryId']
                if rid.endswith('-written'): return cat == 'written-exam'
                if cat == 'written-exam': return False
                if name == '서울과기대' and cat == 'interview': return ('기회균형' in detail) == (rid == 'audit-other-seoultech-equity')
                if name == '중앙대' and cat in ('first-result','interview'):
                    return ('융합형인재' in detail and rid == 'audit-other-cau-medical') or ('탐구형' in detail and rid == 'page-2-row-5')
                if name == '이화여대' and cat in ('first-result','interview','final-result'):
                    return ('서류형' in detail) == (rid == 'page-2-row-2')
                if name == '아주대' and cat in ('first-result','interview'):
                    return ('ACE' in detail) if rid == 'page-2-row-13' else ('첨단융합인재' in detail)
                return True
            for cat, column in COLUMNS.items():
                selected = [e for e in relevant if e['categoryId'] == cat and accepts(e)]
                selected.sort(key=lambda e: (e['startDate'], e['endDate'], e['id']))
                if selected:
                    cells[column] = {'text': '\n'.join(e['admissionDetail'] + ': ' + e['rawSchedule'] for e in selected), 'rowSpan': 1}
                elif column in cells or cat in ('first-result', 'interview', 'registration'):
                    # No unverified common schedules inherited by new written rows.
                    text = '해당 없음' if cat in ('first-result','interview') else ''
                    if name == '세종대' and cat == 'registration': text = '충원등록: 최초합격자 발표 시 개별 기한 공지 확인'
                    cells[column] = {'text': text, 'rowSpan': 1}
            if rid.endswith('-written'):
                cells['admissionType']['text'] += '' if '논술고사만 안내' in cells['admissionType']['text'] else ' (논술고사만 안내; 다른 일정은 입학처 확인)'
                for column in COLUMNS.values():
                    if column != 'writtenExam':
                        cells[column] = {'text': '논술고사만 안내; 다른 일정은 입학처 확인', 'rowSpan': 1}
            if name == '세종대': cells['registration']['text'] += '\n충원등록: 확인된 공통 날짜/시각 없음; 최초합격자 발표 시 개인별 기한 확인'
            if name == '건국대':
                for cell in cells.values():
                    if cell and cell['text'] and cell not in (cells.get('university'), cells.get('admissionType')):
                        cell['text'] += '\n교육청 제공 공식 요강 기준; 대학 후속 수정 공지/최신 안내 미확인, 입학처 재확인 필요'
        for cat, column in COLUMNS.items():
            if any(r['cells'].get(column, {}).get('text') for r in target) and column not in page['columnKeys']:
                page['columnKeys'].append(column)
                page['columns'].append({'key': column, 'label': CATEGORIES[cat]})
