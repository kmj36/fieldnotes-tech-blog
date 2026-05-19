-- 카테고리 계층
CREATE INDEX idx_categories_path ON categories (path);

-- 카테고리 부모ID
CREATE INDEX idx_categories_parent_id ON categories (parent_id);

-- 계정 역할 및 상태
CREATE INDEX idx_accounts_role_status ON accounts (role, status);

-- 공개 게시글 목록 (메인 피드)
CREATE INDEX idx_posts_feed ON posts (published_at DESC)
  WHERE is_private = FALSE;

-- 특정 작성자의 게시글 목록
CREATE INDEX idx_posts_account_published ON posts (account_id, published_at DESC);

-- 카테고리별 게시글 목록
CREATE INDEX idx_posts_category_published ON posts (category_id, published_at DESC)
  WHERE is_private = FALSE;

-- 태그ID 역참조
CREATE INDEX idx_post_tags_tag_id ON post_tags (tag_id);