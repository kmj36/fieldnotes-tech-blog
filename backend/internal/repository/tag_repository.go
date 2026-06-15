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
type TagRepository struct{ db *gorm.DB }

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

func (repo *TagRepository) FindByID(ctx *gin.Context, id int16) (*model.Tag, error) {
	var tag model.Tag

	query := repo.db.WithContext(ctx)

	result := query.Where(tagWhereID, id).First(&tag)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // 없으면 nil 반환
		}
		return nil, result.Error
	}
	return &tag, nil
}

func (repo *TagRepository) FindBySlugs(ctx *gin.Context, tagSlugs []string) ([]*model.Tag, error) {
	if len(tagSlugs) == 0 {
		return []*model.Tag{}, nil
	}

	var tags []*model.Tag
	if err := repo.db.WithContext(ctx).Where("slug IN ?", tagSlugs).Find(&tags).Error; err != nil {
		return nil, err
	}

	return tags, nil
}

func (repo *TagRepository) FindByPostID(ctx *gin.Context, postIDs []int) (map[int][]*model.Tag, error) {
	query := repo.db.WithContext(ctx)

	if len(postIDs) == 0 {
		return map[int][]*model.Tag{}, nil
	}

	type tagRow struct {
		PostID int `db:"post_id"`
		model.Tag
	}

	var rows []tagRow
	if err := query.Table("tags").
		Select("tags.*, post_tags.post_id").
		Joins("JOIN post_tags ON tags.id = post_tags.tag_id").
		Where("post_tags.post_id IN ?", postIDs).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make(map[int][]*model.Tag)
	for _, row := range rows {
		r := row
		result[row.PostID] = append(result[row.PostID], &r.Tag)
	}

	return result, nil
}

func (repo *TagRepository) List(ctx *gin.Context, req *dto.ReadTagsRequest) ([]*model.Tag, error) {
	var tags []*model.Tag

	query := repo.db.WithContext(ctx)

	if req.ID != nil {
		query = query.Where(tagWhereID, req.ID)
	}

	if req.Name != nil {
		query = query.Where("name LIKE ?", fmt.Sprintf("%%%s%%", *req.Name))
	}

	if req.Slug != nil {
		query = query.Where("slug = ?", req.Slug)
	}

	query = query.Order(fmt.Sprintf("%s %s", req.SortBy, req.SortDir))
	query = query.Limit(int(req.Limit))

	if err := query.Find(&tags).Error; err != nil {
		return nil, err
	}

	return tags, nil
}

func (repo *TagRepository) Create(ctx *gin.Context, newTag *model.Tag) (*model.Tag, error) {
	query := repo.db.WithContext(ctx)
	err := query.Create(newTag).Error
	if err != nil {
		return nil, err
	}
	return newTag, nil
}

func (repo *TagRepository) Update(ctx *gin.Context, req *dto.UpdateTagRequest, updates map[string]any) (*model.Tag, error) {
	var tagData model.Tag

	err := repo.db.WithContext(ctx).
		Where(tagWhereID, req.ID).
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

func (repo *TagRepository) Delete(ctx *gin.Context, req *dto.DeleteTagRequest) (*model.Tag, error) {
	var tagData model.Tag

	err := repo.db.WithContext(ctx).
		Where(tagWhereID, req.ID).
		First(&tagData).Error
	if err != nil {
		return nil, err
	}

	err = repo.db.WithContext(ctx).
		Delete(&tagData).Error
	if err != nil {
		return nil, err
	}

	return &tagData, nil
}
