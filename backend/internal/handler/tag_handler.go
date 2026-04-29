package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
)

// 태그 관련 HTTP 요청/응답 처리
type TagHandler struct {
	BaseHandler
	service *service.TagService
}

func NewTagHandler(service *service.TagService) *TagHandler {
	return &TagHandler{service: service}
}

func (h *TagHandler) List(ctx *gin.Context) {
	var req dto.GetTagRequest
	var tags []*dto.TagObject
	var err error

	if bindErr := ctx.ShouldBindQuery(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}

	if tags, err = h.service.List(ctx, &req); err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[dto.ListTagsResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Message,
		Detail: "Successfully retrieved tags.",
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.ListTagsResponse{
			Meta: dto.ListTagsMeta{
				Sort: dto.SortMeta{
					SortBy: req.SortBy,
					SortDir: req.SortDir,
				},
				Limit: req.Limit,
				Filters: dto.TagSummary{
					ID: int32(req.ID),
					Name: req.Name,
					Slug: req.Slug,
				},
			},
			Data: tags,
		},
	})
}

func (h *TagHandler) Create(ctx *gin.Context) {
	var req dto.CreateTagRequest
	var tag *model.Tag
	var err error

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	// 태그 추가 처리
	if tag, err = h.service.Create(ctx, &req) ; err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusCreated, dto.ResponseWrapper[*dto.CreateTagResponse]{
		Status: http.StatusCreated,
		Code: dto.ErrCreated.Code,
		Detail: "Tag created successfully.",
		Message: dto.ErrCreated.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: &dto.CreateTagResponse{
			ID: tag.ID,
			Name: tag.Name,
			Slug: tag.Slug,
			CreatedAt: tag.CreatedAt,
			UpdatedAt: tag.UpdatedAt,
		},
	})
}

func (h *TagHandler) Update(ctx *gin.Context) {
	var req dto.UpdateTagRequest
	var data *dto.UpdateTagResponse
	var err error
	idStr := ctx.Param("id")

	if idStr == "" {
		h.respondBindError(ctx, errors.New("The 'id' parameter is empty."))
        return
	}

	id, err := strconv.ParseInt(idStr, 10, 32)
    if err != nil {
        h.respondBindError(ctx, err)
        return
    }

	if bindErr := ctx.ShouldBindJSON(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}
	
	if req == (dto.UpdateTagRequest{}) {
		h.respondBindError(ctx, dto.CErrUpdateEmptyParam)
        return
	}

	if data, err = h.service.Update(ctx, int32(id), req) ; err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[*dto.UpdateTagResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Code,
		Detail: "Successfully changed tag data.",
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: data,
	})
}