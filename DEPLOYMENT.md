# 배포 안내

이 프로젝트는 빌드된 Vite 앱을 Nginx로 제공한다. 특정 도메인이나 클라이언트 IP에 의존하지 않으므로 결정된 서브도메인을 그대로 리버스 프록시에 연결하면 된다.

## 빠른 실행

Docker와 Docker Compose 플러그인이 설치된 서버에서 다음 명령을 실행한다.

```bash
git clone <REPOSITORY_URL> gshs-admissions
cd gshs-admissions
docker compose up -d --build
```

기본값은 서버의 `127.0.0.1:8080`에만 바인딩된다. 상태 확인 주소는 다음과 같다.

```bash
curl --fail http://127.0.0.1:8080/healthz
docker compose ps
```

정상이라면 첫 번째 명령은 `ok`를 반환하고 컨테이너 상태는 `healthy`로 표시된다.

## 리버스 프록시 연결

DNS와 TLS 인증서를 준비한 뒤, 기존 Nginx의 해당 서브도메인 서버 블록에 아래 프록시 설정을 추가한다. `admissions.gshs.app` 부분은 최종 결정한 서브도메인으로 바꾼다.

```nginx
server {
    listen 443 ssl http2;
    server_name admissions.gshs.app;

    # 기존 서버의 TLS 인증서 설정을 사용한다.

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

이 서비스는 전달된 IP 헤더를 사용자 식별이나 설정 저장에 사용하지 않는다. 대학 선택 등의 개인 설정은 각 브라우저의 로컬 저장소에만 유지되므로 같은 학교 네트워크를 사용하는 학생끼리 섞이지 않는다.

리버스 프록시가 다른 호스트에 있다면 외부 인터페이스에 포트를 열어 실행할 수 있다. 방화벽에서 프록시 서버만 접근하도록 제한하는 것을 권장한다.

```bash
ADMISSIONS_BIND=0.0.0.0 docker compose up -d --build
```

포트를 바꾸려면 `ADMISSIONS_PORT`를 지정한다.

```bash
ADMISSIONS_PORT=18080 docker compose up -d --build
```

## 업데이트와 종료

```bash
git pull --ff-only
docker compose up -d --build
```

```bash
docker compose down
```

Vite가 생성한 `/assets/` 파일에는 1년 immutable 캐시가 적용되고, 새 배포를 즉시 반영해야 하는 `index.html`은 캐시하지 않는다. 앱 내부 경로로 바로 접속하거나 새로고침해도 `index.html`로 복구된다.
