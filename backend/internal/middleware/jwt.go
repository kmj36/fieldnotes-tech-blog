package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
)

func JWTAuthMiddleware(jwtmanager *cryption.JWTManager) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		authHeader := ctx.GetHeader("Authorization")

		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
				Status: http.StatusUnauthorized,
				Code: dto.ErrUnauthorized.Code,
				Message: dto.ErrUnauthorized.Message,
				Detail: "Invaild admin credentials",
				Timestamp: time.Now().UTC(),
				Path: ctx.Request.URL.Path,
			})
			ctx.Abort()
			return
		}

		token, err := jwtmanager.ValidateJWT(parts[1])

		if err != nil || token == nil || !token.Valid {
			ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
				Status: http.StatusUnauthorized,
				Code: dto.ErrUnauthorized.Code,
				Message: dto.ErrUnauthorized.Message,
				Detail: "Invalid admin credentials.",
				Timestamp: time.Now().UTC(),
				Path: ctx.Request.URL.Path,
			})
			ctx.Abort()
			return
		}

		// claims 추출 후 ctx에 저장 추가
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
				Status: http.StatusUnauthorized,
				Code: "E401_001",
				Message: "인증에 실패하였습니다.",
				Detail: "Invalid admin credentials.",
				Timestamp: time.Now().UTC(),
				Path: ctx.Request.URL.Path,
			})
			ctx.Abort()
			return
		}

		ctx.Set("account_id", claims["sub"])  // "admin"
		ctx.Set("role", claims["role"])  // "ADMIN"

		ctx.Next()
	}
}