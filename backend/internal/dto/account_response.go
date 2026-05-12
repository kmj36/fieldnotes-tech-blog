package dto

import (
	"time"
)

// 응답 DTO (Client <- API)

type AccountPublic struct {
    ID          int16   `json:"id"`
    AccountID   string  `json:"accountId"`
    Nickname    string  `json:"nickname"`
    AvatarURL   *string  `json:"avatarUrl"`
    Role        string  `json:"role"`
    Status	    string  `json:"status"`
}

type AccountDetail struct {
    AccountPublic
    CreatedAt		time.Time	`json:"createdAt"`
	UpdatedAt		time.Time	`json:"updatedAt"`
}

type LoginAccountResponse struct {
    AccountID       string
	Token			string		`json:"token"`
}

type CreateAccountReponse struct {
    AccountDetail
}

type ReadAccountResponse struct {
    AccountDetail
}

type ListAccountFilter struct {
    ID				*int16		`json:"id"`
	AccountID		*string		`json:"accountId"`
	Nickname		*string		`json:"nickname"`
	AvatarURL		*string		`json:"avatarUrl"`
	Role			*string		`json:"role"`
	Status			*string		`json:"status"`
}
type ListAccountMeta struct {
    Sort    SortMeta          `json:"sort"`
    Limit   int16             `json:"limit"`
    Filters ListAccountFilter `json:"filters"`
}
type ListAccountsResponse struct {
	Meta     ListAccountMeta     `json:"meta"`
    Data    []*AccountPublic	 `json:"data"`
}

type UpdateAccountData struct {
    IsPasswordChanged   bool    `json:"isPasswordChanged"`
    AccountDetail
}

type UpdateAccountResponse struct {
	Data		UpdateAccountData	`json:"data"`
	Diff		CommonUpdateDiff	`json:"diff"`
}

type DeleteAccountResponse struct {
    AccountID		string
}