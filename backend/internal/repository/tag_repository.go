package repository

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
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

func (repo *TagRepository) List(ctx *gin.Context, req *dto.GetTagRequest) ([]*model.Tag, error) {
    var tags []*model.Tag

    query := repo.db.WithContext(ctx)

    if req.ID != 0 {
        query = query.Where("id = ?", req.ID)
    }

    if req.Name != "" {
        query = query.Where("name LIKE ?", "%"+req.Name+"%")
    }

    if req.Slug != "" {
        query = query.Where("slug = ?", req.Slug)
    }

    if req.SortBy != "" && req.SortDir != "" {
        query = query.Order(req.SortBy + " " + req.SortDir)
    }

    query = query.Limit(req.Limit)

    return tags, query.Find(&tags).Error
}

func (repo *TagRepository) Create(ctx *gin.Context, newTag *model.Tag) (*model.Tag, error) {
	query := repo.db.WithContext(ctx)
	err := query.Create(newTag).Error
    if err != nil {
        return nil, err
    }
    return newTag, nil
}

func (repo *TagRepository) Update(ctx *gin.Context, id int32, updates map[string]interface{}) (*model.Tag, error) {
   var tagData model.Tag

    err := repo.db.WithContext(ctx).
        Where("id = ?", id).
        First(&tagData).Error
    if err != nil {
        return nil, err
    }

    // 업데이트 후 재조회
    err = repo.db.WithContext(ctx).
        Model(&tagData).
        Updates(updates).Error
    if err != nil {
        return nil, err
    }

    return &tagData, nil
}