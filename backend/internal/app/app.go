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
	router *gin.Engine
	logger *zap.Logger

	cfg *config.Config

	healthHandler   *handler.HealthCheckHandler
	accountHandler  *handler.AccountHandler
	categoryHandler *handler.CategoryHandler
	tagHandler      *handler.TagHandler
	postHandler     *handler.PostHandler

	jwtManager *cryption.JWTManager

	db *gorm.DB
}

// app 패키지 생성자
func New(db *gorm.DB, cfg *config.Config, log *zap.Logger) *App {
	gin.SetMode(cfg.ApiMode)
	jwtManager := cryption.NewJWTManager(cfg.JWTSecret, cfg.JWTExpiry)

	accountRepo := repository.NewAccountRepository(db)
	accountService := service.NewAccountService(accountRepo, jwtManager)
	categoryRepo := repository.NewCategoryRepository(db)
	categoryService := service.NewCategoryService(categoryRepo, jwtManager)
	tagRepo := repository.NewTagRepository(db)
	tagService := service.NewTagService(tagRepo, jwtManager)
	postRepo := repository.NewPostRepository(db)

	postService := service.NewPostService(postRepo, tagRepo, categoryRepo, accountRepo, jwtManager)

	return &App{
		router: gin.New(),
		logger: log,
		cfg:    cfg,

		healthHandler:   handler.NewHealthCheckHandler(),
		accountHandler:  handler.NewAccountHandler(accountService),
		categoryHandler: handler.NewCategoryHandler(categoryService),
		tagHandler:      handler.NewTagHandler(tagService),
		postHandler:     handler.NewPostHandler(postService),

		jwtManager: jwtManager,
		db:         db,
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

	const apiV1Prefix = "/api/v1"

	// 정적파일 라우트
	static := app.router.Group(apiV1Prefix)
	{
		static.Use(middleware.StaticCacheMiddleware())
		static.Static("/static", "./static")
	}

	// 기본 라우트
	api := app.router.Group(apiV1Prefix)
	{
		api.GET("/health", app.healthHandler.HealthCheck)
		api.GET("/post", app.postHandler.List)
		api.GET("/post/:postSlug", app.postHandler.Read)
		api.GET("/category", app.categoryHandler.List)
		api.GET("/tag", app.tagHandler.List)
		api.POST("/auth/login", app.accountHandler.Login)
	}

	// 인증 라우트
	auth := app.router.Group(apiV1Prefix)
	{
		auth.Use(middleware.JWTAuthMiddleware(app.jwtManager))
		auth.POST("/auth/register", app.accountHandler.Create)
		auth.GET("/auth/list", app.accountHandler.List)
		auth.GET("/auth/:accountId", app.accountHandler.Read)
		auth.PATCH("/auth/update/:accountId", app.accountHandler.Update)
		auth.DELETE("/auth/delete/:accountId", app.accountHandler.Delete)
		auth.POST("/post", app.postHandler.Create)
		auth.PATCH("/post/:postId", app.postHandler.Update)
		auth.DELETE("/post/:postId", app.postHandler.Delete)
		auth.GET("/post/admin", app.postHandler.List)
		auth.GET("/post/admin/:postSlug", app.postHandler.Read)
		auth.POST("/category", app.categoryHandler.Create)
		auth.PATCH("/category/:id", app.categoryHandler.Update)
		auth.DELETE("/category/:id", app.categoryHandler.Delete)
		auth.POST("/tag", app.tagHandler.Create)
		auth.PATCH("/tag/:id", app.tagHandler.Update)
		auth.DELETE("/tag/:id", app.tagHandler.Delete)
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

	avatarUrl := "https://www.svgrepo.com/show/345423/admin.svg"

	newAdmin := &model.Account{
		AccountID:    "admin",
		PasswordHash: hash,
		Nickname:     "admin",
		AvatarURL:    &avatarUrl,
		Role:         "ADMIN",
		Status:       "ACTIVE",
	}

	if err := app.db.Create(newAdmin).Error; err == nil {
		app.logger.Info("[SEED] Admin account Initialized.",
			zap.String("Account: ", newAdmin.AccountID),
			zap.String("Password: ", newRandomPassword),
		)
	}
}
