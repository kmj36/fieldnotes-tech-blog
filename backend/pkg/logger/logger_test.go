package logger

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap/zapcore"
	"go.uber.org/zap/zaptest"
)

func TestZapLoggerNew_ReleaseMode(t *testing.T) {
	releaseRunMode := gin.ReleaseMode

	zapLogger, err := ZapLoggerNew(releaseRunMode)
	if err != nil {
		t.Fatalf("An unexpected error: %v", err)
	}
	defer zapLogger.Sync()

	if zapLogger.Core().Enabled(zapcore.DebugLevel) {
		t.Error("Debug level must be disabled in release mode.")
	}
	if !zapLogger.Core().Enabled(zapcore.InfoLevel) {
		t.Error("Info level must be enabled in release mode.")
	}
}

func TestZapLoggerNew_DebugMode(t *testing.T) {
	debugMode := gin.DebugMode

	zapLogger, err := ZapLoggerNew(debugMode)
	if err != nil {
		t.Fatalf("An unexpected error: %v", err)
	}
	defer zapLogger.Sync()

	if !zapLogger.Core().Enabled(zapcore.DebugLevel) {
		t.Error("Debug level must be enabled in debug mode.")
	}
}

func TestZapLoggerHandler(t *testing.T) {
	logger := zaptest.NewLogger(t) // 테스트 출력으로 로그를 흘려보내는 zap 로거

	handler := ZapLoggerHandler(logger, time.RFC3339, true)
	if handler == nil {
		t.Fatal("The handler must not be nil.")
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(handler)
	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %v, want %v", w.Code, http.StatusOK)
	}
}

func TestZapRecoveryHandler_RecoversFromPanic(t *testing.T) {
	logger := zaptest.NewLogger(t)

	handler := ZapRecoveryHandler(logger, true)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(handler)
	router.GET("/panic", func(c *gin.Context) {
		panic("Panic occurred")
	})

	req := httptest.NewRequest(http.MethodGet, "/panic", nil)
	w := httptest.NewRecorder()

	// panic이 복구되지 않으면 ServeHTTP 자체가 테스트를 죽임 — 복구 여부가 핵심 검증 대상
	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status = %v, want %v (500 response after panic recovery)", w.Code, http.StatusInternalServerError)
	}
}
