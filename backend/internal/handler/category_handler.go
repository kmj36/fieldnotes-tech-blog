package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
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
	var category *model.Category
	var err error

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	// 계정 추가 처리
	if category, err = h.service.Create(ctx, &req) ; err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusCreated, dto.ResponseWrapper[*dto.CreateCategoryResponse]{
		Status: http.StatusCreated,
		Code: dto.ErrCreated.Code,
		Detail: "Category created successfully.",
		Message: dto.ErrCreated.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: &dto.CreateCategoryResponse{
			ID: category.ID,
			ParentID: category.ParentID,
			Name: category.Name,
			Slug: category.Slug,
			Path: category.Path,
			CreatedAt: category.CreatedAt,
			UpdatedAt: category.UpdatedAt,
		},
	})
}

func (h *CategoryHandler) List(ctx *gin.Context) {
	var req dto.GetCategoryRequest
	var categories []*dto.CategoriesObject
	var err error

	if bindErr := ctx.ShouldBindQuery(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}

	if categories, err = h.service.List(ctx, &req); err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[dto.ListCategoriesResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Message,
		Detail: "Successfully retrieved categories.",
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.ListCategoriesResponse{
			Meta: dto.ListCategoriesMeta{
				Sort: dto.SortMeta{
					SortBy: req.SortBy,
					SortDir: req.SortDir,
				},
				Limit: req.Limit,
				Filters: dto.CategorySummary{
					Id: req.ID,
					ParentId: req.ParentID,
					Name: req.Name,
					Slug: req.Slug,
				},
			},
			Data: categories,
		},
	})
}