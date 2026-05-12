-- ============================================================
-- Seed Down (순서 중요: FK 역순)
-- ============================================================

DELETE FROM posts_tags;
DELETE FROM posts;
DELETE FROM tags;
DELETE FROM categories;
DELETE FROM accounts;