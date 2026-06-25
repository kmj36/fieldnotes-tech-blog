package cryption

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTManager struct {
	secret []byte
	expiry time.Duration
}

type CustomClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func NewJWTManager(secret []byte, expiry time.Duration) *JWTManager {
    return &JWTManager{secret: secret, expiry: expiry}
}

func (j *JWTManager) GenerateJWT(userAccountID string, role string) (string, error) {
	now := time.Now().UTC()

	claims := CustomClaims{
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userAccountID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.expiry)),
			ID:        uuid.NewString(),
			Issuer:    "fieldnotes_tech_blog",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}

func (j *JWTManager) ValidateJWT(tokenString string) (*jwt.Token, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return j.secret, nil
    })

    return token, err
}