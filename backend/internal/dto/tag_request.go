package dto

// 요청 DTO (Client -> API)

type CreateTagRequest struct {
	Name			string		`json:"name" binding:"required,max=100"`
	Slug			string		`json:"slug" binding:"required,max=150"`
}

type GetTagRequest struct {
	Search			string		`form:"search"`
	Limit			int			`form:"limit"`
	SortBy			string		`form:"sort_by"`
	SortDir			string		`form:"sort_dir"`
	ID				int16		`form:"id"`
	Name			string		`form:"name"`
	Slug			string		`form:"slug"`
}

type UpdateTagRequest struct {
	Name			string		`json:"name" binding:"max=100"`
	Slug			string		`json:"slug" binding:"max=150"`
}