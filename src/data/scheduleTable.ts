import type { ScheduleGroup } from "../types";

export const scheduleTableMeta = {
  "title": "2027년 대입수시모집 전형일정",
  "notice": "일자 변경으로 차이가 있을 수 있으니 반드시 대학 홈페이지에서 확인하시기 바랍니다. 참고용으로만 활용해 주세요.",
  "rowCount": 37,
  "universityOrder": [
    "서울대",
    "KAIST",
    "POSTECH",
    "GIST",
    "UNIST",
    "DGIST",
    "KENTECH",
    "연세대",
    "고려대",
    "성균관대",
    "한양대",
    "서강대",
    "이화여대",
    "중앙대",
    "경희대",
    "서울시립대",
    "건국대",
    "동국대",
    "서울과기대",
    "국민대",
    "세종대",
    "아주대",
    "부산대",
    "경북대"
  ]
} as const;

export const scheduleGroups: ScheduleGroup[] = [
  {
    "university": "서울대",
    "period": "일반전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.10(목)\n18:00"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금)\n18:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.27(금)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 18:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목),12.28(월)\n14:00"
      }
    ]
  },
  {
    "university": "서울대",
    "period": "기회균형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.10(목)\n18:00"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금)\n18:00"
      },
      {
        "label": "면접 및 구술",
        "value": "12.4(금)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 18:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목),12.28(월)\n14:00"
      }
    ]
  },
  {
    "university": "KAIST",
    "period": "창의도전전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.1(화)~9.9(수)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.1(화)~9.9(수)\n18:00"
      },
      {
        "label": "추천서 입력",
        "value": "9.10(목)~9.18(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.1(화)~9.9(수)\n18:00"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "10.12(월) 10:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "최종합격자 추가서류\n제출\n2027.1.12.(화)~1.15(금)"
      }
    ]
  },
  {
    "university": "KAIST",
    "period": "일반전형/\n고른기회/특기자/\n반도체시스템",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.1(화)~9.9(수)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.1(화)~9.9(수)\n18:00"
      },
      {
        "label": "추천서 입력",
        "value": "9.10(목)~9.18(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.1(화)~9.9(수)\n18:00"
      },
      {
        "label": "1차 발표",
        "value": "11.11(수)\n10:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.26(목)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 10:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "최종합격자 추가서류\n제출\n2027.1.12.(화)~1.15(금)"
      }
    ]
  },
  {
    "university": "POSTECH",
    "period": "일반전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.1(화)~9.11(금)\n우편 소인 유효"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금)\n10:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.28(토)\n11.29(일)\n반도체"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 10:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "GIST",
    "period": "일반전형/\n고른/특기자전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.7(월)~9.11(금)\n18:00"
      },
      {
        "label": "추천서 입력",
        "value": "9.7(월)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.11(금)\n18:00 소인 유효"
      },
      {
        "label": "1차 발표",
        "value": "10.15(목)\n18:00"
      },
      {
        "label": "면접 및 구술",
        "value": "10.22(목)~\n10.23(금)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 18:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "UNIST",
    "period": "일반전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.3(목)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.3(목)~9.11(금)\n18:00 온라인(PDF\n스캔본)"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 이전"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "UNIST",
    "period": "탐구우수전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.3(목)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.3(목)~9.11(금)\n18:00 온라인(PDF\n스캔본)"
      },
      {
        "label": "1차 발표",
        "value": "11.4(수)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.7(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 이전"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "UNIST",
    "period": "그릿인재전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.3(목)~9.11(금)\n18:00"
      },
      {
        "label": "추천서 입력",
        "value": "9.3(목)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.3(목)~9.11(금)\n18:00 온라인(PDF\n스캔본)"
      },
      {
        "label": "1차 발표",
        "value": "11.4(수)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.8(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 이전"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "DGIST",
    "period": "일반전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "추천서 입력",
        "value": "9.3(목)~9.16(수)\n18:00 학교장추천"
      },
      {
        "label": "서류 제출",
        "value": "9.4(목)~9.10(목)\n18:00\n온라인(고른)"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "DGIST",
    "period": "과학인재전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "자소서 입력",
        "value": "9.3(목)~9.10(목)\n18:00"
      },
      {
        "label": "추천서 입력",
        "value": "9.3(목)~9.16(수)\n18:00 학교장추천"
      },
      {
        "label": "서류 제출",
        "value": "9.4(목)~9.10(목)\n18:00\n온라인(고른)"
      },
      {
        "label": "1차 발표",
        "value": "11.10(월)\n14:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.25(수)~\n11.27(금)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "KENTECH",
    "period": "학생부종합",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.14(월)\n18:00 소인 유효"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금)\n18:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.30.(월)"
      },
      {
        "label": "합격자 발표",
        "value": "12.11(금) 18:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목), 12.26(토)\n10:00"
      }
    ]
  },
  {
    "university": "연세대",
    "period": "논술전형,\n기회균형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "1차 발표",
        "value": "기:10.26.(월)"
      },
      {
        "label": "면접 및 구술",
        "value": "논술:10.10(토)\n기균:10.31(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.23(수)~12.29(화)\n~14:00\n12.25(금) 제외"
      }
    ]
  },
  {
    "university": "연세대",
    "period": "활동우수형(자연)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "1차 발표",
        "value": "11.16(월)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.22(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.23(수)~12.29(화)\n~14:00\n12.25(금) 제외"
      }
    ]
  },
  {
    "university": "고려대",
    "period": "계열적합전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.9(수)\n18:00\n9.10(목) 소인\n유효"
      },
      {
        "label": "1차 발표",
        "value": "10.30(금)\n17:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.8(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 17:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.23(수)~12.29(화)\n~14:00\n12.24~25 제외"
      }
    ]
  },
  {
    "university": "고려대",
    "period": "고른기회",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.9(수)\n18:00\n9.10(목) 소인\n유효"
      },
      {
        "label": "1차 발표",
        "value": "10.23 (금)\n17:00"
      },
      {
        "label": "면접 및 구술",
        "value": "10.31(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 17:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.23(수)~12.29(화)\n~14:00\n12.24~25 제외"
      }
    ]
  },
  {
    "university": "고려대",
    "period": "논술",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.9(수)\n17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.9(수)\n18:00\n9.10(목) 소인\n유효"
      },
      {
        "label": "1차 발표",
        "value": "11.17(화)\n17:00"
      },
      {
        "label": "면접 및 구술",
        "value": "자연 11.21(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 17:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.23(수)~12.29(화)\n~14:00\n12.24~25 제외"
      }
    ]
  },
  {
    "university": "성균관대",
    "period": "학생부종합(융합\n인재, 탐구인재)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.12(토)\n14:00"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 이전"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "성균관대",
    "period": "학생부종합\n(과학인재)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.12(토)\n14:00"
      },
      {
        "label": "1차 발표",
        "value": "10.27(화)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.1(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 이전"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "한양대",
    "period": "학생부종합\n(면접형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.14(토)\n온라인 pdf"
      },
      {
        "label": "1차 발표",
        "value": "11.13.(금)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.22.(일)\n의대 12.5(토)\n사범 12.6(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "한양대",
    "period": "논술전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금)\n18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.14(토)\n온라인 pdf"
      },
      {
        "label": "면접 및 구술",
        "value": "11.29(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "서강대",
    "period": "학생부종합전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.15(화) 18:00\n온라인 pdf"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 17:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "이화여대",
    "period": "미래인재전형(서류형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.10(목) 17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.11(목) 17:00"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.17(목)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화)18:00"
      }
    ]
  },
  {
    "university": "이화여대",
    "period": "미래인재전형(면접형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.10(목) 17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.11(목) 17:00"
      },
      {
        "label": "1차 발표",
        "value": "11.12(목)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.22(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.3(목)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화)18:00"
      }
    ]
  },
  {
    "university": "중앙대",
    "period": "학생부종합(융합형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.15(화) 16:00"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 14:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "중앙대",
    "period": "학생부종합(탐구형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.15(화) 16:00"
      },
      {
        "label": "1차 발표",
        "value": "11.26(목) 14:00"
      },
      {
        "label": "면접 및 구술",
        "value": "12.5(토)~6(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 14:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "경희대",
    "period": "학생부종합(네오르네상스)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.15(화) 17:00"
      },
      {
        "label": "1차 발표",
        "value": "11.25.(수) 18:00"
      },
      {
        "label": "면접 및 구술",
        "value": "12.5(토)~6(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "서울시립대",
    "period": "학생부종합전형Ⅰ(면접형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.10(목) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.11(금) 소인\n유효"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.29(일)\n논술 10.3(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.28(월)"
      }
    ]
  },
  {
    "university": "건국대",
    "period": "학생부종합(KU자기추천)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.15(화) 17:00"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금)"
      },
      {
        "label": "면접 및 구술",
        "value": "12.5(토)~6(일)\n논술 11.21(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "동국대",
    "period": "학생부종합(Do Dream)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.9(수)~9.11(금) 17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.9(수)~9.14(월) 소인\n유효"
      },
      {
        "label": "1차 발표",
        "value": "11.13.(금)"
      },
      {
        "label": "면접 및 구술",
        "value": "12.11(금)~12.13(일)\n논술 11.22(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "~12.29(화)"
      }
    ]
  },
  {
    "university": "서울과기대",
    "period": "학생부종합(학교생활우수자)\n학생부종합(창의융합인재)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.17(목) 17:00"
      },
      {
        "label": "1차 발표",
        "value": "11.20(금) 14:00"
      },
      {
        "label": "면접 및 구술",
        "value": "학우, 창융\n11.28.(토)\n기균 11.29(일)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 14:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "국민대",
    "period": "학생부 종합(국민프런티어)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "~9.15(화) 18:00"
      },
      {
        "label": "1차 발표",
        "value": "11.17.(화) 14:00"
      },
      {
        "label": "면접 및 구술",
        "value": "11.21.(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 17:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "세종대",
    "period": "학생부종합(세종인재\n전형(면접형))",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.14(월) 18:00"
      },
      {
        "label": "1차 발표",
        "value": "11.13(금)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.21.(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 17:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화) 18:00"
      }
    ]
  },
  {
    "university": "아주대",
    "period": "ACE전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "~9.15(화) 소인 유효"
      },
      {
        "label": "1차 발표",
        "value": "11.17(화)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.22(일)\n공대, 첨단ICT\n11.28(토)\n소프트웨어, 자연대"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화)"
      }
    ]
  },
  {
    "university": "아주대",
    "period": "첨단융합인재전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "~9.15(화) 소인 유효"
      },
      {
        "label": "1차 발표",
        "value": "11.17(화)"
      },
      {
        "label": "면접 및 구술",
        "value": "11.21(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금)"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목)~\n12.29(화)"
      }
    ]
  },
  {
    "university": "부산대",
    "period": "지역인재전형",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.8(화)~9.11(금) 17:00"
      },
      {
        "label": "서류 제출",
        "value": "9.8(화)~9.14(월)"
      },
      {
        "label": "1차 발표",
        "value": "12.1(화) 16:00"
      },
      {
        "label": "면접 및 구술",
        "value": "12.5(토)"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 16:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목),\n12.27(일),\n12.29(화)\n18:00까지"
      }
    ]
  },
  {
    "university": "경북대",
    "period": "학생부종합(일반학생전형)",
    "rows": [
      {
        "label": "지원서 접수",
        "value": "9.7(월)~9.11(금) 18:00"
      },
      {
        "label": "서류 제출",
        "value": "9.7(월)~9.16(수) 18:00"
      },
      {
        "label": "1차 발표",
        "value": "X"
      },
      {
        "label": "면접 및 구술",
        "value": "X"
      },
      {
        "label": "합격자 발표",
        "value": "12.18(금) 16:00"
      },
      {
        "label": "충원 합격자 발표",
        "value": "12.24(목),\n12.27(일),\n12.29(화)\n18:00까지"
      }
    ]
  }
];

export const scheduleTablePages = [
  {
    "page": 1,
    "columnKeys": [
      "university",
      "admissionType",
      "application",
      "essay",
      "recommendation",
      "documents",
      "firstResult",
      "interview",
      "finalResult",
      "additionalResult"
    ],
    "columns": [
      {
        "key": "university",
        "label": "대학"
      },
      {
        "key": "admissionType",
        "label": "입학전형"
      },
      {
        "key": "application",
        "label": "지원서 접수"
      },
      {
        "key": "essay",
        "label": "자소서 입력"
      },
      {
        "key": "recommendation",
        "label": "추천서 입력"
      },
      {
        "key": "documents",
        "label": "서류 제출"
      },
      {
        "key": "firstResult",
        "label": "1차 발표"
      },
      {
        "key": "interview",
        "label": "면접 및 구술"
      },
      {
        "key": "finalResult",
        "label": "합격자 발표"
      },
      {
        "key": "additionalResult",
        "label": "충원 합격자 발표"
      }
    ],
    "rows": [
      {
        "id": "page-1-row-1",
        "universityId": "snu",
        "university": "서울대",
        "cells": {
          "university": {
            "text": "서울대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "일반전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.9(수)\n18:00",
            "rowSpan": 2
          },
          "essay": {
            "text": "",
            "rowSpan": 2
          },
          "recommendation": {
            "text": "",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.7(월)~9.10(목)\n18:00",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "11.20(금)\n18:00",
            "rowSpan": 2
          },
          "interview": {
            "text": "11.27(금)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 18:00",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.24(목),12.28(월)\n14:00",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-1-row-2",
        "universityId": "snu",
        "university": "서울대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "기회균형",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": null,
          "interview": {
            "text": "12.4(금)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-3",
        "universityId": "kaist",
        "university": "KAIST",
        "cells": {
          "university": {
            "text": "KAIST",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "창의도전전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.1(화)~9.9(수)\n18:00",
            "rowSpan": 2
          },
          "essay": {
            "text": "9.1(화)~9.9(수)\n18:00",
            "rowSpan": 2
          },
          "recommendation": {
            "text": "9.10(목)~9.18(금)\n18:00",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.1(화)~9.9(수)\n18:00",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "10.12(월) 10:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "최종합격자 추가서류\n제출\n2027.1.12.(화)~1.15(금)",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-1-row-4",
        "universityId": "kaist",
        "university": "KAIST",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "일반전형/\n고른기회/특기자/\n반도체시스템",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "11.11(수)\n10:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.26(목)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 10:00",
            "rowSpan": 1
          },
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-5",
        "universityId": "postech",
        "university": "POSTECH",
        "cells": {
          "university": {
            "text": "POSTECH",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "일반전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.9(수)\n18:00",
            "rowSpan": 1
          },
          "essay": {
            "text": "",
            "rowSpan": 1
          },
          "recommendation": {
            "text": "",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.1(화)~9.11(금)\n우편 소인 유효",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.20(금)\n10:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.28(토)\n11.29(일)\n반도체",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 10:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-1-row-6",
        "universityId": "gist",
        "university": "GIST",
        "cells": {
          "university": {
            "text": "GIST",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "일반전형/\n고른/특기자전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.11(금)\n18:00",
            "rowSpan": 1
          },
          "essay": {
            "text": "9.7(월)~9.11(금)\n18:00",
            "rowSpan": 1
          },
          "recommendation": {
            "text": "9.7(월)~9.11(금)\n18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.7(월)~9.11(금)\n18:00 소인 유효",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "10.15(목)\n18:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "10.22(목)~\n10.23(금)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 18:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-1-row-7",
        "universityId": "unist",
        "university": "UNIST",
        "cells": {
          "university": {
            "text": "UNIST",
            "rowSpan": 3
          },
          "admissionType": {
            "text": "일반전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.3(목)~9.10(목)\n18:00",
            "rowSpan": 3
          },
          "essay": {
            "text": "9.3(목)~9.11(금)\n18:00",
            "rowSpan": 3
          },
          "recommendation": {
            "text": "",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.3(목)~9.11(금)\n18:00 온라인(PDF\n스캔본)",
            "rowSpan": 3
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 이전",
            "rowSpan": 3
          },
          "additionalResult": {
            "text": "~12.29(화) 18:00",
            "rowSpan": 3
          }
        }
      },
      {
        "id": "page-1-row-8",
        "universityId": "unist",
        "university": "UNIST",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "탐구우수전형",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "11.4(수)",
            "rowSpan": 2
          },
          "interview": {
            "text": "11.7(토)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-9",
        "universityId": "unist",
        "university": "UNIST",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "그릿인재전형",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": {
            "text": "9.3(목)~9.11(금)\n18:00",
            "rowSpan": 1
          },
          "documents": null,
          "firstResult": null,
          "interview": {
            "text": "11.8(일)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-10",
        "universityId": "dgist",
        "university": "DGIST",
        "cells": {
          "university": {
            "text": "DGIST",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "일반전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.3(목)~9.10(목)\n18:00",
            "rowSpan": 2
          },
          "essay": {
            "text": "9.3(목)~9.10(목)\n18:00",
            "rowSpan": 2
          },
          "recommendation": {
            "text": "9.3(목)~9.16(수)\n18:00 학교장추천",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.4(목)~9.10(목)\n18:00\n온라인(고른)",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-1-row-11",
        "universityId": "dgist",
        "university": "DGIST",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "과학인재전형",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "11.10(월)\n14:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.25(수)~\n11.27(금)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-12",
        "universityId": "kentech",
        "university": "KENTECH",
        "cells": {
          "university": {
            "text": "KENTECH",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.11(금)\n18:00",
            "rowSpan": 1
          },
          "essay": {
            "text": "",
            "rowSpan": 1
          },
          "recommendation": {
            "text": "",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.7(월)~9.14(월)\n18:00 소인 유효",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.20(금)\n18:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.30.(월)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.11(금) 18:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목), 12.26(토)\n10:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-1-row-13",
        "universityId": "yonsei",
        "university": "연세대",
        "cells": {
          "university": {
            "text": "연세대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "논술전형,\n기회균형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.9(수)\n17:00",
            "rowSpan": 2
          },
          "essay": {
            "text": "",
            "rowSpan": 2
          },
          "recommendation": {
            "text": "",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.7(월)~9.9(수)\n17:00",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "기:10.26.(월)",
            "rowSpan": 1
          },
          "interview": {
            "text": "논술:10.10(토)\n기균:10.31(토)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.23(수)~12.29(화)\n~14:00\n12.25(금) 제외",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-1-row-14",
        "universityId": "yonsei",
        "university": "연세대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "활동우수형(자연)",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "11.16(월)",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.22(일)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-15",
        "universityId": "korea",
        "university": "고려대",
        "cells": {
          "university": {
            "text": "고려대",
            "rowSpan": 3
          },
          "admissionType": {
            "text": "계열적합전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.9(수)\n17:00",
            "rowSpan": 3
          },
          "essay": {
            "text": "",
            "rowSpan": 3
          },
          "recommendation": {
            "text": "",
            "rowSpan": 3
          },
          "documents": {
            "text": "9.7(월)~9.9(수)\n18:00\n9.10(목) 소인\n유효",
            "rowSpan": 3
          },
          "firstResult": {
            "text": "10.30(금)\n17:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.8(일)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 17:00",
            "rowSpan": 3
          },
          "additionalResult": {
            "text": "12.23(수)~12.29(화)\n~14:00\n12.24~25 제외",
            "rowSpan": 3
          }
        }
      },
      {
        "id": "page-1-row-16",
        "universityId": "korea",
        "university": "고려대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "고른기회",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "10.23 (금)\n17:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "10.31(토)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-17",
        "universityId": "korea",
        "university": "고려대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "논술",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "11.17(화)\n17:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "자연 11.21(토)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-18",
        "universityId": "sungkyunkwan",
        "university": "성균관대",
        "cells": {
          "university": {
            "text": "성균관대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "학생부종합(융합\n인재, 탐구인재)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금)\n18:00",
            "rowSpan": 2
          },
          "essay": {
            "text": "",
            "rowSpan": 2
          },
          "recommendation": {
            "text": "",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.8(화)~9.12(토)\n14:00",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 이전",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-1-row-19",
        "universityId": "sungkyunkwan",
        "university": "성균관대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "학생부종합\n(과학인재)",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "10.27(화)",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.1(일)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-1-row-20",
        "universityId": "hanyang",
        "university": "한양대",
        "cells": {
          "university": {
            "text": "한양대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "학생부종합\n(면접형)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금)\n18:00",
            "rowSpan": 2
          },
          "essay": {
            "text": "",
            "rowSpan": 2
          },
          "recommendation": {
            "text": "",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.8(화)~9.14(토)\n온라인 pdf",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "11.13.(금)",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.22.(일)\n의대 12.5(토)\n사범 12.6(일)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-1-row-21",
        "universityId": "hanyang",
        "university": "한양대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "논술전형",
            "rowSpan": 1
          },
          "application": null,
          "essay": null,
          "recommendation": null,
          "documents": null,
          "firstResult": {
            "text": "",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.29(일)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      }
    ]
  },
  {
    "page": 2,
    "columnKeys": [
      "university",
      "admissionType",
      "application",
      "documents",
      "firstResult",
      "interview",
      "finalResult",
      "additionalResult"
    ],
    "columns": [
      {
        "key": "university",
        "label": "대학"
      },
      {
        "key": "admissionType",
        "label": "입학전형"
      },
      {
        "key": "application",
        "label": "지원서 접수"
      },
      {
        "key": "documents",
        "label": "서류 제출"
      },
      {
        "key": "firstResult",
        "label": "1차 발표"
      },
      {
        "key": "interview",
        "label": "면접 및 구술"
      },
      {
        "key": "finalResult",
        "label": "합격자 발표"
      },
      {
        "key": "additionalResult",
        "label": "충원 합격자 발표"
      }
    ],
    "rows": [
      {
        "id": "page-2-row-1",
        "universityId": "sogang",
        "university": "서강대",
        "cells": {
          "university": {
            "text": "서강대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.8(화)~9.15(화) 18:00\n온라인 pdf",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 17:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-2",
        "universityId": "ewha",
        "university": "이화여대",
        "cells": {
          "university": {
            "text": "이화여대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "미래인재전형(서류형)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.10(목) 17:00",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.8(화)~9.11(목) 17:00",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.17(목)",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "~12.29(화)18:00",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-2-row-3",
        "universityId": "ewha",
        "university": "이화여대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "미래인재전형(면접형)",
            "rowSpan": 1
          },
          "application": null,
          "documents": null,
          "firstResult": {
            "text": "11.12(목)",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.22(일)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.3(목)",
            "rowSpan": 1
          },
          "additionalResult": null
        }
      },
      {
        "id": "page-2-row-4",
        "universityId": "chung-ang",
        "university": "중앙대",
        "cells": {
          "university": {
            "text": "중앙대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "학생부종합(융합형)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금) 18:00",
            "rowSpan": 2
          },
          "documents": {
            "text": "9.8(화)~9.15(화) 16:00",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 14:00",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-2-row-5",
        "universityId": "chung-ang",
        "university": "중앙대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "학생부종합(탐구형)",
            "rowSpan": 1
          },
          "application": null,
          "documents": null,
          "firstResult": {
            "text": "11.26(목) 14:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "12.5(토)~6(일)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-2-row-6",
        "universityId": "kyung-hee",
        "university": "경희대",
        "cells": {
          "university": {
            "text": "경희대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합(네오르네상스)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.8(화)~9.15(화) 17:00",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.25.(수) 18:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "12.5(토)~6(일)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "~12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-7",
        "universityId": "uos",
        "university": "서울시립대",
        "cells": {
          "university": {
            "text": "서울시립대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합전형Ⅰ(면접형)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.10(목) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.7(월)~9.11(금) 소인\n유효",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.20(금)",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.29(일)\n논술 10.3(토)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.28(월)",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-8",
        "universityId": "konkuk",
        "university": "건국대",
        "cells": {
          "university": {
            "text": "건국대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합(KU자기추천)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.8(화)~9.15(화) 17:00",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.20(금)",
            "rowSpan": 1
          },
          "interview": {
            "text": "12.5(토)~6(일)\n논술 11.21(토)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-9",
        "universityId": "dongguk",
        "university": "동국대",
        "cells": {
          "university": {
            "text": "동국대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합(Do Dream)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.9(수)~9.11(금) 17:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.9(수)~9.14(월) 소인\n유효",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.13.(금)",
            "rowSpan": 1
          },
          "interview": {
            "text": "12.11(금)~12.13(일)\n논술 11.22(일)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "~12.29(화)",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-10",
        "universityId": "seoultech",
        "university": "서울과기대",
        "cells": {
          "university": {
            "text": "서울과기대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합(학교생활우수자)\n학생부종합(창의융합인재)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.7(월)~9.17(목) 17:00",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.20(금) 14:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "학우, 창융\n11.28.(토)\n기균 11.29(일)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 14:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-11",
        "universityId": "kookmin",
        "university": "국민대",
        "cells": {
          "university": {
            "text": "국민대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부 종합(국민프런티어)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "~9.15(화) 18:00",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.17.(화) 14:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.21.(토)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 17:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-12",
        "universityId": "sejong",
        "university": "세종대",
        "cells": {
          "university": {
            "text": "세종대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합(세종인재\n전형(면접형))",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.8(화)~9.14(월) 18:00",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "11.13(금)",
            "rowSpan": 1
          },
          "interview": {
            "text": "11.21.(토)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 17:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화) 18:00",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-13",
        "universityId": "ajou",
        "university": "아주대",
        "cells": {
          "university": {
            "text": "아주대",
            "rowSpan": 2
          },
          "admissionType": {
            "text": "ACE전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.11(금) 18:00",
            "rowSpan": 2
          },
          "documents": {
            "text": "~9.15(화) 소인 유효",
            "rowSpan": 2
          },
          "firstResult": {
            "text": "11.17(화)",
            "rowSpan": 2
          },
          "interview": {
            "text": "11.22(일)\n공대, 첨단ICT\n11.28(토)\n소프트웨어, 자연대",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금)",
            "rowSpan": 2
          },
          "additionalResult": {
            "text": "12.24(목)~\n12.29(화)",
            "rowSpan": 2
          }
        }
      },
      {
        "id": "page-2-row-14",
        "universityId": "ajou",
        "university": "아주대",
        "cells": {
          "university": null,
          "admissionType": {
            "text": "첨단융합인재전형",
            "rowSpan": 1
          },
          "application": null,
          "documents": null,
          "firstResult": null,
          "interview": {
            "text": "11.21(토)",
            "rowSpan": 1
          },
          "finalResult": null,
          "additionalResult": null
        }
      },
      {
        "id": "page-2-row-15",
        "universityId": "pusan",
        "university": "부산대",
        "cells": {
          "university": {
            "text": "부산대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "지역인재전형",
            "rowSpan": 1
          },
          "application": {
            "text": "9.8(화)~9.11(금) 17:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.8(화)~9.14(월)",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "12.1(화) 16:00",
            "rowSpan": 1
          },
          "interview": {
            "text": "12.5(토)",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 16:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목),\n12.27(일),\n12.29(화)\n18:00까지",
            "rowSpan": 1
          }
        }
      },
      {
        "id": "page-2-row-16",
        "universityId": "kyungpook",
        "university": "경북대",
        "cells": {
          "university": {
            "text": "경북대",
            "rowSpan": 1
          },
          "admissionType": {
            "text": "학생부종합(일반학생전형)",
            "rowSpan": 1
          },
          "application": {
            "text": "9.7(월)~9.11(금) 18:00",
            "rowSpan": 1
          },
          "documents": {
            "text": "9.7(월)~9.16(수) 18:00",
            "rowSpan": 1
          },
          "firstResult": {
            "text": "X",
            "rowSpan": 1
          },
          "interview": {
            "text": "X",
            "rowSpan": 1
          },
          "finalResult": {
            "text": "12.18(금) 16:00",
            "rowSpan": 1
          },
          "additionalResult": {
            "text": "12.24(목),\n12.27(일),\n12.29(화)\n18:00까지",
            "rowSpan": 1
          }
        }
      }
    ]
  }
] as const;
