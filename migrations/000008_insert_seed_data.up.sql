-- =====================
-- categories
-- =====================

-- 1단계
INSERT INTO categories (parent_id, path, name, slug) 
VALUES 
  (NULL, '/tech', '기술', 'tech'), 
  (NULL, '/life', '일상', 'life'), 
  (NULL, '/review', '리뷰', 'review');

-- 2단계
INSERT INTO categories (parent_id, path, name, slug) 
SELECT id, '/tech/frontend', '프론트엔드', 'frontend' FROM categories WHERE slug = 'tech';

INSERT INTO categories (parent_id, path, name, slug) 
SELECT id, '/tech/backend', '백엔드', 'backend' FROM categories WHERE slug = 'tech';

INSERT INTO categories (parent_id, path, name, slug) 
SELECT id, '/tech/devops', 'DevOps', 'devops' FROM categories WHERE slug = 'tech';

INSERT INTO categories (parent_id, path, name, slug) 
SELECT id, '/life/travel', '여행', 'travel' FROM categories WHERE slug = 'life';

INSERT INTO categories (parent_id, path, name, slug) 
SELECT id, '/review/book', '도서', 'book' FROM categories WHERE slug = 'review';

INSERT INTO categories (parent_id, path, name, slug) 
SELECT id, '/review/product', '제품', 'product' FROM categories WHERE slug = 'review';

-- 3단계
INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/frontend/react', 'React', 'react' FROM categories WHERE slug = 'frontend';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/frontend/nextjs', 'Next.js', 'nextjs' FROM categories WHERE slug = 'frontend';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/frontend/vue', 'Vue', 'vue' FROM categories WHERE slug = 'frontend';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/backend/go', 'Go', 'go' FROM categories WHERE slug = 'backend';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/backend/python', 'Python', 'python' FROM categories WHERE slug = 'backend';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/backend/java', 'Java', 'java' FROM categories WHERE slug = 'backend';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/devops/docker', 'Docker', 'docker' FROM categories WHERE slug = 'devops';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/devops/kubernetes', 'Kubernetes', 'kubernetes' FROM categories WHERE slug = 'devops';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/life/travel/domestic', '국내여행', 'domestic' FROM categories WHERE slug = 'travel';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/life/travel/overseas', '해외여행', 'overseas' FROM categories WHERE slug = 'travel';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/review/book/tech', '기술서적', 'tech-book' FROM categories WHERE slug = 'book';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/review/book/essay', '에세이', 'essay' FROM categories WHERE slug = 'book';

-- 4단계
INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/frontend/react/hooks', 'React Hooks', 'hooks' FROM categories WHERE slug = 'react';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/frontend/react/state', '상태관리', 'state' FROM categories WHERE slug = 'react';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/frontend/nextjs/app-router', 'App Router', 'app-router' FROM categories WHERE slug = 'nextjs';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/backend/go/gin', 'Gin', 'gin' FROM categories WHERE slug = 'go';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/backend/go/gorm', 'GORM', 'gorm' FROM categories WHERE slug = 'go';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/backend/python/fastapi', 'FastAPI', 'fastapi' FROM categories WHERE slug = 'python';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/tech/devops/docker/compose', 'Docker Compose', 'compose' FROM categories WHERE slug = 'docker';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/life/travel/overseas/japan', '일본', 'japan' FROM categories WHERE slug = 'overseas';

INSERT INTO categories (parent_id, path, name, slug)
SELECT id, '/life/travel/overseas/europe', '유럽', 'europe' FROM categories WHERE slug = 'overseas';

-- =====================
-- tags
-- =====================
INSERT INTO tags (name, slug) 
VALUES 
  ('JavaScript', 'javascript'), 
  ('TypeScript', 'typescript'), 
  ('React', 'react'), 
  ('Next.js', 'nextjs'), 
  ('Node.js', 'nodejs'), 
  ('PostgreSQL', 'postgresql'), 
  ('Docker', 'docker'), 
  ('Kubernetes', 'kubernetes'), 
  ('독서', 'reading'), 
  ('여행기', 'travel-log'),
  ('Go', 'go'),
  ('Python', 'python'),
  ('Vue', 'vue'),
  ('FastAPI', 'fastapi'),
  ('GORM', 'gorm');

-- =====================
-- accounts
-- =====================
INSERT INTO accounts (account_id, password_hash, nickname, avatar_url, role, status) 
VALUES 
  ('alice', '$2b$12$hashedpassword2', '앨리스', 'https://api.dicebear.com/7.x/identicon/svg?seed=alice', 'USER', 'ACTIVE'), 
  ('bob', '$2b$12$hashedpassword3', '밥', 'https://api.dicebear.com/7.x/identicon/svg?seed=bob', 'USER', 'ACTIVE'), 
  ('charlie', '$2b$12$hashedpassword4', '찰리', 'https://api.dicebear.com/7.x/identicon/svg?seed=charlie', 'USER', 'ACTIVE'), 
  ('dave', '$2b$12$hashedpassword5', '데이브', 'https://api.dicebear.com/7.x/identicon/svg?seed=dave', 'USER', 'SUSPENDED');

-- =====================
-- posts
-- =====================
INSERT INTO posts (account_id, slug, title, content, thumbnail, category_id, published_at, is_private) 
VALUES 
  (
    'alice', 'react-18-concurrent', 'React 18 동시성 렌더링 완전 정리',
    'React 18에서 도입된 동시성 렌더링(Concurrent Rendering)은 ...',
    'https://picsum.photos/seed/react18/800/400',
    (SELECT id FROM categories WHERE path = '/tech/frontend/react'),
    NOW() - INTERVAL '10 days', FALSE
  ), 
  (
    'alice', 'react-hooks-deep-dive', 'React Hooks 완벽 가이드',
    'useState, useEffect, useCallback 등 훅을 깊게 파헤칩니다 ...',
    'https://picsum.photos/seed/hooks/800/400',
    (SELECT id FROM categories WHERE path = '/tech/frontend/react/hooks'),
    NOW() - INTERVAL '9 days', FALSE
  ),
  (
    'alice', 'nextjs-app-router', 'Next.js App Router 마이그레이션 후기',
    'Pages Router에서 App Router로 전환하면서 겪은 이슈들을 공유합니다 ...',
    'https://picsum.photos/seed/nextjs/800/400',
    (SELECT id FROM categories WHERE path = '/tech/frontend/nextjs/app-router'),
    NOW() - INTERVAL '7 days', FALSE
  ), 
  (
    'bob', 'postgresql-index-tuning', 'PostgreSQL 인덱스 튜닝 실전 가이드',
    'EXPLAIN ANALYZE를 활용한 쿼리 최적화 방법을 소개합니다 ...',
    'https://picsum.photos/seed/postgres/800/400',
    (SELECT id FROM categories WHERE path = '/tech/backend/go/gorm'),
    NOW() - INTERVAL '5 days', FALSE
  ), 
  (
    'bob', 'gin-framework-intro', 'Go Gin 프레임워크 입문',
    'Go 언어로 REST API를 빠르게 개발하는 방법을 알아봅니다 ...',
    'https://picsum.photos/seed/gin/800/400',
    (SELECT id FROM categories WHERE path = '/tech/backend/go/gin'),
    NOW() - INTERVAL '4 days', FALSE
  ),
  (
    'bob', 'docker-compose-best-practice', 'Docker Compose 실무 베스트 프랙티스',
    '멀티 컨테이너 환경을 효율적으로 관리하는 방법 ...',
    'https://picsum.photos/seed/docker/800/400',
    (SELECT id FROM categories WHERE path = '/tech/devops/docker/compose'),
    NOW() - INTERVAL '3 days', FALSE
  ), 
  (
    'charlie', 'fastapi-tutorial', 'FastAPI로 빠르게 API 서버 만들기',
    'Python FastAPI를 활용한 고성능 API 서버 구축 방법 ...',
    'https://picsum.photos/seed/fastapi/800/400',
    (SELECT id FROM categories WHERE path = '/tech/backend/python/fastapi'),
    NOW() - INTERVAL '6 days', FALSE
  ),
  (
    'charlie', 'japan-travel-2024', '2024 일본 여행기 - 도쿄편',
    '3박 4일 도쿄 여행을 다녀왔습니다. 숙소, 맛집, 관광지 정리 ...',
    'https://picsum.photos/seed/japan/800/400',
    (SELECT id FROM categories WHERE path = '/life/travel/overseas/japan'),
    NOW() - INTERVAL '2 days', FALSE
  ), 
  (
    'charlie', 'book-review-clean-code', '클린 코드 다시 읽기',
    '로버트 마틴의 클린 코드를 3년 만에 다시 읽고 느낀 점 ...',
    'https://picsum.photos/seed/cleancode/800/400',
    (SELECT id FROM categories WHERE path = '/review/book/tech'),
    NOW() - INTERVAL '1 days', FALSE
  ), 
  (
    'alice', 'typescript-private-draft', 'TypeScript 5.x 새 기능 정리 (초안)',
    '아직 작성 중인 포스트입니다 ...',
    NULL,
    (SELECT id FROM categories WHERE path = '/tech/frontend/react/state'),
    NULL, TRUE
  );

-- =====================
-- posts_tags
-- =====================
INSERT INTO posts_tags (post_id, tag_id) VALUES 
  ((SELECT id FROM posts WHERE slug = 'react-18-concurrent'), (SELECT id FROM tags WHERE slug = 'react')),
  ((SELECT id FROM posts WHERE slug = 'react-18-concurrent'), (SELECT id FROM tags WHERE slug = 'javascript')),
  ((SELECT id FROM posts WHERE slug = 'react-18-concurrent'), (SELECT id FROM tags WHERE slug = 'typescript')),
  ((SELECT id FROM posts WHERE slug = 'react-hooks-deep-dive'), (SELECT id FROM tags WHERE slug = 'react')),
  ((SELECT id FROM posts WHERE slug = 'react-hooks-deep-dive'), (SELECT id FROM tags WHERE slug = 'javascript')),
  ((SELECT id FROM posts WHERE slug = 'nextjs-app-router'), (SELECT id FROM tags WHERE slug = 'nextjs')),
  ((SELECT id FROM posts WHERE slug = 'nextjs-app-router'), (SELECT id FROM tags WHERE slug = 'react')),
  ((SELECT id FROM posts WHERE slug = 'nextjs-app-router'), (SELECT id FROM tags WHERE slug = 'typescript')),
  ((SELECT id FROM posts WHERE slug = 'postgresql-index-tuning'), (SELECT id FROM tags WHERE slug = 'postgresql')),
  ((SELECT id FROM posts WHERE slug = 'postgresql-index-tuning'), (SELECT id FROM tags WHERE slug = 'go')),
  ((SELECT id FROM posts WHERE slug = 'gin-framework-intro'), (SELECT id FROM tags WHERE slug = 'go')),
  ((SELECT id FROM posts WHERE slug = 'docker-compose-best-practice'), (SELECT id FROM tags WHERE slug = 'docker')),
  ((SELECT id FROM posts WHERE slug = 'docker-compose-best-practice'), (SELECT id FROM tags WHERE slug = 'kubernetes')),
  ((SELECT id FROM posts WHERE slug = 'fastapi-tutorial'), (SELECT id FROM tags WHERE slug = 'python')),
  ((SELECT id FROM posts WHERE slug = 'fastapi-tutorial'), (SELECT id FROM tags WHERE slug = 'fastapi')),
  ((SELECT id FROM posts WHERE slug = 'japan-travel-2024'), (SELECT id FROM tags WHERE slug = 'travel-log')),
  ((SELECT id FROM posts WHERE slug = 'book-review-clean-code'), (SELECT id FROM tags WHERE slug = 'reading')),
  ((SELECT id FROM posts WHERE slug = 'typescript-private-draft'), (SELECT id FROM tags WHERE slug = 'typescript'));