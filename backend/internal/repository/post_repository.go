package repository

import (
	"errors"

	"github.com/gin-gonic/gin"
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