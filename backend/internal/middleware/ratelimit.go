package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type attemptInfo struct {
	count     int
	lastTry   time.Time
	lockUntil time.Time
}

var (
	loginAttempts = make(map[string]*attemptInfo)
	mu            sync.Mutex
)

func getOrCreate(ip string) *attemptInfo {
	mu.Lock()
	defer mu.Unlock()
	if _, ok := loginAttempts[ip]; !ok {
		loginAttempts[ip] = &attemptInfo{}
	}
	return loginAttempts[ip]
}

func LoginRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		info := getOrCreate(ip)

		mu.Lock()
		locked := time.Now().Before(info.lockUntil)
		mu.Unlock()

		if locked {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"message": "너무 많은 시도. 잠시 후 다시 시도하세요.",
			})
			c.Abort()
			return
		}

		c.Next()

		mu.Lock()
		defer mu.Unlock()

		if c.Writer.Status() == http.StatusUnauthorized {
			info.count++
			info.lastTry = time.Now()
			if info.count >= 5 {
				info.lockUntil = time.Now().Add(15 * time.Minute)
				info.count = 0
			}
		} else if c.Writer.Status() == http.StatusOK {
			delete(loginAttempts, ip)
		}
	}
}