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
	jwt  *cryption.JWTManager
}

func NewCategoryService(repo *repository.CategoryRepository, jwtManager *cryption.JWTManager) *CategoryService {
	return &CategoryService{repo: repo, jwt: jwtManager}
}

func (s *CategoryService) Create(ctx *gin.Context, req *dto.CreateCategoryRequest) (*dto.CreateCategoryReponse, error) {
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
		Path:     path,
		Name:     req.Name,
		Slug:     req.Slug,
	}

	category, err := s.repo.Create(ctx, newCategory)
	if err != nil {
		return nil, err
	}

	res := &dto.CreateCategoryReponse{
		CategoryDetail: dto.CategoryDetail{
			CategoryPublic: dto.CategoryPublic{
				ID:       category.ID,
				ParentID: category.ParentID,
				Name:     category.Name,
				Slug:     category.Slug,
				Path:     category.Path,
			},
			CreatedAt: category.CreatedAt,
			UpdatedAt: category.UpdatedAt,
		},
	}

	return res, nil
}

func (s *CategoryService) List(ctx *gin.Context, req *dto.ReadCategoriesRequest) (*dto.ReadCategoriesResponse, error) {
	var result []*dto.CategoryPublic

	array, err := s.repo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.CategoryPublic, len(array))

	for idx, item := range array {
		result[idx] = &dto.CategoryPublic{
			ID:       item.ID,
			ParentID: item.ParentID,
			Path:     item.Path,
			Name:     item.Name,
			Slug:     item.Slug,
		}
	}

	res := &dto.ReadCategoriesResponse{
		Meta: dto.ReadCategoriesMetadata{
			Sort: dto.SortMeta{
				SortBy:  req.SortBy,
				SortDir: req.SortDir,
			},
			Limit: req.Limit,
			Filters: dto.ReadCategoriesFilters{
				ID:       req.ID,
				ParentID: req.ParentID,
				Name:     req.Name,
				Slug:     req.Slug,
			},
		},
		Datas: result,
	}

	return res, nil
}

func (s *CategoryService) Update(ctx *gin.Context, req *dto.UpdateCategoryRequest) (*dto.UpdateCategoryResponse, error) {
	// 업데이트 전 현재 카테고리 조회
	existing, err := s.repo.FindByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, gorm.ErrRecordNotFound
	}

	updates, changedFields := buildCategoryFieldUpdates(req, existing)

	pathUpdates, pathFields, err := s.resolvePathUpdates(ctx, req.Slug, req.ParentID, existing.Slug, existing.ParentID)
	if err != nil {
		return nil, err
	}
	for k, v := range pathUpdates {
		updates[k] = v
	}
	changedFields = append(changedFields, pathFields...)

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
				ID:       data.ID,
				ParentID: data.ParentID,
				Path:     data.Path,
				Name:     data.Name,
				Slug:     data.Slug,
			},
			CreatedAt: data.CreatedAt,
			UpdatedAt: data.UpdatedAt,
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}, nil
}

// name, slug 단순 필드 변경 감지 (depth 0, 평탄)
func buildCategoryFieldUpdates(req *dto.UpdateCategoryRequest, existing *model.Category) (map[string]interface{}, []string) {
	updates := map[string]interface{}{}
	changedFields := []string{}

	if req.Name != nil && *req.Name != existing.Name {
		updates["name"] = req.Name
		changedFields = append(changedFields, "name")
	}

	if req.Slug != nil && *req.Slug != existing.Slug {
		updates["slug"] = *req.Slug
		changedFields = append(changedFields, "slug")
	}

	return updates, changedFields
}

// slug 또는 parent 변경 시 path/parentId 갱신 여부 판단
func (s *CategoryService) resolvePathUpdates(ctx *gin.Context, newSlug *string, newParentID *int16, existingSlug string, existingParentID *int16) (map[string]interface{}, []string, error) {
	slugChanged := newSlug != nil && *newSlug != existingSlug
	parentChanged := newParentID != nil && (existingParentID == nil || *newParentID != *existingParentID)

	if !slugChanged && !parentChanged {
		return nil, nil, nil
	}

	slug := existingSlug
	if slugChanged {
		slug = *newSlug
	}

	path, parentID, err := s.resolveCategoryPath(ctx, newParentID, existingParentID, slug, parentChanged)
	if err != nil {
		return nil, nil, err
	}

	updates := map[string]interface{}{"path": path}
	changedFields := []string{"path"}

	if parentChanged {
		updates["parent_id"] = parentID
		changedFields = append(changedFields, "parentId")
	}

	return updates, changedFields, nil
}

// 새 path 문자열과 parent_id 값을 계산
func (s *CategoryService) resolveCategoryPath(ctx *gin.Context, newParentID *int16, existingParentID *int16, slug string, parentChanged bool) (string, *int16, error) {
	// 0은 "최상위로 변경" sentinel
	if newParentID != nil && *newParentID == 0 {
		return "/" + slug, nil, nil
	}

	parentID := existingParentID
	if parentChanged {
		parentID = newParentID
	}

	if parentID == nil {
		return "/" + slug, nil, nil
	}

	parent, err := s.repo.FindByID(ctx, *parentID)
	if err != nil {
		return "", nil, err
	}
	if parent == nil {
		return "", nil, gorm.ErrRecordNotFound
	}

	return parent.Path + "/" + slug, parentID, nil
}

func (s *CategoryService) Delete(ctx *gin.Context, req *dto.DeleteCategoryRequest) (*dto.DeleteCategoryResponse, error) {
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

	res := &dto.DeleteCategoryResponse{
		Name: result.Name,
	}

	return res, nil
}
