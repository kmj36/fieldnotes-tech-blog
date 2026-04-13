package model

import "time"

// 카테고리 모델
type Category struct {
	ID				int32		`json:"id" db:"id"`
	ParentID		*int32		`json:"parent_id" db:"parent_id"`
	Path			string		`json:"path" db:"path"`
	Name			string		`json:"name" db:"name"`
	Slug			string		`json:"slug" db:"slug"`
	CreatedAt		time.Time	`json:"created_at" db:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at" db:"updated_at"`
}