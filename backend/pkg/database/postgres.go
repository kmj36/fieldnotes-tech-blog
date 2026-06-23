package database

import (
	"fmt"

	"github.com/kmj36/fieldnotes-tech-blog/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func buildDSN(cfg config.DBConfig) string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s timezone=%s",
		cfg.Host,
		cfg.User,
		cfg.Password,
		cfg.DBName,
		cfg.Port,
		cfg.SSLMode,
		cfg.TimeZone,
	)
}

func NewPostgresDB(cfg config.DBConfig) (*gorm.DB, error) {
	dsn := buildDSN(cfg)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
