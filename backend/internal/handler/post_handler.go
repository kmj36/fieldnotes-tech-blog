package handler

import (
	"fmt"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
)

type PostHandler struct {
	BaseHandler
	service *service.PostService
}

func NewPostHandler(service *service.PostService) *PostHandler {
	return &PostHandler{service: service}
}

func (h *PostHandler) Create(ctx *gin.Context) {
	var req dto.CreatePostRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	var slugRegex = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

	if !slugRegex.MatchString(req.Slug) {
		h.respondBindError(ctx, fmt.Errorf("Slug are allowed only in lowercase English letters, numbers, and hyphens."))
	}

	// 게시물 추가 처리
	post, err := h.service.Create(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
	}

	ctx.JSON(dto.ErrCreated.Status, dto.ResponseWrapper[*dto.CreatePostResponse]{
		Status:    dto.ErrCreated.Status,
		Code:      dto.ErrCreated.Code,
		Message:   dto.ErrCreated.Message,
		Detail:    fmt.Sprintf("Successfully added columns to '%s' post.", post.Slug),
		Timestamp: time.Now().UTC(),
		Path:      ctx.Request.URL.Path,
		Result:    post,
	})
}

func (h *PostHandler) List(ctx *gin.Context) {
	var req dto.ListPostsRequest

	_, isAuthenticated := ctx.Get("accountId")

	req.SetDefaults()

	if err := ctx.ShouldBindQuery(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	if !isAuthenticated {
		isPrivate := false
		req.IsPrivate = &isPrivate
		req.AccountID = nil
	}

	// 게시물 조회
	list, err := h.service.List(ctx, &req, isAuthenticated)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.ListPostsResponse]{
		Status:    dto.ErrOK.Status,
		Code:      dto.ErrOK.Code,
		Message:   dto.ErrOK.Message,
		Detail:    fmt.Sprintf("Successfully retrieved %d posts.", len(list.Datas)),
		Timestamp: time.Now().UTC(),
		Path:      ctx.Request.URL.Path,
		Result:    list,
	})
}

func (h *PostHandler) Read(ctx *gin.Context) {
	var req dto.ReadPostRequest

	_, isAuthenticated := ctx.Get("accountId")

	if err := ctx.ShouldBindUri(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	// 게시물 상세 조회
	post, err := h.service.Read(ctx, &req, isAuthenticated)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.ReadPostResponse]{
		Status:    dto.ErrOK.Status,
		Code:      dto.ErrOK.Code,
		Message:   dto.ErrOK.Message,
		Detail:    fmt.Sprintf("Successfully retrieved id:%d '%s' post.", post.ID, post.Slug),
		Timestamp: time.Now().UTC(),
		Path:      ctx.Request.URL.Path,
		Result:    post,
	})
}

func (h *PostHandler) Update(ctx *gin.Context) {
	var req dto.UpdatePostRequest

	if err := ctx.ShouldBindUri(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	if err := req.Validate(); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	// 게시물 수정
	res, err := h.service.Update(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.UpdatePostResponse]{
		Status:    dto.ErrOK.Status,
		Code:      dto.ErrOK.Code,
		Message:   dto.ErrOK.Message,
		Detail:    fmt.Sprintf("Successfully changed id:%d '%s' post fields.", res.Data.ID, res.Data.Slug),
		Timestamp: time.Now().UTC(),
		Path:      ctx.Request.URL.Path,
		Result:    res,
	})
}

func (h *PostHandler) Delete(ctx *gin.Context) {
	// HTTP 요청 바인딩 초기화
	var req dto.DeletePostRequest

	// 바인딩 수행
	if err := ctx.ShouldBindUri(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	// 게시물 삭제 서비스 계층 요청
	res, err := h.service.Delete(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	// HTTP 응답 JSON 반환
	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[any]{
		Status:    dto.ErrOK.Status,
		Code:      dto.ErrOK.Code,
		Message:   dto.ErrOK.Message,
		Detail:    fmt.Sprintf("Successfully deleted id:'%d' post.", res.ID),
		Timestamp: time.Now().UTC(),
		Path:      ctx.Request.URL.Path,
	})
}
