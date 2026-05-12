package model

import "time"

// 카테고리 모델
type Category struct {
	ID				int16		`json:"id" db:"id"`
	ParentID		*int16		`json:"parentId" db:"parent_id"`
	Path			string		`json:"path" db:"path"`
	Name			string		`json:"name" db:"name"`
	Slug			string		`json:"slug" db:"slug"`
	CreatedAt		time.Time	`json:"createdAt" db:"created_at"`
	UpdatedAt		time.Time	`json:"updatedAt" db:"updated_at"`
}