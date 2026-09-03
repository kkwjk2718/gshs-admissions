# 2027 수시 일정

2027학년도 대입 수시모집 일정을 마감이 가까운 순서로 보는 웹앱. `gshs.app` 서브도메인에 올려 쓴다.

대학 24곳 · 일정 176건 · 전형 37개 (2026-09-01 ~ 2027-01-15).

## 화면

| 경로 | 이름 | 하는 일 |
| --- | --- | --- |
| `/` | 달력 | 월간 격자. 종이 달력과 같은 방식으로 접는다 — 같은 종류를 한 줄로 묶고 그 아래에 시각별 대학 목록. |
| `/deadlines` | 남은 일정 | 마감일로 묶은 목록. 오늘 이후 마감만, 가까운 순. 진행 중인 일정도 함께 나온다. |
| `/schedule` | 전형표 | 원본 PDF의 대학×전형 표. 데스크톱은 표, 폰은 카드. |

달력 칸은 이렇게 접힌다. 일정 하나에 칩 하나를 그리면 9월 11일 한 칸에 24개가 쌓이지만,
이렇게 접으면 네 줄로 끝난다.

```
9
원서 마감
  17:00 고려대·연세대
  18:00 KAIST·POSTECH·서울대
자소서 마감
  18:00 KAIST
접수 시작
  동국대
```

왼쪽 세로선이 실선이면 마감·발표·면접, 점선이면 시작이다. 폰에서는 칸이 좁아 점으로만
표시하고(빈 점 = 시작) 내용은 아래 목록에서 읽는다.

세 화면 모두 위쪽 `내 대학 N곳` 버튼 하나로 필터를 공유한다. 버튼 라벨이 곧 필터 상태라
"24곳 중 몇 곳만 보고 있는 줄 몰랐다"가 생기지 않는다.

## 실행

```bash
npm ci
npm run dev
```

```bash
npm run build
```

## Docker

```bash
docker compose up -d --build
```

기본 주소는 `http://127.0.0.1:8080`. 리버스 프록시 설정은 [DEPLOYMENT.md](./DEPLOYMENT.md)에 있다.

## 데이터

원자료는 「2027학년도 대입수시모집 전형일정」과 「2027 대학입시 관련 달력」 PDF다.
`src/data/generate_admissions_data.py`가 PDF를 읽어 두 파일을 만든다.

| 파일 | 용도 |
| --- | --- |
| `public/data/admissions.json` | **앱이 읽는 유일한 데이터.** 일정 176건 + 대학·카테고리 메타 + 전형표까지 한 파일에 들어 있다. |
| `public/data/admissions.ics` | 캘린더 구독용 (`webcal://<호스트>/data/admissions.ics`). |

```bash
python src/data/generate_admissions_data.py
```

`admissions.json`의 이벤트 한 건은 이렇게 생겼다. 앱은 여기 있는 값만 쓰고, 없는 값을 만들어내지 않는다.

```jsonc
{
  "universityId": "kaist",
  "university": "KAIST",
  "categoryId": "application",        // 8종. 화면의 일정 종류가 이 값이다
  "admissionDetail": "창의도전전형, 일반전형/ 고른기회/특기자/ 반도체시스템",
  "startDate": "2026-09-01",
  "deadlineDate": "2026-09-09",       // 목록 정렬·D-day 기준
  "isDateRange": true,
  "timeLabels": ["18:00"],            // 없으면 빈 배열. 임의로 채우지 않는다
  "excludedDates": [],
  "rawSchedule": "9.1(화)~9.9(수) 18:00"  // 원본 표기. 상세에 그대로 보여준다
}
```

일정 종류 8종 — `application` 원서 접수 / `essay` 자소서 입력 / `recommendation` 추천서 입력 /
`documents` 서류 제출 / `first-result` 1차 합격 발표 / `interview` 면접 /
`final-result` 최종 합격 발표 / `additional-result` 추가 합격 발표(추합).

대학별 모집요강 링크는 `src/data/admissionGuides.ts`에 손으로 관리한다. 확인일(`verifiedAt`)을
화면에 같이 노출하므로 링크를 고칠 때 날짜도 함께 고칠 것.

## 저장되는 것

브라우저 `localStorage`만 쓴다. 서버에는 아무것도 보내지 않는다.

- `gshs-admissions:preferences:v3` — 고른 대학과 일정 종류
- `gshs-admissions:dataset:v1` — 마지막으로 받은 일정 데이터 (네트워크가 끊겼을 때 보여주는 사본)

일정을 완료 처리하는 체크박스는 **일부러 넣지 않았다.** 실제로는 안 냈는데 앱이 냈다고
표시하면, 마감 관리 도구로서 아무것도 안 하는 것보다 나쁘다.

## 설계 기록

무엇을 왜 이렇게 바꿨는지는 [design/FIDELITY.md](./design/FIDELITY.md)에 적어두었다.
