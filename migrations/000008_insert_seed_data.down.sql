-- =====================
-- posts_tags
-- =====================
DELETE FROM posts_tags;

-- =====================
-- posts
-- =====================
DELETE FROM posts;

-- =====================
-- accounts
-- =====================
DELETE FROM accounts
WHERE account_id IN ('alice', 'bob', 'charlie', 'dave');

-- =====================
-- tags
-- =====================
DELETE FROM tags
WHERE slug IN (
  'javascript', 'typescript', 'react', 'nextjs', 'nodejs',
  'postgresql', 'docker', 'kubernetes', 'reading', 'travel-log',
  'go', 'python', 'vue', 'fastapi', 'gorm'
);

-- =====================
-- categories (4단계 → 3단계 → 2단계 → 1단계 순서)
-- =====================

-- 4단계
DELETE FROM categories
WHERE path IN (
  '/tech/frontend/react/hooks',
  '/tech/frontend/react/state',
  '/tech/frontend/nextjs/app-router',
  '/tech/backend/go/gin',
  '/tech/backend/go/gorm',
  '/tech/backend/python/fastapi',
  '/tech/devops/docker/compose',
  '/life/travel/overseas/japan',
  '/life/travel/overseas/europe'
);

-- 3단계
DELETE FROM categories
WHERE path IN (
  '/tech/frontend/react',
  '/tech/frontend/nextjs',
  '/tech/frontend/vue',
  '/tech/backend/go',
  '/tech/backend/python',
  '/tech/backend/java',
  '/tech/devops/docker',
  '/tech/devops/kubernetes',
  '/life/travel/domestic',
  '/life/travel/overseas',
  '/review/book/tech',
  '/review/book/essay'
);

-- 2단계
DELETE FROM categories
WHERE path IN (
  '/tech/frontend',
  '/tech/backend',
  '/tech/devops',
  '/life/travel',
  '/review/book',
  '/review/product'
);

-- 1단계
DELETE FROM categories
WHERE path IN ('/tech', '/life', '/review');