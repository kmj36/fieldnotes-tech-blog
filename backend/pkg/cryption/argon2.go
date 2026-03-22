package cryption

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/argon2"
)

const (
	memory = 64 * 1024
	iterations = 1
	threads = 4
	saltLength = 16
	keyLength = 32
)

func generateSalt(length uint32) ([]byte, error) {
	salt := make([]byte, length)
	_, err := rand.Read(salt)
	return salt, err
}

func HashPassword(password string) (string, error) {
	salt, err := generateSalt(saltLength)
	if err != nil {
		return "", err
	}

	hash := argon2.IDKey(
		[]byte(password),
		salt,
		iterations,
		memory,
		threads,
		keyLength,
	)

	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	return fmt.Sprintf("%s.%s", b64Salt, b64Hash), nil
}

func VerifyPassword(password, storedHash string) bool {

	var salt, hash string
	fmt.Sscanf(storedHash, "%[^.].%s", &salt, &hash)

	saltBytes, _ := base64.RawStdEncoding.DecodeString(salt)

	newHash := argon2.IDKey(
		[]byte(password),
		saltBytes,
		iterations,
		memory,
		threads,
		keyLength,
	)

	return base64.RawStdEncoding.EncodeToString(newHash) == hash
}

func RandomPlainPassword() string {
	bit := make([]byte, 16)
	rand.Read(bit)
	return base64.URLEncoding.EncodeToString(bit)
}