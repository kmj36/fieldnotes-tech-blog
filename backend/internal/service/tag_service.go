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
type TagService struct {
	repo *repository.TagRepository
	jwt *cryption.JWTManager
}

func NewTagService(repo *repository.TagRepository, jwtManager *cryption.JWTManager) *TagService {
	return &TagService{repo: repo, jwt:jwtManager}
}

func (s *TagService) Create(ctx *gin.Context, req *dto.CreateTagRequest) (*dto.CreateTagResponse, error) {
	var existing *model.Tag
	var err error

	existing, err = s.repo.FindByName(ctx, req.Name)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrAlreadyExists
	}

	newTag := &model.Tag{
		Name: req.Name,
		Slug: req.Slug,
	}

	tag, err := s.repo.Create(ctx, newTag)
	if err != nil {
		return nil, err
	}

	res := &dto.CreateTagResponse{
		TagDetail: dto.TagDetail{
			TagPublic: dto.TagPublic{
				ID: tag.ID,
				Name: tag.Name,
				Slug: tag.Slug,
			},
			CreatedAt: tag.CreatedAt,
			UpdatedAt: tag.UpdatedAt,
		},
	}

	return res, nil
}

func (s *TagService) List(ctx *gin.Context, req *dto.ReadTagsRequest) (*dto.ReadTagsResponse, error) {
	var result	[]*dto.TagPublic

	array, err := s.repo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.TagPublic, len(array))

	for idx, item := range array {
		result[idx] = &dto.TagPublic{
			ID: item.ID,
			Name: item.Name,
			Slug: item.Slug,
		}
	}

	res := &dto.ReadTagsResponse{
		Meta: dto.ReadTagsMetadata{
			Sort: dto.SortMeta{
				SortBy: req.SortBy,
				SortDir: req.SortDir,
			},
			Limit: req.Limit,
			Filters: dto.ReadTagsFilters{
				ID: req.ID,
				Name: req.Name,
				Slug: req.Slug,
			},
		},
		Datas: result,
	}

	return res, nil
}

func (s *TagService) Update(ctx *gin.Context, req *dto.UpdateTagRequest) (*dto.UpdateTagResponse, error) {
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

	if req.Slug != nil && *req.Slug != existing.Slug {
		updates["slug"] = req.Slug
		changedFields = append(changedFields, "slug")
	}

	if len(updates) == 0 {
		return nil, dto.CErrUpdateEmptyParam
	}

	data, err := s.repo.Update(ctx, req, updates)
	if err != nil {
		return nil, err
	}

	res := &dto.UpdateTagResponse{
		Data: dto.TagDetail{
			TagPublic: dto.TagPublic{
				ID: data.ID,
				Name: data.Name,
				Slug: data.Slug,
			},
			CreatedAt: data.CreatedAt,
			UpdatedAt: data.UpdatedAt,
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}

    return res, nil
}

func (s *TagService) Delete(ctx *gin.Context, req *dto.DeleteTagRequest) (*dto.DeleteTagResponse, error) {
	current, err := s.repo.FindByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, gorm.ErrRecordNotFound
	}

	result, err := s.repo.Delete(ctx, req)
	if err != nil {
		return nil, err
	}

	res := &dto.DeleteTagResponse{
		Name: result.Name,
	}

	return res, nil
}