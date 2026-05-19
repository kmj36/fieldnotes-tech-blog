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
	accountRepo *repository.AccountRepository
	jwt *cryption.JWTManager
}

func NewPostService(postRepo *repository.PostRepository, tagRepo *repository.TagRepository, categoryRepo *repository.CategoryRepository, accountRepo *repository.AccountRepository, jwtManager *cryption.JWTManager) *PostService {
	return &PostService{
		postRepo: postRepo,
		tagRepo: tagRepo,
		categoryRepo: categoryRepo,
		accountRepo: accountRepo,
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

	// JWT Claim 에서 계정 ID 추출 및 계정 조회
	accountId := ctx.GetString("accountId")
	if accountId == "" {
		return nil, dto.CErrLoginFailed
	}
	account, err := s.accountRepo.FindByAccountID(ctx, accountId)
	if err != nil {
		return nil, err
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
		AccountID: account.AccountID,
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

			AccountID: post.AccountID,
			Nickname: account.Nickname,

			Slug: post.Slug,
			Title: post.Title,
			Excerpt: excerpt,
			Thumbnail: post.Thumbnail,

			IsPrivate: post.IsPrivate,

			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
			PublishedAt: post.PublishedAt,

			Category: category,
			Tags: tags, 
		},
	}

	return res, nil
}

// Public Post List API
func (s *PostService) List(ctx *gin.Context, req *dto.ListPostsRequest, isAuthenticated bool) (*dto.ListPostsResponse, error) {
	accountId := ""
	var result []*dto.PostPublic
	
	array, total, err := s.postRepo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	// 게시물 ID, 카테고리 ID, 계정ID 목록 추출
	postIDs := make([]int, len(array))
	categoryIDs := make([]int16, 0, len(array))
	accountIDs := make([]string, len(array))

	for i, post := range array {
		postIDs[i] = post.ID
		accountIDs[i] = post.AccountID

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

	// 게시물 ID 계정 확인
	accountMap, err := s.accountRepo.FindByAccountIDs(ctx, accountIDs)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.PostPublic, len(array))
	for idx, post := range array {
		var excerpt string
		var category *dto.CategoryPublic
		var postTag []dto.TagPublic

		// 게시물 유니코드 150자 절삭
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

		if isAuthenticated {
			accountId = post.AccountID
		}

		result[idx] = &dto.PostPublic{
			ID: post.ID,

			Nickname: accountMap[post.AccountID].Nickname,
			AccountID: accountId,

			Slug: post.Slug,
			Title: post.Title,
			Excerpt: excerpt,
			Thumbnail: post.Thumbnail,
			
			IsPrivate: post.IsPrivate,

			CreatedAt: post.CreatedAt,
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
				Match: dto.ListPostsMatchFilters{
					MatchType: req.MatchType,

					ID: req.ID,
					AccountID: req.AccountID,
					Nickname: req.Nickname,

					Slug: req.Slug,
					Title: req.Title,

					CategoryID: req.CategoryID,
					TagSlugs: req.TagSlugs,

					IsPrivate: req.IsPrivate,
				},
				Date: dto.ListPostsDateFilters{
					DateFilter: req.DateFilter,
					DateTarget: req.DateTarget,
					DateFrom: req.DateFrom,
					DateTo: req.DateTo,
				},
			},
		},
		Datas: result,
	}

	return res, nil
}

// Public Post Read API
func (s *PostService) Read(ctx *gin.Context, req *dto.ReadPostRequest, isAuthenticated bool) (*dto.ReadPostResponse, error) {
	accountId := ""
	var category *dto.CategoryPublic
	
	post, err := s.postRepo.FindBySlug(ctx, req.Slug)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, gorm.ErrRecordNotFound
	}
	if isAuthenticated {
		accountId = post.AccountID
	}
	if post.IsPrivate && !isAuthenticated {
		return nil, dto.CErrForbidden
	}

	// 게시물 ID 카테고리 확인
	if post.CategoryID != nil {
		categoryData, err := s.categoryRepo.FindByID(ctx, *post.CategoryID)
		if err != nil {
			return nil, err
		}
		category = &dto.CategoryPublic{
			ID: categoryData.ID,
			ParentID: categoryData.ParentID,
			Path: categoryData.Path,
			Name: categoryData.Name,
			Slug: categoryData.Slug,
		}
	}

	// 게시물 ID 태그 확인
	tagMap, err := s.tagRepo.FindByPostID(ctx, []int{post.ID})
	if err != nil {
		return nil, err
	}
	postTag := make([]dto.TagPublic, len(tagMap[post.ID]))
	for idx, tagData := range tagMap[post.ID] {
		postTag[idx] = dto.TagPublic{
			ID: tagData.ID,
			Name: tagData.Name,
			Slug: tagData.Slug,
		}
	}

	// 게시물 ID 계정 확인
	account, err := s.accountRepo.FindByAccountID(ctx, post.AccountID)
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

	res := &dto.ReadPostResponse{
		PostDetail: dto.PostDetail{
			Content: post.Content,
			PostPublic: dto.PostPublic{
				ID: post.ID,
				
				Nickname: account.Nickname,
				AccountID: accountId,
				
				Slug: post.Slug,
				Title: post.Title,
				Excerpt: excerpt,
				Thumbnail: post.Thumbnail,

				IsPrivate: post.IsPrivate,

				CreatedAt: post.CreatedAt,
				UpdatedAt: post.UpdatedAt,
				PublishedAt: post.PublishedAt,
				
				Category: category,
				Tags: postTag,
			},
		},
	}

	return res, nil
}

func (s *PostService) Update(ctx *gin.Context, req *dto.UpdatePostRequest) (*dto.UpdatePostResponse, error) {
	// 게시물 존재 여부 확인
	existing, err := s.postRepo.FindByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, gorm.ErrRecordNotFound
	}

	// 필요 변수 초기화
	var tagDatas	[]*model.Tag
	var category	*dto.CategoryPublic
	var tags		[]dto.TagPublic

	updates := map[string]interface{}{}
	changedFields := []string{}
	
	// 업데이트할 일반 필드 판별
	if req.Slug != nil && *req.Slug != existing.Slug {
		updates["slug"] = req.Slug
		changedFields = append(changedFields, "slug")
	}
	if req.Title != nil && *req.Title != existing.Title {
		updates["title"] = req.Title
		changedFields = append(changedFields, "title")
	}
	if req.Content != nil && *req.Content != existing.Content {
		updates["content"] = req.Content
		changedFields = append(changedFields, "content")
	}
	if req.Thumbnail != nil {
		existingData := ""
		if existing.Thumbnail != nil {
			existingData = *existing.Thumbnail
		}
		if *req.Thumbnail != existingData {
			updates["thumbnail"] = req.Thumbnail
			changedFields = append(changedFields, "thumbnail")
		}
	}

	// 카테고리 필드 업데이트 여부 확인
	if req.CategoryID != nil {
		var existingData int16
		if existing.CategoryID != nil {
			existingData = *existing.CategoryID
		}
		
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

		if *req.CategoryID != existingData {
			updates["category_id"] = req.CategoryID
			changedFields = append(changedFields, "categoryId")
		}
	}
	// 태그 필드 업데이트 여부 확인
	if req.TagSlugs != nil {
		if len(*req.TagSlugs) > 0 {
			var err error
			tagDatas, err = s.tagRepo.FindBySlugs(ctx, *req.TagSlugs)
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

		changedFields = append(changedFields, "tags")
	}
	
	// 공개여부 변경 업데이트 판별
	if req.IsPrivate != nil && *req.IsPrivate != existing.IsPrivate {
		if *req.IsPrivate == false && existing.PublishedAt == nil {
			updates["published_at"] = time.Now().UTC()
			changedFields = append(changedFields, "publishedAt")
		}

		updates["is_private"] = req.IsPrivate
		changedFields = append(changedFields, "isPrivate")
	}

	// 업데이트하지 않는 경우 반환
	if len(updates) == 0 && len(changedFields) == 0 {
		return nil, dto.CErrUpdateEmptyParam
	}

	// 게시물 업데이트
	data, err := s.postRepo.Update(ctx, req, updates, tagDatas)
	if err != nil || data == nil {
		return nil, err
	}

	// 닉네임 반환을 위한 게시물 사용자ID 조회
	account, err := s.accountRepo.FindByAccountID(ctx, data.AccountID)
	if err != nil {
		return nil, err
	}

	// 게시물 유니코드 150자 절삭
	var excerpt string
	runes := []rune(data.Content)
	if len(runes) > 150 {
		excerpt = string(runes[:150])
	} else {
		excerpt = string(runes)
	}

	// 반환 데이터 초기화
	res := &dto.UpdatePostResponse{
		Data: dto.PostDetail{
			Content: data.Content,
			PostPublic: dto.PostPublic{
				ID: data.ID,

				Nickname: account.Nickname,
				AccountID: data.AccountID,

				Slug: data.Slug,
				Title: data.Title,
				Excerpt: excerpt,
				Thumbnail: data.Thumbnail,

				IsPrivate: data.IsPrivate,

				CreatedAt: data.CreatedAt,
				PublishedAt: data.PublishedAt,
				UpdatedAt: data.UpdatedAt,

				Category: category,
				Tags: tags,
			},
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}

	return res, nil
}