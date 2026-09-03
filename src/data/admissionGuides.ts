export type AdmissionGuideKind = 'guide' | 'admissions-page'

export interface AdmissionGuide {
  url: string
  label: string
  kind: AdmissionGuideKind
  verifiedAt: string
}

const verifiedAt = '2026-09-03'

export const admissionGuides: Record<string, AdmissionGuide> = {
  DGIST: {
    url: 'https://www.dgist.ac.kr/prog/mtcltnData/adm/sub04_05/view.do?mtcltnDataNo=73',
    label: '2027학년도 학부 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  GIST: {
    url: 'https://www.gist.ac.kr/download/?file_id=sqfortm6tm7o0mkxkgtqpnurromtdu',
    label: '2027학년도 학부 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  KAIST: {
    url: 'https://admission.kaist.ac.kr/wz/api/board/48/2222/download/0',
    label: '2027학년도 학사과정 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  KENTECH: {
    url: 'https://admission.kentech.ac.kr/detail.do?menuurl=CMQ9%2FVd2MCqEcGDisnKXfA%3D%3D&board_seq=7653&row_num=19&pageNo=1&siteName=ipsi&lang=kor',
    label: '2027학년도 학부 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  POSTECH: {
    url: 'https://adm-u.postech.ac.kr/wp-content/uploads/2025/05/2027%ED%95%99%EB%85%84%EB%8F%84_POSTECH_%EB%AA%A8%EC%A7%91%EC%9A%94%EA%B0%95_web.pdf',
    label: '2027학년도 학부 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  UNIST: {
    url: 'https://adm-u.unist.ac.kr/admission/guide/regular-recruitment.do?articleNo=105834&attachNo=575154&mode=download',
    label: '2027학년도 학부 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  건국대: {
    url: 'https://admission.konkuk.ac.kr/admission/37859/subview.do',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  경북대: {
    url: 'https://ipsi1.knu.ac.kr/mojib/?m_type=SUSI',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  경희대: {
    url: 'https://iphak.khu.ac.kr/file/download.do?ofn=2027%ED%95%99%EB%85%84%EB%8F%84+%EA%B2%BD%ED%9D%AC%EB%8C%80%ED%95%99%EA%B5%90+%EC%88%98%EC%8B%9C+%EB%AA%A8%EC%A7%91%EC%9A%94%EA%B0%95-%EC%B5%9C%EC%A2%85.pdf&sfn=20260513065257380_2027%ED%95%99%EB%85%84%EB%8F%84+%EA%B2%BD%ED%9D%AC%EB%8C%80%ED%95%99%EA%B5%90+%EC%88%98%EC%8B%9C+%EB%AA%A8%EC%A7%91%EC%9A%94%EA%B0%95-%EC%B5%9C%EC%A2%85.pdf',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  고려대: {
    url: 'https://oku.korea.ac.kr/attach/202605/1780023076409_0.pdf',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  국민대: {
    url: 'https://admission.kookmin.ac.kr/helper/notice.php?ctype=view&no=1070',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  동국대: {
    url: 'https://ipsi.dongguk.edu/upload/file/20260601115911UVEHWG.PDF',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  부산대: {
    url: 'https://go.pusan.ac.kr/down/mojib/RF%280%29_260611154120.pdf',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  서강대: {
    url: 'https://admission3.sogang.ac.kr/upload/BBS0014/20260609114515AV55WP.PDF',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  서울과기대: {
    url: 'https://admission.seoultech.ac.kr/cms/FR_CON/index.do?MENU_ID=130',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  서울대: {
    url: 'https://admission.snu.ac.kr/webdata/admission/files/2027susi.pdf',
    label: '2027학년도 수시모집 안내',
    kind: 'guide',
    verifiedAt,
  },
  서울시립대: {
    url: 'https://admission.uos.ac.kr/admissionNew/html/susi/info.do?menuid=2002001001000000000',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  성균관대: {
    url: 'https://admission.skku.edu/admission/html/rolling/guide.html',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  세종대: {
    url: 'https://ipsi.sejong.ac.kr/ipsi/early/recruitment-guidelines.do',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  아주대: {
    url: 'https://www.iajou.ac.kr/notice/view.php?bn=78498&f=&m_type=SUSI&nPage=0&s=',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  연세대: {
    url: 'https://admission.yonsei.ac.kr/seoul/admission/html/rolling/guide.asp',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  이화여대: {
    url: 'https://admission.ewha.ac.kr/upload/GUIDES/20260602125244F7AFE4.pdf',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  중앙대: {
    url: 'https://admission.cau.ac.kr/detail.do?board_seq=3239&categoryid=&menuurl=bmyV1ovIAzYtqDXLjUSVtw%3D%3D&pageNo=1&userpwd=',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
  한양대: {
    url: 'https://go.hanyang.ac.kr/web/mojib/mojib.do?m_type=SUSI&m_year=2027',
    label: '2027학년도 수시 모집요강',
    kind: 'guide',
    verifiedAt,
  },
}
