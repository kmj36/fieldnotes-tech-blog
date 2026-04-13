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