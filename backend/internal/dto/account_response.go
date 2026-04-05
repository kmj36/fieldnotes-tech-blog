package dto

import (
	"time"
)

// 응답 DTO (Client <- API)

type UpdateAccountData struct {
    ID             int		`json:"id"`
    AccountID       string  `json:"account_id"`
    Password_updated bool	`json:"password_updated"`
    Nickname       string		`json:"nickname"`
    AvatarURL      string		`json:"avatar_url"`
}

type UpdateAccountResponse struct {
	Data		UpdateAccountData	`json:"data"`
	Diff		CommonUpdateDiff	`json:"diff"`
}

type ReadAccountResponse struct {
	ID				int		`json:"id"`
	AccountID		string		`json:"account_id"`
	Nickname		string		`json:"nickname"`
	AvatarURL		string		`json:"avatar_url"`
	Role			string		`json:"role"`
	Status			string		`json:"status"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

type LoginAccountResponse struct {
	Token			string		`json:"token"`
}

type SortMeta struct {
    SortBy  string `json:"by"`
    SortDir string `json:"dir"`
}

type AccountSummary struct {
    Id        int    `json:"id"`
    AccountID string `json:"account_id"`
    Role      string `json:"role"`
}

type ListAccountMeta struct {
    Sort    SortMeta       `json:"sort"`
    Limit   int            `json:"limit"`
    Filters AccountSummary `json:"filters"`
}

type ListAccountResponse struct {
    Meta ListAccountMeta          `json:"meta"`
    Data []*AccountSummary	 `json:"data"`
}