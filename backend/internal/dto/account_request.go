package dto

// 요청 DTO (Client -> API)

type LoginAccountRequest struct {
	AccountID		string		`json:"accountId" binding:"required,max=32"`
	Password		string		`json:"password" binding:"required,max=80"`
}

type CreateAccountRequest struct {
	AccountID		string		`json:"accountId" binding:"required,min=3,max=32"`
	Password		string		`json:"password" binding:"required,min=8,max=80"`
	Nickname		string		`json:"nickname" binding:"required,min=2,max=20"`
	AvatarURL		*string		`json:"avatarUrl" binding:"omitempty,max=2048"`
	Role			string		`json:"role" binding:"oneof=USER ADMIN"`
	Status			string		`json:"status" binding:"oneof=ACTIVE SUSPENDED"`
}

type ReadAccountRequest struct {
	AccountID		string		`uri:"accountId" binding:"required,max=32"`
}

type ListAccountsRequest struct {
	Limit			int16		`form:"limit" binding:"min=0"`
	SortBy			string		`form:"sortBy" binding:"oneof=id accountId role"`
	SortDir			string		`form:"sortDir" binding:"oneof=asc desc"`
	ID				*int16		`form:"id" binding:"omitempty,min=0"`
	AccountID		*string		`form:"accountId" binding:"omitempty,max=32"`
	Nickname		*string		`form:"nickname" binding:"omitempty,min=2,max=20"`
	AvatarURL		*string		`form:"avatarUrl" binding:"omitempty,max=2048"`
	Role			*string		`form:"role" binding:"omitempty,oneof=USER ADMIN"`
	Status			*string		`form:"status" binding:"omitempty,oneof=ACTIVE SUSPENDED"`
}
func (r *ListAccountsRequest) SetDefaults() {
	if r.Limit == 0 {
		r.Limit = 10
	}
	if r.SortBy == "" {
		r.SortBy = "id"
	}
	if r.SortDir == "" {
		r.SortDir = "desc"
	}
}

type UpdateAccountRequest struct {
	AccountID		string		`uri:"accountId" binding:"required,max=32"`
	Password		*string		`json:"password" binding:"omitempty,min=8,max=80"`
	Nickname		*string		`json:"nickname" binding:"omitempty,min=2,max=20"`
	AvatarURL		*string		`json:"avatarUrl" binding:"omitempty,max=2048"`
	Role			*string		`json:"role" binding:"omitempty,oneof=USER ADMIN"`
	Status			*string		`json:"status" binding:"omitempty,oneof=ACTIVE SUSPENDED"`
}
func (r *UpdateAccountRequest) Validate() error {
	if r.Password == nil &&
		r.Nickname == nil &&
		r.AvatarURL == nil &&
		r.Role == nil &&
		r.Status == nil {
			return CErrUpdateEmptyParam
	}
	return nil
}

type DeleteAccountRequest struct {
	AccountID		string		`uri:"accountId" binding:"required,max=32"`
}