package handler

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
)

// 카테고리 관련 HTTP 요청/응답 처리
type CategoryHandler struct {
	BaseHandler
	service *service.CategoryService
}

func NewCategoryHandler(service *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

func (h *CategoryHandler) Create(ctx *gin.Context) {
	var req dto.CreateCategoryRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	// 카테고리 추가 처리
	category, err := h.service.Create(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrCreated.Status, dto.ResponseWrapper[*dto.CreateCategoryReponse]{
		Status: dto.ErrCreated.Status,
		Code: dto.ErrCreated.Code,
		Message: dto.ErrCreated.Message,
		Detail: fmt.Sprintf("Successfully added columns to '%s' category.", category.Name),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: category,
	})
}

func (h *CategoryHandler) List(ctx *gin.Context) {
	var req dto.ReadCategoriesRequest

	req.SetDefaults()

	if err := ctx.ShouldBindQuery(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	categories, err := h.service.List(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.ReadCategoriesResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully retrieved %d categories.", len(categories.Datas)),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: categories,
	})
}

func (h *CategoryHandler) Update(ctx *gin.Context) {
	var req dto.UpdateCategoryRequest

	if paramErr := ctx.ShouldBindUri(&req); paramErr != nil {
		h.respondBindError(ctx, paramErr)
		return
	}

	if bindErr := ctx.ShouldBindJSON(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}

	if err := req.Validate(); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	res, err := h.service.Update(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.UpdateCategoryResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully changed '%s' category fields.", res.Data.Name),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: res,
	})
}

func (h *CategoryHandler) Delete(ctx *gin.Context) {
	var req dto.DeleteCategoryRequest

	if err := ctx.ShouldBindUri(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	res, err := h.service.Delete(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[any]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully deleted '%s' category.", res.Name),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
	})
}