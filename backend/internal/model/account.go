package model

import "time"

// 계정 모델 (API <-> DB)
type Account struct {
	ID				int16		`json:"id" db:"id"`
	AccountID		string		`json:"accountId" db:"account_id"`
	PasswordHash	string		`json:"passwordHash" db:"password_hash"`
	Nickname		string		`json:"nickname" db:"nickname"`
	AvatarURL		*string		`json:"avatarUrl" db:"avatar_url"`
	Role			string		`json:"role" db:"role"`
	Status			string		`json:"status" db:"status"`
	CreatedAt		time.Time	`json:"createdAt" db:"created_at"`
	UpdatedAt		time.Time	`json:"updatedAt" db:"updated_at"`
}