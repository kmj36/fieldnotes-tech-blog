package dto

// 요청 DTO (Client -> API)

type LoginAccountRequest struct {
	AccountID		string		`json:"account_id" binding:"required,min=3,max=32"`
	Password		string		`json:"password" binding:"required,min=8,max=80"`
}

type CreateAccountRequest struct {
	AccountID		string		`json:"account_id" binding:"required,min=3,max=32"`
	Password		string		`json:"password" binding:"required,min=8,max=80"`
	Nickname		string		`json:"nickname" binding:"min=2,max=20"`
	AvatarURL		string		`json:"avatar_url" binding:"max=2048"`
}

type UpdateAccountRequest struct {
	Password		string		`json:"password" binding:"omitempty,min=8,max=80"`
	Nickname		string		`json:"nickname" binding:"omitempty,min=2,max=20"`
	AvatarURL		string		`json:"avatar_url" binding:"omitempty,max=2048"`
}

type DeleteAccountRequest struct {
	AccountID		string		`json:"account_id" binding:"required,min=3,max=32"`
}

type ListAccountRequest struct {
	SortBy			string		`json:"sort_by"`
	SortDir			string		`json:"sort_dir"`
	Limit			int			`json:"limit"`
	ID				int			`json:"id"`
	AccountID		string		`json:"account_id"`
	Role			string		`json:"role"`
}