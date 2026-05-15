package repository

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

type PostRepository struct {db *gorm.DB}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
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
	
    if err := tx.Create(newPost).Error; err != nil {
        tx.Rollback()
        return nil, err
    }

    if len(tags) > 0 {
        postTags := make([]model.PostTag, len(tags))
        for i, tag := range tags {
            postTags[i] = model.PostTag{
                PostID: newPost.ID,
                TagID: tag.ID,
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

func (repo *PostRepository) List(ctx *gin.Context, req *dto.ListPostsRequest) ([]*model.Post, int, error) {
    var total int64
    var posts []*model.Post

    query := repo.db.WithContext(ctx).Model(&model.Post{})

    if req.ID != nil {
        query = query.Where("id = ?", req.ID)
    }

    if req.AccountID != nil {
        query = query.Where("account_id = ?", req.AccountID)
    }

    if req.Slug != nil {
        query = query.Where("slug = ?", req.Slug)
    }

    if req.Title != nil {
        query = query.Where("title LIKE ?", fmt.Sprintf("%%%s%%", *req.Title))
    }

    if req.CategoryID != nil {
        query = query.Where("category_id = ?", req.CategoryID)
    }

    if len(req.TagSlugs) > 0 {
        query = query.Where(`
            id IN (
                SELECT post_id FROM post_tags
                WHERE tag_id IN (
                    SELECT id FROM tags WHERE slug IN ?
                )
            )
        `, req.TagSlugs)
    }

    query = query.Where("is_private = ?", false).Where("published_at IS NOT NULL")

    if err := query.Count(&total).Error; err != nil {
        return nil, 0, err
    }

    if err := query.
        Order(fmt.Sprintf("%s %s", req.SortBy, req.SortDir)).
        Offset((req.Page - 1) * req.PageLimit).
        Limit(req.PageLimit).
        Find(&posts).Error; err != nil {
        return nil, 0, err
    }

    return posts, int(total), nil
}