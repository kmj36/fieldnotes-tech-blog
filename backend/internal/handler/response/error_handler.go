package response

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
)

// 404 에러 핸들링 - 정의되지 않은 라우트 공통 처리, 비즈니스 핸들러 별도 404 에러
func NoRoute() gin.HandlerFunc {
	return func (ctx *gin.Context)  {
		ctx.AbortWithStatusJSON(http.StatusNotFound, dto.ResponseWrapper[any]{
			Status: dto.ErrNotFound.Status,
			Code: dto.ErrNotFound.Code,
			Detail: ctx.Request.URL.Path + " resource not found.",
			Message: dto.ErrNotFound.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	}
}

// 405 에러 핸들링 - 정의되지 않은 메소드 처리
func NoMethod() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.AbortWithStatusJSON(http.StatusMethodNotAllowed, dto.ResponseWrapper[any]{
			Status: dto.ErrMethodNotAllowed.Status,
			Code: dto.ErrMethodNotAllowed.Code,
			Detail: ctx.Request.Method + " method not allowed.",
			Message: dto.ErrMethodNotAllowed.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	}
}