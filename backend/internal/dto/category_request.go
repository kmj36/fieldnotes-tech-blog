package dto

// 요청 DTO (Client -> API)
// 구조체 이름 작성 규칙: 동작 + 대상 + 용도

type CreateCategoryRequest struct {
	ParentID		*int16		`json:"parentId" binding:"omitempty,min=0"`
	Name			string		`json:"name" binding:"required,min=1,max=100"`
	Slug			string		`json:"slug" binding:"required,min=1,max=150"`
}

type ReadCategoriesRequest struct {
	Limit			int16		`form:"limit" binding:"min=0"` // 요청 개수
	SortBy			string		`form:"sortBy" binding:"oneof=id parent_id name slug"`
	SortDir			string		`form:"sortDir" binding:"oneof=asc desc"`
	ID				*int16		`form:"id" binding:"omitempty,min=0"`
	ParentID		*int16		`form:"parentId" binding:"omitempty,min=0"`
	Name			*string		`form:"name" binding:"omitempty,min=1,max=100"`
	Slug			*string		`form:"slug" binding:"omitempty,min=1,max=150"`
}

func (r *ReadCategoriesRequest) SetDefaults() {
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

type UpdateCategoryRequest struct {
	ID				int16		`uri:"id" binding:"required,min=0"`
	ParentID		*int16		`json:"parentId" binding:"omitempty,min=0"`
	Name			*string		`json:"name" binding:"omitempty,min=1,max=100"`
	Slug			*string		`json:"slug" binding:"omitempty,min=1,max=150"`
}
func (r *UpdateCategoryRequest) Validate() error {
	if r.ParentID == nil && r.Name == nil && r.Slug == nil {
		return CErrUpdateEmptyParam
	}
	return nil
}

type DeleteCategoryRequest struct {
	ID				int16		`uri:"id" binding:"required,min=0"`
}