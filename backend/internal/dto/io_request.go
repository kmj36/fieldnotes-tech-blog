package dto

import "mime/multipart"

type CreateImageRequest struct {
	Image *multipart.FileHeader `form:"image" binding:"required"`
}
