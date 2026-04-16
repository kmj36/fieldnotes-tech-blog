package service

import (
	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
)

// 카테고리 관련 비즈니스 로직
type CategoryService struct {
	repo *repository.CategoryRepository
	jwt *cryption.JWTManager
}

func NewCategoryService(repo *repository.CategoryRepository, jwtManager *cryption.JWTManager) *CategoryService {
	return &CategoryService{repo: repo, jwt:jwtManager}
}

func (s *CategoryService) Create(ctx *gin.Context, req *dto.CreateCategoryRequest) (*model.Category, error) {
	var existing *model.Category
	var err error
	var path string
	var parentID *int32

	existing, err = s.repo.FindByName(ctx, req.Name)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrCategoryAlreadyExists
	}

	if req.ParentID == nil || *req.ParentID == 0 {
		path = "/" + req.Slug
		parentID = nil
	} else {
		parent, err := s.repo.FindByID(ctx, *req.ParentID)
		if err != nil {
			return nil, err
		}
		path = parent.Path + "/" + req.Slug
		parentID = req.ParentID
	}

	newCategory := &model.Category{
		ParentID: parentID,
		Path: path,
		Name: req.Name,
		Slug: req.Slug,
	}

	return s.repo.Create(ctx, newCategory)
}

func (s *CategoryService) List(ctx *gin.Context, req *dto.GetCategoryRequest) ([]*dto.CategoriesObject, error) {
	var categories []*dto.CategoriesObject
	var datas	[]*model.Category
	var err		error
	

	if req.SortBy == "" {
		req.SortBy = "id"
	}

	if req.SortDir == "" {
		req.SortDir = "desc"
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	datas, err = s.repo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	categories = make([]*dto.CategoriesObject, len(datas))

	for idx, data := range datas {
		categories[idx] = &dto.CategoriesObject{
			ID: data.ID,
			ParentID: data.ParentID,
			Name: data.Name,
			Slug: data.Slug,
			Path: data.Path,
		}
	}

	return categories, nil
}

func (s *CategoryService) Update(ctx *gin.Context, id int32, req dto.UpdateCategoryRequest) (*dto.UpdateCategoryResponse, error) {
	var changed *dto.UpdateCategoryResponse
	var data *model.Category
	var err error

	updates := map[string]interface{}{}

	// 업데이트 전 현재 카테고리 조회
	current, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	oldPath := current.Path

    if req.Name != "" {
        updates["name"] = req.Name
    }

	slug := current.Slug
	if req.Slug != "" {
		slug = req.Slug
		updates["slug"] = slug
	}

	// parent_id가 전달된 경우에만 path 재조합
	if req.ParentID != nil {
		if *req.ParentID == 0 {
			// 최상위로 변경
			updates["path"] = "/" + slug
			updates["parent_id"] = nil
		} else {
			// 특정 부모로 변경
			parent, err := s.repo.FindByID(ctx, *req.ParentID)
			if err != nil {
				return nil, err
			}
			updates["path"] = parent.Path + "/" + slug
			updates["parent_id"] = req.ParentID
		}
	} else if req.Slug != "" {
		// parent_id 변경 없이 slug만 변경된 경우 path 재조합
		if current.ParentID == nil {
			updates["path"] = "/" + slug
		} else {
			parent, err := s.repo.FindByID(ctx, *current.ParentID)
			if err != nil {
				return nil, err
			}
			updates["path"] = parent.Path + "/" + slug
		}
	}

	var changedFields []string
    for key := range updates {
        changedFields = append(changedFields, key)
    }
	
	if data, err = s.repo.Update(ctx, id, updates) ; err != nil {
		return nil, err
	}

	// 하위 카테고리 연쇄 업데이트
	s.repo.UpdateDescendantPaths(ctx, oldPath, updates["path"].(string))

	changed = &dto.UpdateCategoryResponse{
		Data: dto.CreateCategoryResponse{
			ID: data.ID,
			ParentID: data.ParentID,
			Name: data.Name,
			Slug: data.Slug,
			Path: data.Path,
			CreatedAt: data.CreatedAt,
			UpdatedAt: data.UpdatedAt,
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}

    return changed, err
}

func (s *CategoryService) Delete(ctx *gin.Context, id int32) (*model.Category, error) {
	var data *model.Category
	var current *model.Category
	var err error

	current, err = s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, err
    }

	if data, err = s.repo.Delete(ctx, id) ; err != nil {
		return nil, err
	}

	s.repo.ResetDescendantPaths(ctx, current.Path)

	return data, nil
}