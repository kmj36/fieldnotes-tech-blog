package app

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/config"
	"github.com/kmj36/fieldnotes-tech-blog/internal/handler"
	"github.com/kmj36/fieldnotes-tech-blog/internal/handler/response"
	"github.com/kmj36/fieldnotes-tech-blog/internal/middleware"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// gin app 패키지
type App struct {
	router 		*gin.Engine
	logger		*zap.Logger

	cfg 		*config.Config

	pingHandler *handler.PingHandler
	accountHandler *handler.AccountHandler
	categoryHandler *handler.CategoryHandler

	jwtManager 	*cryption.JWTManager

	db 			*gorm.DB
}

// app 패키지 생성자
func New(db *gorm.DB, cfg *config.Config, log *zap.Logger) *App {
	gin.SetMode(cfg.ApiMode)
	jwtManager := cryption.NewJWTManager(cfg.JWTSecret, cfg.JWTExpiry)

	accountRepo := repository.NewAccountRepository(db)
	accountService := service.NewAccountService(accountRepo, jwtManager)
	categoryRepo := repository.NewCategoryRepository(db)
	categoryService :=service.NewCategoryService(categoryRepo, jwtManager)

	return &App{
		router: gin.New(),
		logger: log,
		cfg: cfg,
		
		pingHandler: handler.NewPingHandler(),
		accountHandler: handler.NewAccountHandler(accountService),
		categoryHandler: handler.NewCategoryHandler(categoryService),

		jwtManager: jwtManager,
		db: db,
	}
}

// App 객체 메소드 - Gin 실행 함수
func (app *App) Run() error {

	// 최초 관리자 계정 생성
	app.seedAdminAccount()

	app.setupMiddleware()
	app.setupErrors()
	app.setupRoutes()

	app.logger.Info("API Server started")
	return app.router.Run(app.cfg.ServerAddr)
}

// App 객체 메소드 - NoRoute, NoMethod 핸들러 설정
func (app *App) setupErrors() {
	// 404 에러 핸들링 - 정의되지 않은 라우트 처리
	app.router.NoRoute(response.NoRoute())

	// 405 에러 핸들링 - 정의되지 않은 메소드 처리
	app.router.NoMethod(response.NoMethod())
}

// App 객체 메소드 - 미들웨어 핸들러 등록
func (app *App) setupMiddleware() {
	// Zap Logger 미들웨어 핸들러
	app.router.Use(logger.ZapLoggerHandler(app.logger, time.RFC3339, true))
	app.router.Use(logger.ZapRecoveryHandler(app.logger, true))

	// CORS 미들웨어 핸들러
	app.router.Use(middleware.CORSHandler(app.cfg))
}

// App 객체 메소드 - Gin 라우팅 설정
func (app *App) setupRoutes() {

	// 기본 라우트
	api := app.router.Group("/api/v1")
	{
        api.GET("/ping", app.pingHandler.Ping)
		api.POST("/auth/login", app.accountHandler.Login)
		api.GET("/category", app.categoryHandler.List)
	}

	// 인증 라우트
	auth := app.router.Group("/api/v1")
	{
		auth.Use(middleware.JWTAuthMiddleware(app.jwtManager))
		auth.POST("/auth/register", app.accountHandler.Create)
		auth.GET("/auth/list", app.accountHandler.List)
		auth.GET("/auth/:account", app.accountHandler.Get)
		auth.PATCH("/auth/update/:account", app.accountHandler.Update)
		auth.DELETE("/auth/delete/:account", app.accountHandler.Delete)
		auth.POST("/category", app.categoryHandler.Create)
	}
}

/*
	최초 관리자 계정을 생성합니다.
	생성이 완료되면 콘솔에 해시된 비밀번호가 출력됩니다.
*/
func (app *App) seedAdminAccount() {

	var existing model.Account

	if app.db.Where("account_id = ?", "admin").First(&existing).Error == nil {
		return
	}

	var newRandomPassword string = cryption.RandomPlainPassword()
	var hash string
	hash, _ = cryption.HashPassword(newRandomPassword)

	newAdmin := &model.Account{
		AccountID: "admin",
		PasswordHash: hash,
		Nickname: "admin",
		AvatarURL: "https://www.svgrepo.com/show/345423/admin.svg",
		Role: "ADMIN",
		Status: "ACTIVE",
	}

	if err := app.db.Create(newAdmin).Error; err == nil {
		app.logger.Info("[SEED] Admin account Initialized.",
			zap.String("Account: ", newAdmin.AccountID),
			zap.String("Password: ", newRandomPassword),
		)
	}
}