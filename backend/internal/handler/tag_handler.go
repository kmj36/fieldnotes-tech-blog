package handler

import (
	"net/http"
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