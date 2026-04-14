package repository

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

// 카테고리 관련 DB 작업
type CategoryRepository struct {db *gorm.DB}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (repo *CategoryRepository) Create(ctx *gin.Context, newCategory *model.Category) (*model.Category, error) {
    query := repo.db.WithContext(ctx)
	err := query.Create(newCategory).Error
    if err != nil {
        return nil, err
    }
    return newCategory, nil
}

func (repo *CategoryRepository) FindByName(ctx *gin.Context, name string) (*model.Category, error) {
	var category model.Category

    query := repo.db.WithContext(ctx)
	
    result := query.Where("name = ?", name).First(&category)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &category, nil
}

func (repo *CategoryRepository) FindByID(ctx *gin.Context, id int32) (*model.Category, error) {
	var category model.Category
	
	query := repo.db.WithContext(ctx)
	
    result := query.Where("id = ?", id).First(&category)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &category, nil
}

func (repo *CategoryRepository) List(ctx *gin.Context, req *dto.GetCategoryRequest) ([]*model.Category, error) {
    var categories []*model.Category

    query := repo.db.WithContext(ctx)

    if req.ID != 0 {
        query = query.Where("id = ?", req.ID)
    }

    if req.ParentID != nil {
        query = query.Where("parent_id = ?", *req.ParentID)
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

    return categories, query.Find(&categories).Error
}
