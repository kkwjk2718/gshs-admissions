# GSHS 2027 입시 일정

2027학년도 대학입시 일정 달력과 수시모집 전형일정표입니다.

## 실행

```bash
npm ci
npm run dev
```

## 빌드

```bash
npm run build
```

## Docker

```bash
docker compose up -d --build
```

기본 주소는 `http://127.0.0.1:8080`입니다. 리버스 프록시 설정은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 확인하세요.

## 데이터

- 달력: `public/data/admissions.ics`
- 전형일정표: `src/data/scheduleTable.ts`
- 대학별 모집요강: `src/data/admissionGuides.ts`

관심 대학 설정은 브라우저 `localStorage`에만 저장됩니다.
