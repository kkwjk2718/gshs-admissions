# 2027 입시 일정 검증 보고서 반영

사용자 제공 2026-09-06 보고서(`audit-report-2026-09-06.md`)를 구현 근거로 사용했다. 이후 대학 공지 전체를 재검증했다는 의미가 아니다.

## 재생성

`python src/data/generate_admissions_data.py --apply-overrides`

기존 UNIST 보정 다음 `audit_2027.apply`가 서울권 6개, 이공계 6개, 나머지 12개 대학 모듈을 실행한다. 재실행 동등성과 기존 논리 일정 UID 보존을 테스트한다. 구 PDF 재수입 대신 보정 명령을 사용한다.

- 24개 대학, 44개 표 행, 309개 정규화 일정. 신규 절차/예외/차수 분리로 수가 증가했으며 오류 수가 아니다.
- 논술고사, 고사장 안내, 2단계 전형료, 등록 프로그램 분류 추가. 최초/충원 등록 및 보고서에서 확인된 등록금 일정을 등록 분류에 포함.
- DGIST 근거 미확보 날짜는 기존 값과 미확인 표시 유지. 건국대 교육청 제공 공식본/후속 공지 한계, KAIST 후속 공지 한계 보존.
- 공개/다운로드 ICS는 종일 일정 유지. 시간·예외 조건은 설명과 제목에 보존. 제외일은 실제 날짜 구간을 분할한다. 다운로드 알림은 정확한 시각 트리거가 아닌 사전/당일 확인용이며 문구에 이전·이후·예정을 보존한다.
- 필터 v5 이전: v3의 전체 8종 또는 v4의 전체 9종만 새 전체 선택으로 확장. v4에서 등록을 해제한 8종은 사용자 선택 그대로 유지한다.

## 검증

- `npm test`: Python 32개, Node 25개 통과.
- `npm run build`: TypeScript/Vite 통과.
- 기존 월간 인쇄 브라우저 17사례 및 추가 2027년 2월 A4 1페이지 확인. 모바일 넘침/브라우저 실행 오류 없음.
- ICS 접힌 행 끝의 공백은 원문 보존을 위한 것으로 자동 제거하지 않는다.

## 운영 범위와 롤백

VM401 `/opt/gshs-admissions`, Compose project `gshs-admissions`의 `admissions` 서비스만 갱신한다. `ADMISSIONS_BIND=0.0.0.0 ADMISSIONS_PORT=8080` 유지. 메인 `gshsapp-web`은 변경하지 않는다.

배포 전 운영 source archive, 기존 이미지 태그, main container ID/start time, 기존 SHA/HTTP 응답을 백업한다. 배포 후 공개 JSON/ICS 바이트 및 JS/CSS 산출물 일치, healthz, main container 불변을 확인한다. 실패 시 백업 이미지 태그를 Compose 서비스 이미지로 복원하고 해당 서비스만 `up --no-build`한다.
