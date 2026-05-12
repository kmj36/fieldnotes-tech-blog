-- 카테고리 계층
DROP INDEX idx_categories_path;

-- 카테고리 부모ID
DROP INDEX idx_categories_parent_id;

-- 계정 역할 및 상태
DROP INDEX idx_accounts_role_status;

-- 공개 게시글 목록 (메인 피드)
DROP INDEX idx_posts_feed;

-- 특정 작성자의 게시글 목록
DROP INDEX idx_posts_account_published;

-- 카테고리별 게시글 목록
DROP INDEX idx_posts_category_published;

-- soft delete 관리용 (어드민)
DROP INDEX idx_posts_deleted_at;

-- 태그ID 역참조
DROP INDEX idx_posts_tags_tag_id;