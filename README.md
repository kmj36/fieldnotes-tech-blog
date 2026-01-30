# Tech-Blog-FieldNotes-

기술 블로그 프로젝트 서버

- 블로그 기능을 제공하는 서비스로 **프론트/백엔드/DB** 로 구성된 애플리케이션입니다.
- 운영에 필요한 기본적인 CRUD 를 제공합니다.

# Features
- 게시물 CRUD
- 관리자 계정 CRUD
- 카테고리 CRUD
- 태그 CRUD

# Tech Stack
- 언어: javascript, Golang
- 프레임워크: React.js
- 데이터베이스: PostgreSQL
- 인증: JWT

# Architecture
- Layered Architectrue (Presentation / Application / Data)
- RESTful API 기반
- Stateless 서버 구조

# Launch
- Docker / Docker Compose
- PostgreSQL (또는 dockerImage: postgres 사용)

```bash
git clone https://github.com/kmj36/Tech-Blog-FieldNotes-.git
cd FieldNotes
cp .env.example .env
docker-compose up -d
```

# Environment Variables
| 변수명 | 설명 | 예시 |
| --- | --- | --- |
| DB_URL | DB 주소 | jdbc:postgresql://localhost:5432/app |
| DB_USER | DB 유저 | app |
| DB_PASSWORD | DB 비밀번호 | secret |
| JWT_SECRET | JWT 시크릿 키 | xxxx | 
