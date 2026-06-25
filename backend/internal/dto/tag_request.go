package dto

// 요청 DTO (Client -> API)

type CreateTagRequest struct {
	Name			string		`json:"name" binding:"required,min=1,max=100"`
	Slug			string		`json:"slug" binding:"required,min=1,max=150"`
}

type ReadTagsRequest struct {
	Limit			int16			`form:"limit" binding:"min=0"`
	SortBy			string		`form:"sortBy" binding:"oneof=id name slug"`
	SortDir			string		`form:"sortDir" binding:"oneof=asc desc"`
	ID				*int16		`form:"id" binding:"omitempty,min=0"`
	Name			*string		`form:"name" binding:"omitempty,min=1,max=100"`
	Slug			*string		`form:"slug" binding:"omitempty,min=1,max=150"`
}
func (r *ReadTagsRequest) SetDefaults() {
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

type UpdateTagRequest struct {
	ID				int16		`uri:"id" binding:"required,min=0"`
	Name			*string		`json:"name" binding:"omitempty,min=1,max=100"`
	Slug			*string		`json:"slug" binding:"omitempty,min=1,max=150"`
}
func (r *UpdateTagRequest) Validate() error {
	if r.Name == nil && r.Slug == nil {
		return CErrUpdateEmptyParam
	}
	return nil
}

type DeleteTagRequest struct {
	ID				int16		`uri:"id" binding:"required,min=0"`
}