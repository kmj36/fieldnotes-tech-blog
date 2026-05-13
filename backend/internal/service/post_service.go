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

	// JWT Claim 에서 계정 ID 추출 
	account := ctx.GetString("accountId")
	if account == "" {
		return nil, dto.CErrLoginFailed
	}

	// 게시물 발행, 비공개 여부 확인
	if req.IsPrivate == nil || !*req.IsPrivate {
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
	post, err := s.postRepo.Create(ctx, newPost)
	if err != nil {
		return nil, err
	}

	// 게시물-태그 매핑테이블 등록 시도
	tagdatas, err := s.postRepo.CreatePostTags(ctx, post.ID, req.TagSlugs)
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

	tags = make([]dto.TagPublic, len(tagdatas))
	for idx, item := range tagdatas {
		tags[idx] = dto.TagPublic{
			ID: item.ID,
			Name: item.Name,
			Slug: item.Slug,
		}
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