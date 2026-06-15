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
	postRepo     *repository.PostRepository
	tagRepo      *repository.TagRepository
	categoryRepo *repository.CategoryRepository
	accountRepo  *repository.AccountRepository
	jwt          *cryption.JWTManager
}

func NewPostService(postRepo *repository.PostRepository, tagRepo *repository.TagRepository, categoryRepo *repository.CategoryRepository, accountRepo *repository.AccountRepository, jwtManager *cryption.JWTManager) *PostService {
	return &PostService{
		postRepo:     postRepo,
		tagRepo:      tagRepo,
		categoryRepo: categoryRepo,
		accountRepo:  accountRepo,
		jwt:          jwtManager,
	}
}

func (s *PostService) Create(ctx *gin.Context, req *dto.CreatePostRequest) (*dto.CreatePostResponse, error) {
	// 게시물 중복 여부 확인
	existing, err := s.postRepo.FindBySlug(ctx, req.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrAlreadyExists
	}

	// 카테고리 ID 존재 여부 확인
	category, err := s.resolveCategory(ctx, req.CategoryID)
	if err != nil {
		return nil, err
	}

	// 태그 Slugs 존재 여부 확인
	tags, tagDatas, err := s.resolveTags(ctx, req.TagSlugs)
	if err != nil {
		return nil, err
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
	isPrivate, publishedAt := resolvePublishState(req.IsPrivate)

	// Post Create 모델 생성
	newPost := &model.Post{
		AccountID:   account.AccountID,
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		Thumbnail:   req.Thumbnail,
		CategoryID:  req.CategoryID,
		IsPrivate:   isPrivate,
		PublishedAt: publishedAt,
	}

	// 게시물 DB 컬럼 등록 시도
	post, err := s.postRepo.Create(ctx, newPost, tagDatas)
	if err != nil {
		return nil, err
	}

	return &dto.CreatePostResponse{
		PostPublic: dto.PostPublic{
			ID: post.ID,

			AccountID: post.AccountID,
			Nickname:  account.Nickname,

			Slug:      post.Slug,
			Title:     post.Title,
			Excerpt:   buildExcerpt(post.Content),
			Thumbnail: post.Thumbnail,

			IsPrivate: post.IsPrivate,

			CreatedAt:   post.CreatedAt,
			UpdatedAt:   post.UpdatedAt,
			PublishedAt: post.PublishedAt,

			Category: category,
			Tags:     tags,
		},
	}, nil
}

// 카테고리 ID 존재 여부 확인 및 DTO 변환
func (s *PostService) resolveCategory(ctx *gin.Context, categoryID *int16) (*dto.CategoryPublic, error) {
	if categoryID == nil {
		return nil, nil
	}

	categoryData, err := s.categoryRepo.FindByID(ctx, *categoryID)
	if err != nil {
		return nil, err
	}
	if categoryData == nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &dto.CategoryPublic{
		ID:       categoryData.ID,
		ParentID: categoryData.ParentID,
		Path:     categoryData.Path,
		Name:     categoryData.Name,
		Slug:     categoryData.Slug,
	}, nil
}

// 태그 Slugs 존재 여부 확인 및 DTO 변환
func (s *PostService) resolveTags(ctx *gin.Context, tagSlugs []string) ([]dto.TagPublic, []*model.Tag, error) {
	if len(tagSlugs) == 0 {
		return nil, nil, nil
	}

	tagDatas, err := s.tagRepo.FindBySlugs(ctx, tagSlugs)
	if err != nil {
		return nil, nil, err
	}

	tags := make([]dto.TagPublic, len(tagDatas))
	for idx, item := range tagDatas {
		tags[idx] = dto.TagPublic{
			ID:   item.ID,
			Name: item.Name,
			Slug: item.Slug,
		}
	}

	return tags, tagDatas, nil
}

// 발행/비공개 상태 결정
func resolvePublishState(reqIsPrivate *bool) (bool, *time.Time) {
	if reqIsPrivate != nil && *reqIsPrivate {
		return true, nil
	}
	now := time.Now().UTC()
	return false, &now
}

// 게시물 유니코드 150자 절삭
func buildExcerpt(content string) string {
	runes := []rune(content)
	if len(runes) > 150 {
		return string(runes[:150])
	}
	return string(runes)
}

// Public Post List API
func (s *PostService) List(ctx *gin.Context, req *dto.ListPostsRequest, isAuthenticated bool) (*dto.ListPostsResponse, error) {
	// 하위 카테고리 포함 처리
	s.expandCategoryFilter(ctx, req)

	array, total, err := s.postRepo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	// 게시물 ID, 카테고리 ID, 계정ID 목록 추출
	postIDs, categoryIDs, accountIDs := extractPostRelatedIDs(array)

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

	result := make([]*dto.PostPublic, len(array))
	for idx, post := range array {
		result[idx] = buildPostPublic(post, categoryMap, tagMap, accountMap, isAuthenticated)
	}

	return &dto.ListPostsResponse{
		Meta:  buildListPostsMeta(req, total),
		Datas: result,
	}, nil
}

// 하위 카테고리 포함을 위해 categoryID를 path prefix로 확장
func (s *PostService) expandCategoryFilter(ctx *gin.Context, req *dto.ListPostsRequest) {
	if req.CategoryID == nil {
		return
	}

	category, err := s.categoryRepo.FindByID(ctx, *req.CategoryID)
	if err != nil || category == nil {
		return
	}

	ids, err := s.categoryRepo.FindByIDsPathPrefix(ctx, category.Path)
	if err != nil || len(ids) == 0 {
		return
	}

	req.CategoryIDs = ids
}

// 게시물 목록에서 카테고리/계정 조회용 ID 목록 추출
func extractPostRelatedIDs(posts []*model.Post) ([]int, []int16, []string) {
	postIDs := make([]int, len(posts))
	categoryIDs := make([]int16, 0, len(posts))
	accountIDs := make([]string, len(posts))

	for i, post := range posts {
		postIDs[i] = post.ID
		accountIDs[i] = post.AccountID

		if post.CategoryID != nil {
			categoryIDs = append(categoryIDs, *post.CategoryID)
		}
	}

	return postIDs, categoryIDs, accountIDs
}

// 게시물 모델 + 조회 맵들을 PostPublic DTO로 변환
func buildPostPublic(
	post *model.Post,
	categoryMap map[int16]*model.Category,
	tagMap map[int][]*model.Tag,
	accountMap map[string]*model.Account,
	isAuthenticated bool,
) *dto.PostPublic {
	accountId := ""
	if isAuthenticated {
		accountId = post.AccountID
	}

	return &dto.PostPublic{
		ID: post.ID,

		Nickname:  accountMap[post.AccountID].Nickname,
		AccountID: accountId,

		Slug:      post.Slug,
		Title:     post.Title,
		Excerpt:   buildExcerpt(post.Content),
		Thumbnail: post.Thumbnail,

		IsPrivate: post.IsPrivate,

		CreatedAt:   post.CreatedAt,
		PublishedAt: post.PublishedAt,
		UpdatedAt:   post.UpdatedAt,

		Category: buildCategoryPublic(post.CategoryID, categoryMap),
		Tags:     buildPostTags(tagMap[post.ID]),
	}
}

// 카테고리 ID로 CategoryPublic DTO 변환
func buildCategoryPublic(categoryID *int16, categoryMap map[int16]*model.Category) *dto.CategoryPublic {
	if categoryID == nil {
		return nil
	}

	data := categoryMap[*categoryID]
	return &dto.CategoryPublic{
		ID:       data.ID,
		ParentID: data.ParentID,
		Path:     data.Path,
		Name:     data.Name,
		Slug:     data.Slug,
	}
}

// 태그 모델 목록을 TagPublic DTO 목록으로 변환
func buildPostTags(tagDatas []*model.Tag) []dto.TagPublic {
	tags := make([]dto.TagPublic, len(tagDatas))
	for idx, tagData := range tagDatas {
		tags[idx] = dto.TagPublic{
			ID:   tagData.ID,
			Name: tagData.Name,
			Slug: tagData.Slug,
		}
	}
	return tags
}

// 페이지네이션/정렬/필터 메타데이터 조립
func buildListPostsMeta(req *dto.ListPostsRequest, total int) dto.ListPostsMetaData {
	totalPages := (total + req.PageLimit - 1) / req.PageLimit

	return dto.ListPostsMetaData{
		Pagination: dto.ListPostsPagination{
			Page:        req.Page,
			PageLimit:   req.PageLimit,
			Total:       total, // DB에서 COUNT 쿼리로 가져온 전체 수
			TotalPages:  totalPages,
			HasNextPage: req.Page < totalPages,
			HasPrevPage: req.Page > 1,
		},
		Sort: dto.SortMeta{
			SortBy:  req.SortBy,
			SortDir: req.SortDir,
		},
		Filter: dto.ListPostsFilter{
			Match: dto.ListPostsMatchFilters{
				MatchType: req.MatchType,

				ID:        req.ID,
				AccountID: req.AccountID,
				Nickname:  req.Nickname,

				Slug:  req.Slug,
				Title: req.Title,

				CategoryID: req.CategoryID,
				TagSlugs:   req.TagSlugs,

				IsPrivate: req.IsPrivate,
			},
			Date: dto.ListPostsDateFilters{
				DateFilter: req.DateFilter,
				DateTarget: req.DateTarget,
				DateFrom:   req.DateFrom,
				DateTo:     req.DateTo,
			},
		},
	}
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
			ID:       categoryData.ID,
			ParentID: categoryData.ParentID,
			Path:     categoryData.Path,
			Name:     categoryData.Name,
			Slug:     categoryData.Slug,
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
			ID:   tagData.ID,
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

				Nickname:  account.Nickname,
				AccountID: accountId,

				Slug:      post.Slug,
				Title:     post.Title,
				Excerpt:   excerpt,
				Thumbnail: post.Thumbnail,

				IsPrivate: post.IsPrivate,

				CreatedAt:   post.CreatedAt,
				UpdatedAt:   post.UpdatedAt,
				PublishedAt: post.PublishedAt,

				Category: category,
				Tags:     postTag,
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

	updates := map[string]interface{}{}
	changedFields := []string{}

	// 업데이트할 일반 필드 판별
	applySimpleFieldUpdates(req, existing, updates, &changedFields)

	// 카테고리 필드 업데이트 여부 확인
	category, err := s.resolveUpdateCategory(ctx, req.CategoryID, existing.CategoryID, updates, &changedFields)
	if err != nil {
		return nil, err
	}

	// 태그 필드 업데이트 여부 확인
	tags, tagDatas, err := s.resolveUpdateTags(ctx, req.TagSlugs, &changedFields)
	if err != nil {
		return nil, err
	}

	// 공개여부 변경 업데이트 판별
	applyPrivacyUpdate(req, existing, updates, &changedFields)

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

	return &dto.UpdatePostResponse{
		Data: dto.PostDetail{
			Content: data.Content,
			PostPublic: dto.PostPublic{
				ID: data.ID,

				Nickname:  account.Nickname,
				AccountID: data.AccountID,

				Slug:      data.Slug,
				Title:     data.Title,
				Excerpt:   buildExcerpt(data.Content),
				Thumbnail: data.Thumbnail,

				IsPrivate: data.IsPrivate,

				CreatedAt:   data.CreatedAt,
				PublishedAt: data.PublishedAt,
				UpdatedAt:   data.UpdatedAt,

				Category: category,
				Tags:     tags,
			},
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}, nil
}

// slug, title, content, thumbnail 변경 여부 판별
func applySimpleFieldUpdates(req *dto.UpdatePostRequest, existing *model.Post, updates map[string]interface{}, changedFields *[]string) {
	if req.Slug != nil && *req.Slug != existing.Slug {
		updates["slug"] = req.Slug
		*changedFields = append(*changedFields, "slug")
	}
	if req.Title != nil && *req.Title != existing.Title {
		updates["title"] = req.Title
		*changedFields = append(*changedFields, "title")
	}
	if req.Content != nil && *req.Content != existing.Content {
		updates["content"] = req.Content
		*changedFields = append(*changedFields, "content")
	}

	if req.Thumbnail == nil {
		return
	}
	existingThumbnail := ""
	if existing.Thumbnail != nil {
		existingThumbnail = *existing.Thumbnail
	}
	if *req.Thumbnail != existingThumbnail {
		updates["thumbnail"] = req.Thumbnail
		*changedFields = append(*changedFields, "thumbnail")
	}
}

// 카테고리 ID 조회 + 변경 여부 판별
func (s *PostService) resolveUpdateCategory(ctx *gin.Context, newCategoryID, existingCategoryID *int16, updates map[string]interface{}, changedFields *[]string) (*dto.CategoryPublic, error) {
	if newCategoryID == nil {
		return nil, nil
	}

	categoryData, err := s.categoryRepo.FindByID(ctx, *newCategoryID)
	if err != nil {
		return nil, err
	}
	if categoryData == nil {
		return nil, gorm.ErrRecordNotFound
	}

	var existingID int16
	if existingCategoryID != nil {
		existingID = *existingCategoryID
	}
	if *newCategoryID != existingID {
		updates["category_id"] = newCategoryID
		*changedFields = append(*changedFields, "categoryId")
	}

	return &dto.CategoryPublic{
		ID:       categoryData.ID,
		ParentID: categoryData.ParentID,
		Path:     categoryData.Path,
		Name:     categoryData.Name,
		Slug:     categoryData.Slug,
	}, nil
}

// 태그 Slugs 조회 + 변환
func (s *PostService) resolveUpdateTags(ctx *gin.Context, tagSlugs *[]string, changedFields *[]string) ([]dto.TagPublic, []*model.Tag, error) {
	if tagSlugs == nil {
		return nil, nil, nil
	}
	*changedFields = append(*changedFields, "tags")

	if len(*tagSlugs) == 0 {
		return nil, nil, nil
	}

	tagDatas, err := s.tagRepo.FindBySlugs(ctx, *tagSlugs)
	if err != nil {
		return nil, nil, err
	}

	return buildPostTags(tagDatas), tagDatas, nil
}

// 공개여부 변경 + 최초 발행시각 설정
func applyPrivacyUpdate(req *dto.UpdatePostRequest, existing *model.Post, updates map[string]interface{}, changedFields *[]string) {
	if req.IsPrivate == nil || *req.IsPrivate == existing.IsPrivate {
		return
	}

	if !*req.IsPrivate && existing.PublishedAt == nil {
		updates["published_at"] = time.Now().UTC()
		*changedFields = append(*changedFields, "publishedAt")
	}

	updates["is_private"] = req.IsPrivate
	*changedFields = append(*changedFields, "isPrivate")
}

func (s *PostService) Delete(ctx *gin.Context, req *dto.DeletePostRequest) (*dto.DeletePostResponse, error) {
	// 게시물이 존재하는지 확인
	exist, err := s.postRepo.FindByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if exist == nil {
		return nil, gorm.ErrRecordNotFound
	}

	// 게시물 삭제 Repository 계층 요청
	result, err := s.postRepo.Delete(ctx, req)
	if err != nil {
		return nil, err
	}

	// service 계층 반환값 생성
	res := &dto.DeletePostResponse{
		ID: result.ID,
	}

	return res, nil
}
