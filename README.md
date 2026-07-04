# FieldNotes V1.1

기술 블로그 프로젝트

# Features
- 게시물, 카테고리, 태그, 이미지 CRUD
- 관리자 계정 (사용자 기능 미정)
- 마크다운 에디터, 뷰어

# Tech Stack
- 언어: typescript, Golang
- 프레임워크: vite, react.js
- 데이터베이스: PostgreSQL
- 인증: JWT Bearer 기반

# Architecture
- SPA
- RESTful API 기반

# Launch
## Docker / Docker Compose 설치
### Linux
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```
### macOS
```bash
# 설치 후 Docker Desktop 앱을 한 번 실행해줘야 CLI(`docker`, `docker compose`)가 활성화됩니다.
brew install --cask docker
```
## 컨테이너 실행
```bash
git clone https://github.com/kmj36/fieldnotes-tech-blog.git
cd fieldnotes-tech-blog/infra/env
cp .env.example .env.prod # 환경변수 작성
cd ../scripts
./docker_prod_up.sh
```

# Environment Variables
 
| 변수명 | 설명 | 예시 |
| --- | --- | --- |
| VITE_APP_NAME | 앱 표시 이름 | Fieldnotes |
| VITE_MODE | 빌드 모드 | production |
| VITE_API_BASE_URL | 백엔드 API 베이스 URL | https://blog.minjekim.dev |
| API_MODE | Gin 실행 모드 | release |
| API_ALLOW_ORIGINS | CORS 허용 오리진 | https://blog.minjekim.dev |
| API_ADDR | 서버 바인딩 주소 | 0.0.0.0 |
| API_PORT | 서버 포트 | 8080 |
| API_JWT_SECRET | JWT 서명 시크릿 키 | (임의의 긴 랜덤 문자열) |
| API_JWT_EXPIRE | JWT 만료 시간 | 24h |
| API_LOG_LEVEL | 로그 레벨 | info |
| DB_SCHEME | DB 접속 스킴 | postgres |
| DB_DOCKER_HOST | Docker 네트워크 내부 DB 호스트명 | db |
| DB_HOST | DB 호스트 (로컬 개발용) | localhost |
| DB_PORT | DB 포트 | 5432 |
| DB_DATABASE | DB 이름 | fieldnotes |
| DB_USER | DB 유저 | app |
| DB_PASSWORD | DB 비밀번호 | secret |
| DB_SSLMODE | SSL 연결 모드 | disable |
| DB_TIMEZONE | DB 타임존 | Asia/Seoul |
 


# API Specs
- Swagger URL
```bash
http://localhost:18080/
```