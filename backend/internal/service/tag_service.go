package service

import (
	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
)

// 카테고리 관련 비즈니스 로직
type TagService struct {
	repo *repository.TagRepository
	jwt *cryption.JWTManager
}

func NewTagService(repo *repository.TagRepository, jwtManager *cryption.JWTManager) *TagService {
	return &TagService{repo: repo, jwt:jwtManager}
}

func (s *TagService) Create(ctx *gin.Context, req *dto.CreateTagRequest) (*model.Tag, error) {
	var existing *model.Tag
	var err error

	existing, err = s.repo.FindByName(ctx, req.Name)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrTagAlreadyExists
	}

	newTag := &model.Tag{
		Name: req.Name,
		Slug: req.Slug,
	}

	return s.repo.Create(ctx, newTag)
}

func (s *TagService) Update(ctx *gin.Context, id int32, req dto.UpdateTagRequest) (*dto.UpdateTagResponse, error) {
	var changed *dto.UpdateTagResponse
	var data *model.Tag
	var err error

	updates := map[string]interface{}{}

    if req.Name != "" {
        updates["name"] = req.Name
    }

	if req.Slug != "" {
		updates["slug"] = req.Slug
	}

	var changedFields []string
    for key := range updates {
        changedFields = append(changedFields, key)
    }
	
	if data, err = s.repo.Update(ctx, id, updates) ; err != nil {
		return nil, err
	}

	changed = &dto.UpdateTagResponse{
		Data: dto.CreateTagResponse{
			ID: data.ID,
			Name: data.Name,
			Slug: data.Slug,
			CreatedAt: data.CreatedAt,
			UpdatedAt: data.UpdatedAt,
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}

    return changed, err
}