package handler

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"gorm.io/gorm"
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
	var pgErr *pgconn.PgError

	switch {
	case errors.Is(err, dto.CErrUpdateEmptyParam):
		ctx.JSON(dto.ErrBadRequestType.Status, dto.ResponseWrapper[any]{
			Status: dto.ErrBadRequestType.Status,
			Code: dto.ErrBadRequestType.Code,
			Detail: err.Error(),
			Message: dto.ErrBadRequestType.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	case errors.Is(err, dto.CErrChildNodeExists):
		ctx.JSON(dto.ErrChildNodeExists.Status, dto.ResponseWrapper[any]{
			Status: dto.ErrChildNodeExists.Status,
			Code: dto.ErrChildNodeExists.Code,
			Detail: err.Error(),
			Message: dto.ErrChildNodeExists.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	case errors.Is(err, dto.CErrAlreadyExists),
		errors.As(err, &pgErr) && pgErr.Code == "23505":
		ctx.JSON(dto.ErrAlreadyExist.Status, dto.ResponseWrapper[any]{
			Status: dto.ErrAlreadyExist.Status,
			Code: dto.ErrAlreadyExist.Code,
			Detail: err.Error(),
			Message: dto.ErrAlreadyExist.Message,
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
	case errors.Is(err, gorm.ErrRecordNotFound):
		ctx.JSON(dto.ErrNotFound.Status, dto.ResponseWrapper[any]{
			Status: dto.ErrNotFound.Status,
			Code: dto.ErrNotFound.Code,
			Detail: err.Error(),
			Message: dto.ErrNotFound.Message,
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