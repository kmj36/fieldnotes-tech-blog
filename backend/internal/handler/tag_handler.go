package handler

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
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

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	// 태그 추가 처리
	tag, err := h.service.Create(ctx, &req) 
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrCreated.Status, dto.ResponseWrapper[*dto.CreateTagResponse]{
		Status: dto.ErrCreated.Status,
		Code: dto.ErrCreated.Code,
		Detail: fmt.Sprintf("Successfully created '%s' tag fields.", tag.Name),
		Message: dto.ErrCreated.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: tag,
	})
}

func (h *TagHandler) List(ctx *gin.Context) {
	var req dto.ReadTagsRequest
	
	req.SetDefaults()

	if err := ctx.ShouldBindQuery(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	tags, err := h.service.List(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.ReadTagsResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Detail: fmt.Sprintf("Successfully retrieved %d tags.", len(tags.Datas)),
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: tags,
	})
}

func (h *TagHandler) Update(ctx *gin.Context) {
	var req dto.UpdateTagRequest

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

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.UpdateTagResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Detail: fmt.Sprintf("Successfully changed '%s' tag fields.", res.Data.Slug),
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: res,
	})
}

func (h *TagHandler) Delete(ctx *gin.Context) {
	var req dto.DeleteTagRequest

	if err := ctx.ShouldBindUri(&req) ; err != nil {
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
		Detail: fmt.Sprintf("Successfully deleted '%s' tag.", res.Name),
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
	})
}