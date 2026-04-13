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
WHERE account_id IN ('admin', 'alice', 'bob', 'charlie', 'dave');

-- =====================
-- tags
-- =====================
DELETE FROM tags
WHERE slug IN (
  'javascript', 'typescript', 'react', 'nextjs', 'nodejs',
  'postgresql', 'docker', 'kubernetes', 'reading', 'travel-log'
);

-- =====================
-- categories (자식 먼저, 부모 나중)
-- =====================
DELETE FROM categories
WHERE path IN (
  '/tech/frontend', '/tech/backend', '/tech/devops',
  '/life/travel',
  '/review/book', '/review/product'
);

DELETE FROM categories
WHERE path IN ('tech', 'life', 'review');