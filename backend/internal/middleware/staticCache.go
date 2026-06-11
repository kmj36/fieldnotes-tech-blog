package middleware

import (
	"github.com/gin-gonic/gin"
)

func StaticCacheMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Cache-Control", "public, max-age=86400")
		ctx.Next()
	}
}
