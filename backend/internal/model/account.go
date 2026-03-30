package model

import "time"

// 계정 모델 (API <-> DB)
type Account struct {
	ID				int			`json:"id" db:"id"`
	AccountID		string		`json:"account_id" db:"account_id"`
	PasswordHash	string		`json:"password_hash" db:"password_hash"`
	Nickname		string		`json:"nickname" db:"nickname"`
	AvatarURL		string		`json:"avatar_url" db:"avatar_url"`
	Role			string		`json:"role" db:"role"`
	Status			string		`json:"status" db:"status"`
	CreatedAt		time.Time	`json:"created_at" db:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at" db:"updated_at"`
}