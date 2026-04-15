package dto

// 요청 DTO (Client -> API)

type CreateCategoryRequest struct {
	ParentID		*int32		`json:"parent_id"`
	Name			string		`json:"name" binding:"required,max=100"`
	Slug			string		`json:"slug" binding:"required,max=150"`
}

type GetCategoryRequest struct {
	Search			string		`form:"search"`
	Limit			int			`form:"limit"`
	SortBy			string		`form:"sort_by"`
	SortDir			string		`form:"sort_dir"`
	ID				int32		`form:"id"`
	ParentID		*int32		`form:"parent_id"`
	Name			string		`form:"name"`
	Slug			string		`form:"slug"`
}

type UpdateCategoryRequest struct {
	ParentID		*int32		`json:"parent_id"`
	Name			string		`json:"name" binding:"max=100"`
	Slug			string		`json:"slug" binding:"max=150"`
}