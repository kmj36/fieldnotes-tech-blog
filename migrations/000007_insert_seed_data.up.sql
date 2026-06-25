-- ============================================================
-- Seed Data
-- ============================================================

-- ── accounts ─────────────────────────────────────────────────
INSERT INTO accounts (account_id, password_hash, nickname, avatar_url, role, status) VALUES
  ('testaccount1', '$2a$10$examplehashfortestaccount11111111111111111111', '테스트계정1', 'https://www.svgrepo.com/show/345423/admin.svg', 'ADMIN', 'ACTIVE'),
  ('editor',       '$2a$10$examplehashforeditor111111111111111111111111', 'Editor',    NULL,                                            'ADMIN', 'ACTIVE'),
  ('user1',        '$2a$10$examplehashforuser11111111111111111111111111', '일반유저1',  NULL,                                            'USER',  'ACTIVE');

-- ── categories ────────────────────────────────────────────────
-- depth 0 (루트)
INSERT INTO categories (parent_id, path, name, slug) VALUES
  (NULL, '/tech',   '기술',  'tech'),
  (NULL, '/life',   '일상',  'life'),
  (NULL, '/review', '리뷰',  'review');

-- depth 1
INSERT INTO categories (parent_id, path, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'tech'),   '/tech/frontend',  '프론트엔드', 'frontend'),
  ((SELECT id FROM categories WHERE slug = 'tech'),   '/tech/backend',   '백엔드',     'backend'),
  ((SELECT id FROM categories WHERE slug = 'tech'),   '/tech/devops',    'DevOps',     'devops'),
  ((SELECT id FROM categories WHERE slug = 'life'),   '/life/travel',    '여행',       'travel'),
  ((SELECT id FROM categories WHERE slug = 'review'), '/review/book',    '도서',       'book'),
  ((SELECT id FROM categories WHERE slug = 'review'), '/review/product', '제품',       'product');

-- depth 2
INSERT INTO categories (parent_id, path, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'frontend'), '/tech/frontend/react',    'React',       'react'),
  ((SELECT id FROM categories WHERE slug = 'frontend'), '/tech/frontend/nextjs',   'Next.js',     'nextjs'),
  ((SELECT id FROM categories WHERE slug = 'frontend'), '/tech/frontend/vue',      'Vue',         'vue'),
  ((SELECT id FROM categories WHERE slug = 'backend'),  '/tech/backend/go',        'Go',          'go'),
  ((SELECT id FROM categories WHERE slug = 'backend'),  '/tech/backend/python',    'Python',      'python'),
  ((SELECT id FROM categories WHERE slug = 'backend'),  '/tech/backend/java',      'Java',        'java'),
  ((SELECT id FROM categories WHERE slug = 'devops'),   '/tech/devops/docker',     'Docker',      'docker'),
  ((SELECT id FROM categories WHERE slug = 'devops'),   '/tech/devops/kubernetes', 'Kubernetes',  'kubernetes'),
  ((SELECT id FROM categories WHERE slug = 'travel'),   '/life/travel/domestic',   '국내여행',    'domestic'),
  ((SELECT id FROM categories WHERE slug = 'travel'),   '/life/travel/overseas',   '해외여행',    'overseas'),
  ((SELECT id FROM categories WHERE slug = 'book'),     '/review/book/tech',       '기술서적',    'tech-book'),
  ((SELECT id FROM categories WHERE slug = 'book'),     '/review/book/essay',      '에세이',      'essay');

-- depth 3
INSERT INTO categories (parent_id, path, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'react'),    '/tech/frontend/react/hooks',       'React Hooks',    'hooks'),
  ((SELECT id FROM categories WHERE slug = 'react'),    '/tech/frontend/react/state',       '상태관리',       'state'),
  ((SELECT id FROM categories WHERE slug = 'nextjs'),   '/tech/frontend/nextjs/app-router', 'App Router',     'app-router'),
  ((SELECT id FROM categories WHERE slug = 'go'),       '/tech/backend/go/gorm',            'GORM',           'gorm'),
  ((SELECT id FROM categories WHERE slug = 'go'),       '/tech/backend/go/gin',             'Gin',            'gin'),
  ((SELECT id FROM categories WHERE slug = 'python'),   '/tech/backend/python/fastapi',     'FastAPI',        'fastapi'),
  ((SELECT id FROM categories WHERE slug = 'docker'),   '/tech/devops/docker/compose',      'Docker Compose', 'compose'),
  ((SELECT id FROM categories WHERE slug = 'overseas'), '/life/travel/overseas/japan',      '일본',           'japan'),
  ((SELECT id FROM categories WHERE slug = 'overseas'), '/life/travel/overseas/europe',     '유럽',           'europe');

-- ── tags ──────────────────────────────────────────────────────
INSERT INTO tags (name, slug) VALUES
  ('Go',         'go'),
  ('Python',     'python'),
  ('Java',       'java'),
  ('React',      'react'),
  ('Vue',        'vue'),
  ('PostgreSQL', 'postgresql'),
  ('Docker',     'docker'),
  ('Kubernetes', 'kubernetes'),
  ('독서',       'reading'),
  ('여행기',     'travel-log'),
  ('GORM',       'gorm'),
  ('FastAPI',    'fastapi');

-- ── posts ─────────────────────────────────────────────────────
INSERT INTO posts (account_id, slug, title, content, thumbnail, category_id, published_at, is_private) VALUES
  (
    'testaccount1',
    'getting-started-with-go',
    'Go 시작하기',
    '## Go란?\nGo는 구글이 만든 정적 타입 컴파일 언어입니다...',
    'https://img.example.com/go.png',
    (SELECT id FROM categories WHERE slug = 'go'),
    NOW() - INTERVAL '10 days',
    FALSE
  ),
  (
    'testaccount1',
    'docker-compose-guide',
    'Docker Compose 실전 가이드',
    '## Docker Compose\n여러 컨테이너를 한 번에 관리하는 방법...',
    'https://img.example.com/docker.png',
    (SELECT id FROM categories WHERE slug = 'compose'),
    NOW() - INTERVAL '8 days',
    FALSE
  ),
  (
    'testaccount1',
    'react-hooks-deep-dive',
    'React Hooks 완벽 정리',
    '## useState, useEffect\nReact Hooks는 함수형 컴포넌트에서...',
    NULL,
    (SELECT id FROM categories WHERE slug = 'hooks'),
    NOW() - INTERVAL '6 days',
    FALSE
  ),
  (
    'editor',
    'japan-travel-log',
    '일본 여행 후기',
    '## 도쿄 3박 4일\n처음 방문한 일본은 정말 인상적이었습니다...',
    'https://img.example.com/japan.png',
    (SELECT id FROM categories WHERE slug = 'japan'),
    NOW() - INTERVAL '4 days',
    FALSE
  ),
  (
    'editor',
    'gorm-with-gin',
    'Gin + GORM으로 REST API 만들기',
    '## 프로젝트 설정\nGin과 GORM을 활용한 REST API 구축 방법...',
    NULL,
    (SELECT id FROM categories WHERE slug = 'gorm'),
    NOW() - INTERVAL '2 days',
    FALSE
  ),
  (
    'testaccount1',
    'private-draft-post',
    '비공개 초안',
    '아직 작성 중인 글입니다...',
    NULL,
    NULL,
    NULL,
    TRUE
  );

-- ── post_tags ────────────────────────────────────────────────
INSERT INTO post_tags (post_id, tag_id) VALUES
  ((SELECT id FROM posts WHERE slug = 'getting-started-with-go'), (SELECT id FROM tags WHERE slug = 'go')),
  ((SELECT id FROM posts WHERE slug = 'getting-started-with-go'), (SELECT id FROM tags WHERE slug = 'gorm')),
  ((SELECT id FROM posts WHERE slug = 'docker-compose-guide'),    (SELECT id FROM tags WHERE slug = 'docker')),
  ((SELECT id FROM posts WHERE slug = 'docker-compose-guide'),    (SELECT id FROM tags WHERE slug = 'kubernetes')),
  ((SELECT id FROM posts WHERE slug = 'react-hooks-deep-dive'),   (SELECT id FROM tags WHERE slug = 'react')),
  ((SELECT id FROM posts WHERE slug = 'japan-travel-log'),        (SELECT id FROM tags WHERE slug = 'travel-log')),
  ((SELECT id FROM posts WHERE slug = 'gorm-with-gin'),           (SELECT id FROM tags WHERE slug = 'go')),
  ((SELECT id FROM posts WHERE slug = 'gorm-with-gin'),           (SELECT id FROM tags WHERE slug = 'gorm'));