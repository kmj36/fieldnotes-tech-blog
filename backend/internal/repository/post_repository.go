package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

type PostRepository struct{ db *gorm.DB }

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (repo *PostRepository) FindByID(ctx *gin.Context, postId int) (*model.Post, error) {
	var post model.Post

	query := repo.db.WithContext(ctx)

	result := query.Where("id = ?", postId).First(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &post, nil
}

func (repo *PostRepository) FindBySlug(ctx *gin.Context, postSlug string) (*model.Post, error) {
	var post model.Post

	query := repo.db.WithContext(ctx)

	result := query.Where("slug = ?", postSlug).First(&post)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &post, nil
}

func (repo *PostRepository) Create(ctx *gin.Context, newPost *model.Post, tags []*model.Tag) (*model.Post, error) {
	tx := repo.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(newPost).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if len(tags) > 0 {
		postTags := make([]model.PostTag, len(tags))
		for i, tag := range tags {
			postTags[i] = model.PostTag{
				PostID: newPost.ID,
				TagID:  tag.ID,
			}
		}

		if err := tx.Create(&postTags).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return newPost, nil
}

func (repo *PostRepository) buildLikeQuery(filter, keyword string) string {
	switch filter {
	case "equal":
		return keyword
	case "prefix":
		return keyword + "%"
	case "suffix":
		return "%" + keyword
	case "contains":
		return "%" + keyword + "%"
	default:
		return keyword
	}
}

func (repo *PostRepository) buildDateQuery(column, filter string, from, to *time.Time) (string, []interface{}) {
	switch filter {
	case "eq":
		endOfDay := from.Add(24*time.Hour - time.Second)
		return column + " BETWEEN ? AND ?", []interface{}{from, endOfDay}
	case "gt":
		return column + " > ?", []interface{}{from}
	case "lt":
		return column + " < ?", []interface{}{from}
	case "gte":
		return column + " >= ?", []interface{}{from}
	case "lte":
		return column + " <= ?", []interface{}{from}
	case "between":
		if to == nil {
			return "", nil
		}
		toVal := *to
		if (*from).Equal(*to) {
			toVal = from.Add(24*time.Hour - time.Second)
		}
		return column + " BETWEEN ? AND ?", []interface{}{from, &toVal}
	default:
		return "", nil
	}
}

func (repo *PostRepository) parseDate(s *string) (*time.Time, error) {
	if s == nil {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", *s)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %s (expected YYYY-MM-DD)", *s)
	}
	return &t, nil
}

func (repo *PostRepository) List(ctx *gin.Context, req *dto.ListPostsRequest) ([]*model.Post, int, error) {
	var total int64
	var posts []*model.Post

	query := repo.db.WithContext(ctx).Model(&model.Post{}).
		Select("posts.*, accounts.nickname AS nickname").
		Joins("LEFT JOIN accounts ON posts.account_id = accounts.account_id")

	if req.ID != nil {
		query = query.Where("posts.id = ?", req.ID)
	}

	if req.AccountID != nil {
		query = query.Where("posts.account_id = ?", req.AccountID)
	}

	if req.Nickname != nil {
		query = query.Where("nickname = ?", req.Nickname)
	}

	if req.Slug != nil && req.MatchType != nil {
		pattern := repo.buildLikeQuery(*req.MatchType, *req.Slug)
		query = query.Where("posts.slug LIKE ?", pattern)
	}

	if req.Title != nil && req.MatchType != nil {
		pattern := repo.buildLikeQuery(*req.MatchType, *req.Title)
		query = query.Where("posts.title LIKE ?", pattern)
	}

	if len(req.CategoryIDs) > 0 {
		query = query.Where("posts.category_id IN ?", req.CategoryIDs)
	} else if req.CategoryID != nil {
		query = query.Where("posts.category_id = ?", req.CategoryID)
	}

	if len(req.TagSlugs) > 0 {
		query = query.Where(`
            posts.id IN (
                SELECT post_id FROM post_tags
                WHERE tag_id IN (
                    SELECT id FROM tags WHERE slug IN ?
                )
            )
        `, req.TagSlugs)
	}

	if req.DateFilter != nil && req.DateTarget != nil {
		target := "posts." + *req.DateTarget

		from, err := repo.parseDate(req.DateFrom)
		if err != nil {
			return nil, 0, err
		}

		to, err := repo.parseDate(req.DateTo)
		if err != nil {
			return nil, 0, err
		}

		pattern, args := repo.buildDateQuery(target, *req.DateFilter, from, to)
		if pattern != "" {
			query = query.Where(pattern, args...)
		}
	}

	if req.IsPrivate != nil {
		query = query.Where("posts.is_private = ?", req.IsPrivate)
	}

	// 필터 끝

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.
		Order(fmt.Sprintf("%s %s", req.SortBy, req.SortDir)).
		Offset((req.Page - 1) * req.PageLimit).
		Limit(req.PageLimit).
		Scan(&posts).Error; err != nil {
		return nil, 0, err
	}

	return posts, int(total), nil
}

func (repo *PostRepository) Update(ctx *gin.Context, req *dto.UpdatePostRequest, updates map[string]any, tags []*model.Tag) (*model.Post, error) {
	var postData model.Post

	tx := repo.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Where("id = ?", req.ID).First(&postData).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 조회 후 업데이트
	if err := tx.Model(&postData).Updates(updates).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 태그 작업
	if req.TagSlugs != nil {
		// 기존 태그 전체 삭제
		if err := tx.Where("post_id = ?", req.ID).Delete(&model.PostTag{}).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		// 태그 삽입 갱신
		if len(*req.TagSlugs) > 0 {
			postTags := make([]model.PostTag, len(tags))
			for i, tag := range tags {
				postTags[i] = model.PostTag{
					PostID: req.ID,
					TagID:  tag.ID,
				}
			}

			if err := tx.Create(&postTags).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &postData, nil
}

func (repo *PostRepository) Delete(ctx *gin.Context, req *dto.DeletePostRequest) (*model.Post, error) {
	var postData model.Post

	// 게시물 삭제 트랜잭션 시작
	tx := repo.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	// 프로그램 패닉 시 리커버리 후 트랜잭션 롤백
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 원본 게시물 정보 반환을 위해 선조회 진행
	if err := tx.Where("id = ?", req.ID).First(&postData).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 게시물 삭제 진행
	if err := tx.Delete(&postData).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 트랜잭션 커밋
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &postData, nil
}
