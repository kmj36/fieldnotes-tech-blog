package config

import "testing"

// 유효한 테스트 환경변수 로드
func validEnv() map[string]string {
	return map[string]string{
		"API_ADDR":          "127.0.0.1",
		"API_PORT":          "8080",
		"API_MODE":          "debug",
		"API_ALLOW_ORIGINS": "http://localhost:5137",
		"API_JWT_SECRET":    "test_jwt_secret",
		"API_JWT_EXPIRE":    "1h",
		"DB_HOST":           "localhost",
		"DB_PORT":           "5432",
		"DB_USER":           "root",
		"DB_PASSWORD":       "test_db_password",
		"DB_DATABASE":       "fieldnotesDB",
		"DB_SSLMODE":        "disable",
		"DB_TIMEZONE":       "Asia/Seoul",
	}
}

// 테스트 환경변수 로드
func setEnv(t *testing.T, overrides map[string]string) {
	env := validEnv()
	for k, v := range overrides {
		env[k] = v
	}
	for k, v := range env {
		t.Setenv(k, v)
	}
}

func TestLoad_Success(t *testing.T) {
	setEnv(t, nil)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("An unexpected error: %v", err)
	}

	if cfg.ServerAddr != "127.0.0.1:8080" {
		t.Errorf("ServerAddr = %v, want \"127.0.0.1:8080\"", cfg.ServerAddr)
	}

	if cfg.ApiMode != "debug" {
		t.Errorf("ApiMode = %v, want \"debug\"", cfg.ApiMode)
	}

	if cfg.AllowedOrigins == nil {
		t.Error("AllowedOrigins = nil, want \"[]string\"")
	}

	if cfg.AllowedOrigins[0] != "http://localhost:5137" {
		t.Errorf("AllowedOrigins[0] = %v, want \"http://localhost:5137\"", cfg.AllowedOrigins[0])
	}

	if string(cfg.JWTSecret) != "test_jwt_secret" {
		t.Errorf("JWTSecret = %v, want \"test_jwt_secret\"", string(cfg.JWTSecret))
	}

	if cfg.JWTExpiry.String() != "1h0m0s" {
		t.Errorf("JWTExpiry = %v, want \"1h0m0s\"", cfg.JWTExpiry.String())
	}

	if cfg.DB.Host != "localhost" {
		t.Errorf("DB.Host = %v, want \"localhost\"", cfg.DB.Host)
	}

	if cfg.DB.Port != "5432" {
		t.Errorf("DB.Port = %v, want \"5432\"", cfg.DB.Port)
	}

	if cfg.DB.User != "root" {
		t.Errorf("DB.User = %v, want \"root\"", cfg.DB.User)
	}

	if cfg.DB.Password != "test_db_password" {
		t.Errorf("DB.Password = %v, want \"test_db_password\"", cfg.DB.Password)
	}

	if cfg.DB.DBName != "fieldnotesDB" {
		t.Errorf("DB.DBName = %v, want \"fieldnotesDB\"", cfg.DB.DBName)
	}

	if cfg.DB.SSLMode != "disable" {
		t.Errorf("DB.SSLMode = %v, want \"disable\"", cfg.DB.SSLMode)
	}

	if cfg.DB.TimeZone != "Asia/Seoul" {
		t.Errorf("DB.TimeZone = %v, want \"Asia/Seoul\"", cfg.DB.TimeZone)
	}
}

func TestLoad_InvalidJWTExpiry(t *testing.T) {
	setEnv(t, map[string]string{"API_JWT_EXPIRE": "no-expire"})

	_, err := Load()
	t.Log(err)

	if err == nil {
		t.Fatal("API_JWT_EXPIRE, An error should occur if the time.duration format is invalid.")
	}
}

func TestLoad_InvalidServAddr(t *testing.T) {
	// IP 주소 이상 값
	setEnv(t, map[string]string{
		"API_ADDR": "localhost",
		"API_PORT": "8443",
	})

	_, err := Load()
	t.Log(err)

	if err == nil {
		t.Fatal("An error should occur if the IP:Port format is invalid.")
	}

	// Port 번호 이상 값
	setEnv(t, map[string]string{
		"API_ADDR": "127.0.0.1",
		"API_PORT": "0",
	})

	_, err = Load()
	t.Log(err)

	if err == nil {
		t.Fatal("An error should occur if the IP:Port format is invalid.")
	}
}

func TestLoad_MissingJWTSecret(t *testing.T) {
	setEnv(t, map[string]string{
		"API_JWT_SECRET": "",
	})

	_, err := Load()
	t.Log(err)

	if err == nil {
		t.Fatalf("An error should occur if the JWTSecret is missing.")
	}
	if err.Error() != "JWT Secret is required" {
		t.Errorf("err = %v, want 'JWT Secret is required'", err)
	}
}

func TestLoad_MissingDBHost(t *testing.T) {
	setEnv(t, map[string]string{
		"DB_HOST": "",
	})

	_, err := Load()
	t.Log(err)

	if err == nil {
		t.Fatalf("An error should occur if the DB.Host is missing.")
	}
	if err.Error() != "DB Host is required" {
		t.Errorf("err = %v, want 'DB Host is required'", err)
	}
}

func TestParseOrigins(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  []string
	}{
		{
			name:  "단일 origin",
			input: "http://localhost:5173",
			want:  []string{"http://localhost:5173"},
		},
		{
			name:  "여러 origin, 공백 포함",
			input: "http://localhost:5173, http://localhost:3000",
			want:  []string{"http://localhost:5173", "http://localhost:3000"},
		},
		{
			name:  "빈 문자열",
			input: "",
			want:  []string{""},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseOrigins(tt.input)
			if len(got) != len(tt.want) {
				t.Fatalf("len(got) = %v, want %v (got=%v)", len(got), len(tt.want), got)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("got[%d] = %v, want %v", i, got[i], tt.want[i])
				}
			}
		})
	}
}
