package main

import (
	"log"

	"github.com/kmj36/fieldnotes-tech-blog/internal/app"
	"github.com/kmj36/fieldnotes-tech-blog/internal/config"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/database"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/logger"
)

func main() {
	// 사전 설정 호출
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	// 로깅 초기화
	logger, err := logger.ZapLoggerNew(cfg.ApiMode)
	if err != nil {
		log.Fatal(err)
	}

	// 데이터베이스 객체 생성
	db, err := database.NewPostgresDB(cfg.DB)
	if err != nil {
		logger.Fatal(err.Error())
	}
	
	// App 생성
	api := app.New(db, cfg, logger)

	// API 실행
	if err := api.Run(); err != nil {
		logger.Fatal(err.Error())
	}
}
