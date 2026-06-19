package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/validator"
)

// 환경 변수 구조체
type Config struct {
	ServerAddr     string
	ApiMode        string
	AllowedOrigins []string
	JWTSecret      []byte
	JWTExpiry      time.Duration
	DB             DBConfig
}

// DB 관련 환경 변수 구조체
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	TimeZone string
}

/*
.env 파일의 환경 변수을 가져오는 함수입니다.
정상적으로 환경 변수를 가져오면 *Config 구조체와, nil 를 반환합니다.
*/
func Load() (*Config, error) {
	_ = godotenv.Load() // 로컬 개발용

	cfg := &Config{
		ServerAddr:     os.Getenv("API_ADDR") + ":" + os.Getenv("API_PORT"),
		ApiMode:        os.Getenv("API_MODE"),
		AllowedOrigins: parseOrigins(os.Getenv("API_ALLOW_ORIGINS")),
		JWTSecret:      []byte(os.Getenv("API_JWT_SECRET")),
		DB: DBConfig{
			Host:     os.Getenv("DB_HOST"),
			Port:     os.Getenv("DB_PORT"),
			User:     os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			DBName:   os.Getenv("DB_DATABASE"),
			SSLMode:  os.Getenv("DB_SSLMODE"),
			TimeZone: os.Getenv("DB_TIMEZONE"),
		},
	}

	var errJWT error
	cfg.JWTExpiry, errJWT = time.ParseDuration(os.Getenv("API_JWT_EXPIRE"))
	if errJWT != nil {
		return nil, errJWT
	}

	if errValid := validator.ValidateHostPort(cfg.ServerAddr); errValid != nil {
		return nil, errValid
	}

	if len(cfg.JWTSecret) == 0 {
		return nil, fmt.Errorf("JWT Secret is required")
	}
	if cfg.DB.Host == "" {
		return nil, fmt.Errorf("DB Host is required")
	}

	return cfg, nil
}

func parseOrigins(env string) []string {
	parts := strings.Split(env, ",")
	out := make([]string, 0, len(parts))

	for _, p := range parts {
		out = append(out, strings.TrimSpace(p))
	}

	return out
}
