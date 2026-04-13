package handler

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
)

type BaseHandler struct {}

func (h *BaseHandler) respondBindError(ctx *gin.Context, err error) {
	var ve validator.ValidationErrors
    switch {
    case errors.As(err, &ve):
        fe := ve[0]
        ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
            Status:    http.StatusBadRequest,
            Code:      dto.ErrBadRequestType.Code,
            Detail:    fmt.Sprintf("'%s' does not satisfy '%s' condition", fe.Field(), fe.Tag()),
            Message:   dto.ErrBadRequestType.Message,
            Timestamp: time.Now().UTC(),
            Path:      ctx.Request.URL.Path,
        })
    case errors.Is(err, io.EOF):
        ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
            Status:    http.StatusBadRequest,
            Code:      dto.ErrBadRequestMissing.Code,
            Detail:    "request body is empty",
            Message:   dto.ErrBadRequestMissing.Message,
            Timestamp: time.Now().UTC(),
            Path:      ctx.Request.URL.Path,
        })
	case errors.Is(err, dto.CErrLoginFailed):
		ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
			Status: http.StatusUnauthorized,
			Code: dto.ErrUnauthorized.Code,
			Message: dto.ErrUnauthorized.Message,
			Detail: dto.CErrLoginFailed.Error(),
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	case errors.Is(err, dto.CErrUpdateEmptyParam):
		ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
			Status: http.StatusBadRequest,
			Code: dto.ErrBadRequestMissing.Code,
			Message: dto.ErrBadRequestMissing.Message,
			Detail: dto.CErrUpdateEmptyParam.Error(),
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
    default:
        ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
            Status:    http.StatusBadRequest,
            Code:      dto.ErrBadRequestMissing.Code,
            Detail:    err.Error(),
            Message:   dto.ErrBadRequestMissing.Message,
            Timestamp: time.Now().UTC(),
            Path:      ctx.Request.URL.Path,
        })
    }
}

func (h *BaseHandler) respondProcessError(ctx *gin.Context, err error) {
	switch {
	case errors.Is(err, dto.CErrAccountAlreadyExists),
		 errors.Is(err, dto.CErrNicknameAlreadyExists),
		 errors.Is(err, dto.CErrCategoryAlreadyExists):
		ctx.JSON(http.StatusConflict, dto.ResponseWrapper[any]{
			Status: http.StatusConflict,
			Code: dto.ErrConflict.Code,
			Detail: err.Error(),
			Message: dto.ErrConflict.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	case errors.Is(err, dto.CErrLoginFailed):
		ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
			Status: http.StatusUnauthorized,
			Code: dto.ErrUnauthorized.Code,
			Detail: err.Error(),
			Message: dto.ErrUnauthorized.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	default:
		ctx.JSON(http.StatusInternalServerError, dto.ResponseWrapper[any]{
			Status:    http.StatusInternalServerError,
			Code:      dto.ErrInternal.Code,
			Detail:    err.Error(),
			Message:   dto.ErrInternal.Message,
			Timestamp: time.Now().UTC(),
			Path:      ctx.Request.URL.Path,
		})
	}
}