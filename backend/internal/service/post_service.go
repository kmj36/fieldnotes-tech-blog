package service

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
	"gorm.io/gorm"
)

type PostService struct {
	postRepo *repository.PostRepository
	tagRepo *repository.TagRepository
	categoryRepo *repository.CategoryRepository
	jwt *cryption.JWTManager
}

func NewPostService(postRepo *repository.PostRepository, tagRepo *repository.TagRepository, categoryRepo *repository.CategoryRepository, jwtManager *cryption.JWTManager) *PostService {
	return &PostService{
		postRepo: postRepo,
		tagRepo: tagRepo,
		categoryRepo: categoryRepo,
		jwt:jwtManager,
	}
}

func (s *PostService) Create(ctx *gin.Context, req *dto.CreatePostRequest) (*dto.CreatePostResponse, error) {
	var isPrivate	bool
	var publishedAt *time.Time
	var category	*dto.CategoryPublic
	var tags		[]dto.TagPublic
	var tagDatas	[]*model.Tag

	// 게시물 중복 여부 확인
	existing, err := s.postRepo.FindBySlug(ctx, req.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrAlreadyExists
	}

	// 카테고리 ID 존재 여부 확인
	if req.CategoryID != nil {
		categoryData, err := s.categoryRepo.FindByID(ctx, *req.CategoryID)
		if err != nil {
			return nil, err
		}
		if categoryData == nil {
			return nil, gorm.ErrRecordNotFound
		}
		category = &dto.CategoryPublic{
			ID:       categoryData.ID,
			ParentID: categoryData.ParentID,
			Path:     categoryData.Path,
			Name:     categoryData.Name,
			Slug:     categoryData.Slug,
		}
	}

	// 태그 Slugs 존재 여부 확인
	if len(req.TagSlugs) > 0 {
		var err error
		tagDatas, err = s.tagRepo.FindBySlugs(ctx, req.TagSlugs)
		if err != nil {
			return nil, err
		}
		tags = make([]dto.TagPublic, len(tagDatas))
		for idx, item := range tagDatas {
			tags[idx] = dto.TagPublic{
				ID: item.ID,
				Name: item.Name,
				Slug: item.Slug,
			}
		}
	}

	// JWT Claim 에서 계정 ID 추출 
	account := ctx.GetString("accountId")
	if account == "" {
		return nil, dto.CErrLoginFailed
	}

	// 게시물 발행, 비공개 여부 확인
	if req.IsPrivate != nil && *req.IsPrivate {
		isPrivate = true
	} else {
		now := time.Now().UTC()
		publishedAt = &now
	}

	// Post Create 모델 생성
	newPost := &model.Post{
		AccountID: account,
		Slug: req.Slug,
		Title: req.Title,
		Content: req.Content,
		Thumbnail: req.Thumbnail,
		CategoryID: req.CategoryID,
		IsPrivate: isPrivate,
		PublishedAt: publishedAt,
	}

	// 게시물 DB 컬럼 등록 시도
	post, err := s.postRepo.Create(ctx, newPost, tagDatas)
	if err != nil {
		return nil, err
	}

	// 게시물 유니코드 150자 절삭
	var excerpt string
	runes := []rune(post.Content)
	if len(runes) > 150 {
		excerpt = string(runes[:150])
	} else {
		excerpt = string(runes)
	}

	// 서비스 응답 반환값 생성
	res := &dto.CreatePostResponse{
		PostPublic: dto.PostPublic{
			ID: post.ID,
			Slug: post.Slug,
			Title: post.Title,
			Excerpt: excerpt,
			Thumbnail: post.Thumbnail,
			PublishedAt: post.PublishedAt,
			UpdatedAt: post.UpdatedAt,
			Category: category,
			Tags: tags, 
		},
	}

	return res, nil
}

func (s *PostService) List(ctx *gin.Context, req *dto.ListPostsRequest) (*dto.ListPostsResponse, error) {
	var result []*dto.PostPublic
	
	array, total, err := s.postRepo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	// 게시물 ID, 카테고리 ID 목록 추출
	postIDs := make([]int, len(array))
	categoryIDs := make([]int16, 0, len(array))
	for i, post := range array {
		postIDs[i] = post.ID
		if post.CategoryID != nil {
			categoryIDs = append(categoryIDs, *post.CategoryID)
		}
	}

	// 게시물 ID 카테고리 확인
	categoryMap, err := s.categoryRepo.FindByIDs(ctx, categoryIDs)
	if err != nil {
		return nil, err
	}

	// 게시물 ID 태그 확인
	tagMap, err := s.tagRepo.FindByPostID(ctx, postIDs)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.PostPublic, len(array))
	for idx, post := range array {
		// 게시물 유니코드 150자 절삭
		var excerpt string
		var category *dto.CategoryPublic
		var postTag []dto.TagPublic

		runes := []rune(post.Content)
		if len(runes) > 150 {
			excerpt = string(runes[:150])
		} else {
			excerpt = string(runes)
		}

		if post.CategoryID != nil {
			CategoryData := categoryMap[*post.CategoryID]
			category = &dto.CategoryPublic{
				ID: CategoryData.ID,
				ParentID: CategoryData.ParentID,
				Path: CategoryData.Path,
				Name: CategoryData.Name,
				Slug: CategoryData.Slug,
			}

		}

		postTag = make([]dto.TagPublic, len(tagMap[post.ID]))
		for idx, tagData := range tagMap[post.ID] {
			postTag[idx] = dto.TagPublic{
				ID: tagData.ID,
				Name: tagData.Name,
				Slug: tagData.Slug,
			}
		}

		result[idx] = &dto.PostPublic{
			ID: post.ID,
			Slug: post.Slug,
			Title: post.Title,
			Excerpt: excerpt,
			Thumbnail: post.Thumbnail,
			PublishedAt: post.PublishedAt,
			UpdatedAt: post.UpdatedAt,
			Category: category,
			Tags: postTag,
		}
	}

	var TotalPages int = (total + req.PageLimit - 1) / req.PageLimit

	res := &dto.ListPostsResponse{
		Meta: dto.ListPostsMetaData{
			Pagination: dto.ListPostsPagination{
				Page:        req.Page,
				PageLimit:   req.PageLimit,
				Total:       total, // DB에서 COUNT 쿼리로 가져온 전체 수
				TotalPages:  (total + req.PageLimit - 1) / req.PageLimit,
				HasNextPage: req.Page < TotalPages,
				HasPrevPage: req.Page > 1,
			},
			Sort: dto.SortMeta{
				SortBy: req.SortBy,
				SortDir: req.SortDir,
			},
			Filter: dto.ListPostsFilter{
				ID: req.ID,
				AccountID: req.AccountID,
				Slug: req.Slug,
				Title: req.Title,
				CategoryID: req.CategoryID,
				TagSlugs: req.TagSlugs,
				IsPrivate: req.IsPrivate,
			},
		},
		Datas: result,
	}

	return res, nil
}