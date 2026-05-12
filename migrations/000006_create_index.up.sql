-- 카테고리 계층
CREATE INDEX idx_categories_path ON categories (path);

-- 카테고리 부모ID
CREATE INDEX idx_categories_parent_id ON categories (parent_id);

-- 계정 역할 및 상태
CREATE INDEX idx_accounts_role_status ON accounts (role, status);

-- 공개 게시글 목록 (메인 피드)
CREATE INDEX idx_posts_feed ON posts (published_at DESC)
  WHERE deleted_at IS NULL AND is_private = FALSE;

-- 특정 작성자의 게시글 목록
CREATE INDEX idx_posts_account_published ON posts (account_id, published_at DESC)
  WHERE deleted_at IS NULL;

-- 카테고리별 게시글 목록
CREATE INDEX idx_posts_category_published ON posts (category_id, published_at DESC)
  WHERE deleted_at IS NULL AND is_private = FALSE;

-- soft delete 관리용 (어드민)
CREATE INDEX idx_posts_deleted_at ON posts (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- 태그ID 역참조
CREATE INDEX idx_posts_tags_tag_id ON posts_tags (tag_id);