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

func (repo *PostRepository) Create(ctx *gin.Context, newPost *model.Post) (*model.Post, error) {
	query := repo.db.WithContext(ctx)
	err := query.Create(newPost).Error
	if err != nil {
		return nil, err
	}

	return newPost, nil
}

func (repo *PostRepository) CreatePostTags(ctx *gin.Context, postID int, tagSlugs []string) ([]*model.Tag, error) {
	if len(tagSlugs) == 0 {
        return []*model.Tag{}, nil
    }

    // slug 로 tag 조회
    var tags []*model.Tag
    if err := repo.db.WithContext(ctx).
        Where("slug IN ?", tagSlugs).
        Find(&tags).Error; err != nil {
        return nil, err
    }

    // post_tags 일괄 등록
    postTags := make([]model.PostTag, len(tags))
    for idx, tag := range tags {
        postTags[idx] = model.PostTag{
            PostID: postID,
            TagID:  tag.ID,
        }
    }

    if err := repo.db.WithContext(ctx).Create(&postTags).Error; err != nil {
        return nil, err
    }

    return tags, nil
}