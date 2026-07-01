package handler

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
)

type IOHandler struct {
	BaseHandler
	service *service.IOService
}

func NewIOHandler(service *service.IOService) *IOHandler {
	return &IOHandler{service: service}
}

func (h *IOHandler) Upload(ctx *gin.Context) {
	var req dto.CreateImageRequest

	if err := ctx.ShouldBind(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	res, err := h.service.ProcessImage(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrCreated.Status, dto.ResponseWrapper[*dto.CreateImageResponse]{
		Status:    dto.ErrCreated.Status,
		Code:      dto.ErrCreated.Code,
		Message:   dto.ErrCreated.Message,
		Detail:    fmt.Sprintf("Successfully created image %s.", res.URL),
		Timestamp: time.Now().UTC(),
		Path:      ctx.Request.URL.Path,
		Result:    res,
	})
}
