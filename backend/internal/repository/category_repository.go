package repository

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

// 카테고리 관련 DB 작업
type CategoryRepository struct{ db *gorm.DB }

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
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

func (repo *CategoryRepository) FindByID(ctx *gin.Context, id int16) (*model.Category, error) {
	var category model.Category

	query := repo.db.WithContext(ctx)

	result := query.Where(whereID, id).First(&category)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // 없으면 nil 반환
		}
		return nil, result.Error
	}
	return &category, nil
}

func (repo *CategoryRepository) FindByIDs(ctx *gin.Context, ids []int16) (map[int16]*model.Category, error) {
	var categories []*model.Category

	query := repo.db.WithContext(ctx)

	if len(ids) == 0 {
		return map[int16]*model.Category{}, nil
	}

	if err := query.Where("id IN ?", ids).Find(&categories).Error; err != nil {
		return nil, err
	}

	result := make(map[int16]*model.Category)
	for _, item := range categories {
		result[item.ID] = item
	}

	return result, nil
}

func (repo *CategoryRepository) FindByIDsPathPrefix(ctx *gin.Context, path string) ([]int16, error) {
	var ids []int16
	query := repo.db.WithContext(ctx)

	result := query.
		Model(&model.Category{}).
		Where("path = ? OR "+categoryWherePathLike, path, path+"/%").
		Pluck("id", &ids)
	return ids, result.Error
}

func (repo *CategoryRepository) CountByParentID(ctx *gin.Context, id int16) (int64, error) {
	var count int64
	err := repo.db.WithContext(ctx).
		Model(&model.Category{}).
		Where("parent_id = ?", id).
		Count(&count).Error
	return count, err
}

func (repo *CategoryRepository) List(ctx *gin.Context, req *dto.ReadCategoriesRequest) ([]*model.Category, error) {
	var categories []*model.Category

	query := repo.db.WithContext(ctx)

	if req.ID != nil {
		query = query.Where(whereID, *req.ID)
	}

	if req.ParentID != nil {
		query = query.Where("parent_id = ?", *req.ParentID)
	}

	if req.Name != nil {
		query = query.Where("name LIKE ?", fmt.Sprintf("%%%s%%", *req.Name))
	}

	if req.Slug != nil {
		query = query.Where("slug = ?", *req.Slug)
	}

	query = query.Order(fmt.Sprintf("%s %s", req.SortBy, req.SortDir))
	query = query.Limit(int(req.Limit))

	if err := query.Find(&categories).Error; err != nil {
		return nil, err
	}

	return categories, nil
}

func (repo *CategoryRepository) Create(ctx *gin.Context, newCategory *model.Category) (*model.Category, error) {
	query := repo.db.WithContext(ctx)
	err := query.Create(newCategory).Error
	if err != nil {
		return nil, err
	}
	return newCategory, nil
}

func (repo *CategoryRepository) Update(ctx *gin.Context, req *dto.UpdateCategoryRequest, updates map[string]any) (*model.Category, error) {
	var categoryData model.Category

	err := repo.db.WithContext(ctx).
		Where(whereID, req.ID).
		First(&categoryData).Error
	if err != nil {
		return nil, err
	}

	// 업데이트 후 재조회
	err = repo.db.WithContext(ctx).
		Model(&categoryData).
		Updates(updates).Error
	if err != nil {
		return nil, err
	}

	return &categoryData, nil
}

func (repo *CategoryRepository) Delete(ctx *gin.Context, req *dto.DeleteCategoryRequest) (*model.Category, error) {
	var categoryData model.Category

	err := repo.db.WithContext(ctx).
		Where(whereID, req.ID).
		First(&categoryData).Error
	if err != nil {
		return nil, err
	}

	err = repo.db.WithContext(ctx).
		Delete(&categoryData).Error
	if err != nil {
		return nil, err
	}

	return &categoryData, nil
}

func (repo *CategoryRepository) UpdateDescendantPaths(ctx *gin.Context, oldPath string, newPath string) error {
	var categoryData model.Category

	return repo.db.WithContext(ctx).
		Model(&categoryData).
		Where(categoryWherePathLike, oldPath+"/%").
		Update("path", gorm.Expr("REPLACE(path, ?, ?)", oldPath, newPath)).Error
}

func (repo *CategoryRepository) ResetDescendantPaths(ctx *gin.Context, parentPath string) error {
	return repo.db.WithContext(ctx).
		Model(&model.Category{}).
		Where(categoryWherePathLike, parentPath+"/%").
		Updates(map[string]interface{}{
			"parent_id": nil,
			"path":      gorm.Expr("'/' || split_part(path, '/', array_length(string_to_array(path, '/'), 1))"),
		}).Error
}
