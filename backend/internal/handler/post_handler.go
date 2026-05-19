package handler

import (
	"fmt"
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

	// 게시물 추가 처리
	post, err := h.service.Create(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
	}

	ctx.JSON(dto.ErrCreated.Status, dto.ResponseWrapper[*dto.CreatePostResponse]{
		Status: dto.ErrCreated.Status,
		Code: dto.ErrCreated.Code,
		Message: dto.ErrCreated.Message,
		Detail: fmt.Sprintf("Successfully added columns to '%s' post.", post.Slug),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: post,
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
	list, err := h.service.List(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.ListPostsResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully retrieved %d posts.", len(list.Datas)),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: list,
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
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully retrieved id:%d '%s' post.", post.ID, post.Title),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: post,
	})
}