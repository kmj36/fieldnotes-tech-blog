-- =====================
-- categories
-- =====================
INSERT INTO categories (parent_id, path, name, slug) 
VALUES 
  (NULL, '/tech', '기술', 'tech'), 
  (NULL, '/life', '일상', 'life'), 
  (NULL, '/review', '리뷰', 'review');
INSERT INTO categories (parent_id, path, name, slug) 
SELECT 
  id, 
  '/tech/frontend', 
  '프론트엔드', 
  'frontend' 
FROM 
  categories 
WHERE 
  slug = 'tech';
INSERT INTO categories (parent_id, path, name, slug) 
SELECT 
  id, 
  '/tech/backend', 
  '백엔드', 
  'backend' 
FROM 
  categories 
WHERE 
  slug = 'tech';
INSERT INTO categories (parent_id, path, name, slug) 
SELECT 
  id, 
  '/tech/devops', 
  'DevOps', 
  'devops' 
FROM 
  categories 
WHERE 
  slug = 'tech';
INSERT INTO categories (parent_id, path, name, slug) 
SELECT 
  id, 
  '/life/travel', 
  '여행', 
  'travel' 
FROM 
  categories 
WHERE 
  slug = 'life';
INSERT INTO categories (parent_id, path, name, slug) 
SELECT 
  id, 
  '/review/book', 
  '도서', 
  'book' 
FROM 
  categories 
WHERE 
  slug = 'review';
INSERT INTO categories (parent_id, path, name, slug) 
SELECT 
  id, 
  '/review/product', 
  '제품', 
  'product' 
FROM 
  categories 
WHERE 
  slug = 'review';
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
  ('여행기', 'travel-log');
-- =====================
-- accounts
-- =====================
INSERT INTO accounts (
  account_id, password_hash, nickname, 
  avatar_url, role, status
) 
VALUES 
  (
    'alice', '$2b$12$hashedpassword2', 
    '앨리스', 'https://api.dicebear.com/7.x/identicon/svg?seed=alice', 
    'USER', 'ACTIVE'
  ), 
  (
    'bob', '$2b$12$hashedpassword3', 
    '밥', 'https://api.dicebear.com/7.x/identicon/svg?seed=bob', 
    'USER', 'ACTIVE'
  ), 
  (
    'charlie', '$2b$12$hashedpassword4', 
    '찰리', 'https://api.dicebear.com/7.x/identicon/svg?seed=charlie', 
    'USER', 'ACTIVE'
  ), 
  (
    'dave', '$2b$12$hashedpassword5', 
    '데이브', 'https://api.dicebear.com/7.x/identicon/svg?seed=dave', 
    'USER', 'SUSPENDED'
  );
-- =====================
-- posts
-- =====================
INSERT INTO posts (
  account_id, slug, title, content, thumbnail, 
  category_id, published_at, is_private
) 
VALUES 
  (
    'alice', 
    'react-18-concurrent', 
    'React 18 동시성 렌더링 완전 정리', 
    'React 18에서 도입된 동시성 렌더링(Concurrent Rendering)은 ...', 
    'https://picsum.photos/seed/react18/800/400', 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'tech/frontend'
    ), 
    NOW() - INTERVAL '10 days', 
    FALSE
  ), 
  (
    'alice', 
    'nextjs-app-router', 
    'Next.js App Router 마이그레이션 후기', 
    'Pages Router에서 App Router로 전환하면서 겪은 이슈들을 공유합니다 ...', 
    'https://picsum.photos/seed/nextjs/800/400', 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'tech/frontend'
    ), 
    NOW() - INTERVAL '7 days', 
    FALSE
  ), 
  (
    'bob', 
    'postgresql-index-tuning', 
    'PostgreSQL 인덱스 튜닝 실전 가이드', 
    'EXPLAIN ANALYZE를 활용한 쿼리 최적화 방법을 소개합니다 ...', 
    'https://picsum.photos/seed/postgres/800/400', 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'tech/backend'
    ), 
    NOW() - INTERVAL '5 days', 
    FALSE
  ), 
  (
    'bob', 
    'docker-compose-best-practice', 
    'Docker Compose 실무 베스트 프랙티스', 
    '멀티 컨테이너 환경을 효율적으로 관리하는 방법 ...', 
    'https://picsum.photos/seed/docker/800/400', 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'tech/devops'
    ), 
    NOW() - INTERVAL '3 days', 
    FALSE
  ), 
  (
    'charlie', 
    'japan-travel-2024', 
    '2024 일본 여행기 - 도쿄편', 
    '3박 4일 도쿄 여행을 다녀왔습니다. 숙소, 맛집, 관광지 정리 ...', 
    'https://picsum.photos/seed/japan/800/400', 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'life/travel'
    ), 
    NOW() - INTERVAL '2 days', 
    FALSE
  ), 
  (
    'charlie', 
    'book-review-clean-code', 
    '클린 코드 다시 읽기', 
    '로버트 마틴의 클린 코드를 3년 만에 다시 읽고 느낀 점 ...', 
    'https://picsum.photos/seed/cleancode/800/400', 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'review/book'
    ), 
    NOW() - INTERVAL '1 days', 
    FALSE
  ), 
  (
    'alice', 
    'typescript-private-draft', 
    'TypeScript 5.x 새 기능 정리 (초안)', 
    '아직 작성 중인 포스트입니다 ...', 
    NULL, 
    (
      SELECT 
        id 
      FROM 
        categories 
      WHERE 
        path = 'tech/frontend'
    ), 
    NULL, 
    -- 미발행
    TRUE -- 비공개
    );
-- =====================
-- posts_tags
-- =====================
INSERT INTO posts_tags (post_id, tag_id) 
VALUES 
  -- React 18 동시성 렌더링
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'react-18-concurrent'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'react'
    )
  ), 
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'react-18-concurrent'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'javascript'
    )
  ), 
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'react-18-concurrent'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'typescript'
    )
  ), 
  -- Next.js App Router
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'nextjs-app-router'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'nextjs'
    )
  ), 
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'nextjs-app-router'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'react'
    )
  ), 
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'nextjs-app-router'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'typescript'
    )
  ), 
  -- PostgreSQL 인덱스 튜닝
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'postgresql-index-tuning'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'postgresql'
    )
  ), 
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'postgresql-index-tuning'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'nodejs'
    )
  ), 
  -- Docker Compose
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'docker-compose-best-practice'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'docker'
    )
  ), 
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'docker-compose-best-practice'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'kubernetes'
    )
  ), 
  -- 일본 여행기
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'japan-travel-2024'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'travel-log'
    )
  ), 
  -- 클린 코드
  (
    (
      SELECT 
        id 
      FROM 
        posts 
      WHERE 
        slug = 'book-review-clean-code'
    ), 
    (
      SELECT 
        id 
      FROM 
        tags 
      WHERE 
        slug = 'reading'
    )
  );
