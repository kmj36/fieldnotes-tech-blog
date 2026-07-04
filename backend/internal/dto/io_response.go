package dto

import "time"

type CreateImageResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
}

type ImageListItem struct {
	URL        string    `json:"url"`
	Filename   string    `json:"filename"`
	Size       int64     `json:"size"`
	UploadedAt time.Time `json:"uploadedAt"`
}

type ListImagesResponse struct {
	ImageList []ImageListItem `json:"images"`
}
