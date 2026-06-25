package logger

import (
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func ZapLoggerNew(runMode string) (*zap.Logger, error) {
	var logger *zap.Logger
	var err error

	if runMode == gin.ReleaseMode {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}

	return logger, err
}

func ZapLoggerHandler(logger *zap.Logger, timeFormat string, isUTC bool) gin.HandlerFunc {
	return ginzap.Ginzap(logger, timeFormat, isUTC)
}

func ZapRecoveryHandler(logger *zap.Logger, stackTrace bool) gin.HandlerFunc {
	return ginzap.RecoveryWithZap(logger, stackTrace)
}
