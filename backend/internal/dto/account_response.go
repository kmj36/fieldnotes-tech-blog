package dto

import (
	"time"
)

// 응답 DTO (Client <- API)

type CreateAccountData struct {
    ID             string		`json:"id"`
    PasswordStatus string		`json:"password_status"`
    Nickname       string		`json:"nickname"`
    AvatarURL      string		`json:"avatar_url"`
}

type UpdateAccountResponse struct {
	Data		CreateAccountData	`json:"data"`
	Diff		CommonUpdateDiff	`json:"diff"`
}

type ReadAccountResponse struct {
	ID				int16		`json:"id"`
	AccountID		string		`json:"account_id"`
	Nickname		string		`json:"nickname"`
	AvatarURL		string		`json:"avatar_url"`
	Role			string		`json:"role"`
	Status			string		`json:"status"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

type LoginAccountResponse struct {
	Token		string		`json:"token"`
}