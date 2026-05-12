package service

import (
	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
	"gorm.io/gorm"
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
	var parentID *int16

	existing, err = s.repo.FindByName(ctx, req.Name)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrAlreadyExists
	}

	if req.ParentID == nil || *req.ParentID == 0 {
		path = "/" + req.Slug
		parentID = nil
	} else {
		parent, err := s.repo.FindByID(ctx, *req.ParentID)
		if err != nil {
			return nil, err
		}
		if parent == nil {
			return nil, gorm.ErrRecordNotFound
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

func (s *CategoryService) GetList(ctx *gin.Context, req *dto.ReadCategoriesRequest) ([]*dto.CategoryPublic, error) {
	var result  []*dto.CategoryPublic

	array, err := s.repo.GetList(ctx, req)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.CategoryPublic, len(array))

	for idx, item := range array {
		result[idx] = &dto.CategoryPublic{
			ID: item.ID,
			ParentID: item.ParentID,
			Path: item.Path,
			Name: item.Name,
			Slug: item.Slug,
		}
	}

	return result, nil
}

func (s *CategoryService) UpdateFields(ctx *gin.Context, req *dto.UpdateCategoryRequest) (*dto.UpdateCategoryResponse, error) {
	// 업데이트 전 현재 카테고리 조회
	existing, err := s.repo.FindByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, gorm.ErrRecordNotFound
	}

	updates := map[string]interface{}{}
	changedFields := []string{}

    if req.Name != nil && *req.Name != existing.Name {
        updates["name"] = req.Name
		changedFields = append(changedFields, "name")
    }

	slug := existing.Slug
	if req.Slug != nil && *req.Slug != existing.Slug {
		slug = *req.Slug
		updates["slug"] = slug
		changedFields = append(changedFields, "slug")
	}

	slugChanged := req.Slug != nil && *req.Slug != existing.Slug
    parentChanged := req.ParentID != nil && (existing.ParentID == nil || *req.ParentID != *existing.ParentID)

	if parentChanged || slugChanged {
        changedFields = append(changedFields, "path")
        if parentChanged {
            changedFields = append(changedFields, "parentId")
        }

        if req.ParentID != nil && *req.ParentID == 0 {
            // 최상위로 변경
            updates["path"] = "/" + slug
            updates["parent_id"] = nil
        } else {
		   var parentID *int16
			if parentChanged {
				parentID = req.ParentID
			} else {
				parentID = existing.ParentID
			}
			if parentID == nil {
				updates["path"] = "/" + slug
			} else {
				parent, err := s.repo.FindByID(ctx, *parentID)
				if err != nil {
					return nil, err
				}
				if parent == nil {
					return nil, gorm.ErrRecordNotFound
				}
				updates["path"] = parent.Path + "/" + slug
			}
			if parentChanged {
				updates["parent_id"] = req.ParentID
			}
        }
    }

	if len(updates) == 0 {
		return nil, dto.CErrUpdateEmptyParam
	} 

	data, err := s.repo.Update(ctx, req, updates)
	if err != nil {
		return nil, err
	}

	// 하위 카테고리 연쇄 업데이트
	if newPath, ok := updates["path"].(string); ok {
		s.repo.UpdateDescendantPaths(ctx, existing.Path, newPath)
	}

	return &dto.UpdateCategoryResponse{
		Data: dto.CategoryDetail{
			CategoryPublic: dto.CategoryPublic{
				ID: data.ID,
				ParentID: data.ParentID,
				Path: data.Path,
				Name: data.Name,
				Slug: data.Slug,
			},
			CreatedAt: data.CreatedAt,
			UpdatedAt: data.UpdatedAt,
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}, nil
}

func (s *CategoryService) Delete(ctx *gin.Context, req *dto.DeleteCategoryRequest) (*model.Category, error) {
	current, err := s.repo.FindByID(ctx, req.ID)
    if err != nil {
        return nil, err
    }
	if current == nil {
		return nil, gorm.ErrRecordNotFound
	}

	count, err := s.repo.CountByParentID(ctx, current.ID)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, dto.CErrChildNodeExists
	}

	result, err := s.repo.Delete(ctx, req) 
	if err != nil {
		return nil, err
	}

	return result, nil
}