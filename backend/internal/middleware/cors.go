package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/config"
)

// CORS 미들웨어 Gin 핸들러
func CORSHandler(cfg *config.Config) gin.HandlerFunc {
	return cors.New(cors.Config{
        AllowOrigins:     cfg.AllowedOrigins, // API 호출 허용 도메인
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}, // API 호출 허용 메소드
        AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Authorization", "Accept", "X-Requested-With"}, // API 호출 허용 헤더
        AllowCredentials: true, // API 호출 시 쿠키, 인증토큰 포함 허용 여부
		MaxAge:           12 * time.Hour, // preflight 요청 결과 캐시 기간
	})
}