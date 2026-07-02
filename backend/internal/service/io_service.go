package service

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
)

type IOService struct {
	staticDir   string
	maxSize     int64
	allowedExts map[string]bool
	allowedMIME map[string]bool
}

func NewIOService() *IOService {
	return &IOService{
		staticDir: "./static",
		maxSize:   8 << 20,
		allowedExts: map[string]bool{
			".jpg": true, ".jpeg": true, ".png": true,
			".gif": true, ".webp": true,
		},
		allowedMIME: map[string]bool{
			"image/jpeg": true, "image/png": true,
			"image/gif": true, "image/webp": true,
		},
	}
}

func (s *IOService) ProcessImage(ctx *gin.Context, req *dto.CreateImageRequest) (*dto.CreateImageResponse, error) {
	file := req.Image
	if file.Size > s.maxSize {
		return nil, dto.CErrFileTooLarge
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !s.allowedExts[ext] {
		return nil, dto.CErrInvalidExt
	}

	contentType := file.Header.Get("Content-Type")
	if !s.allowedMIME[contentType] {
		return nil, dto.CErrInvalidMIME
	}

	// 1. 파일 데이터로부터 SHA-256 해시값 추출
	fileHash, err := s.calculateFileHash(file)
	if err != nil {
		return nil, err
	}

	// 파일명을 해시화
	filename := fileHash + ext
	dst := filepath.Join(s.staticDir, filename)
	url := "/api/v1/static/" + filename

	if _, err := os.Stat(dst); err == nil {
		return &dto.CreateImageResponse{
			URL:      url,
			Filename: filename,
		}, nil
	}

	if err := ctx.SaveUploadedFile(file, dst); err != nil {
		return nil, err
	}

	res := &dto.CreateImageResponse{
		URL:      url,
		Filename: filename,
	}

	return res, nil
}

func (s *IOService) ListImages() (*dto.ListImagesResponse, error) {
	entries, err := os.ReadDir(s.staticDir)
	if err != nil {
		return nil, err
	}
	images := make([]dto.ImageListItem, 0, len(entries))
	for _, e := range entries {
		// 디렉터리 제외
		if e.IsDir() {
			continue
		}

		// 비 이미지 확장자 제외
		if !s.allowedExts[strings.ToLower(filepath.Ext(e.Name()))] {
			continue
		}

		// 파일 정보 조회 실패
		info, err := e.Info()
		if err != nil {
			continue
		}

		images = append(images, dto.ImageListItem{
			URL:        "/api/v1/static/" + e.Name(),
			Filename:   e.Name(),
			Size:       info.Size(),
			UploadedAt: info.ModTime().UTC(),
		})
	}

	sort.Slice(images, func(i, j int) bool {
		return images[i].UploadedAt.After(images[j].UploadedAt) // 최신순
	})

	return &dto.ListImagesResponse{ImageList: images}, nil
}

func (s *IOService) calculateFileHash(fileHeader *multipart.FileHeader) (string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, src); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}
