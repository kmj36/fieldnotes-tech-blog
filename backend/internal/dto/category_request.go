package dto

// 요청 DTO (Client -> API)

type CreateCategoryRequest struct {
	ParentID		*int32		`json:"parent_id"`
	Name			string		`json:"name" binding:"required,max=100"`
	Slug			string		`json:"slug" binding:"required,max=150"`
}

type ReadCategoryRequest struct {
	Search			string		`json:"search"`
	SortBy			string		`json:"sort_by"`
	SortDir			string		`json:"sort_dir"`
}

type UpdateCategoryRequest struct {
	ParentID		int32		`json:"parent_id"`
	Name			string		`json:"name" binding:"max=100"`
	Slug			string		`json:"slug" binding:"max=150"`
}