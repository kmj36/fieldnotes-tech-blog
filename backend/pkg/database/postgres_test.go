package database

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/kmj36/fieldnotes-tech-blog/internal/config"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestBuildDSN(t *testing.T) {
	DBData := config.DBConfig{
		Host:     "localhost",
		User:     "DBmaster",
		Password: "60fefef4543852ba304e245396bdb7021368ed7f2560c165faacfce74211d9a4",
		DBName:   "blogDatabase",
		Port:     "15432",
		SSLMode:  "disable",
		TimeZone: "Asia/Seoul",
	}

	dsn := buildDSN(DBData)

	test := []string{
		"host=localhost",
		"user=DBmaster",
		"password=60fefef4543852ba304e245396bdb7021368ed7f2560c165faacfce74211d9a4",
		"dbname=blogDatabase",
		"port=15432",
		"sslmode=disable",
		"timezone=Asia/Seoul",
	}

	for _, want := range test {
		if !strings.Contains(dsn, want) {
			t.Errorf("DSN must contain %q, got: %v", want, dsn)
		}
	}
}

func TestNewPostgresDB_Success(t *testing.T) {
	if testing.Short() {
		t.Skip("통합 테스트는 -short 플래그에서 건너뜀")
	}

	ctx := context.Background()
	container, err := tcpostgres.Run(ctx, "postgres:16-alpine",
		tcpostgres.WithDatabase("testdb"),
		tcpostgres.WithUsername("test"),
		tcpostgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second),
		),
	)
	if err != nil {
		t.Fatalf("컨테이너 생성 실패: %v", err)
	}
	t.Cleanup(func() {
		if err := container.Terminate(ctx); err != nil {
			t.Logf("컨테이너 정리 실패: %v", err)
		}
	})

	host, err := container.Host(ctx)
	if err != nil {
		t.Fatalf("host 조회 실패: %v", err)
	}
	port, err := container.MappedPort(ctx, "5432")
	if err != nil {
		t.Fatalf("port 조회 실패: %v", err)
	}

	cfg := config.DBConfig{
		Host:     host,
		Port:     port.Port(),
		User:     "test",
		Password: "test",
		DBName:   "testdb",
		SSLMode:  "disable",
		TimeZone: "UTC",
	}

	db, err := NewPostgresDB(cfg)
	if err != nil {
		t.Fatalf("DB 연결 실패: %v", err)
	}

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	if err := sqlDB.Ping(); err != nil {
		t.Errorf("연결된 DB에 ping 실패: %v", err)
	}
}

func TestNewPostgresDB_InvalidHost(t *testing.T) {
	cfg := config.DBConfig{
		Host:     "nonexistent-host-12345",
		Port:     "5432",
		User:     "test",
		Password: "test",
		DBName:   "testdb",
		SSLMode:  "disable",
		TimeZone: "UTC",
	}

	_, err := NewPostgresDB(cfg)
	if err == nil {
		t.Fatal("존재하지 않는 호스트면 에러가 발생해야 함")
	}
}
