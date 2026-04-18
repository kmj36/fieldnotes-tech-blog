package repository

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

// 카테고리 관련 DB 작업
type TagRepository struct {db *gorm.DB}

func NewTagRepository(db *gorm.DB) *TagRepository {
	return &TagRepository{db: db}
}

func (repo *TagRepository) FindByName(ctx *gin.Context, name string) (*model.Tag, error) {
	var tag model.Tag

    query := repo.db.WithContext(ctx)
	
    result := query.Where("name = ?", name).First(&tag)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &tag, nil
}

func (repo *TagRepository) Create(ctx *gin.Context, newTag *model.Tag) (*model.Tag, error) {
	query := repo.db.WithContext(ctx)
	err := query.Create(newTag).Error
    if err != nil {
        return nil, err
    }
    return newTag, nil
}