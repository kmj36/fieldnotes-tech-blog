package dto

// 요청 DTO (Client -> API)

type CreatePostRequest struct {
    Slug        string    	`json:"slug" binding:"required,min=1,max=150"`
    Title       string    	`json:"title" binding:"required,min=1,max=100"`
    Content     string    	`json:"content" binding:"required,min=1,max=100000"`
    Thumbnail   *string    	`json:"thumbnail" binding:"omitempty,max=2048"`
    CategoryID  *int16     	`json:"categoryId" binding:"omitempty,min=0"`
	TagSlugs	[]string	`json:"tagSlugs" binding:"omitempty,max=50"`
    IsPrivate   *bool      	`json:"isPrivate" binding:"omitempty"`
}

type ListPostsRequest struct {
	Page			int			`form:"page"      binding:"min=1"`
	PageLimit		int			`form:"pageLimit" binding:"min=1"`
	SortBy			string		`form:"sortBy"    binding:"oneof=id created_at updated_at published_at title slug"`
	SortDir			string		`form:"sortDir"   binding:"oneof=asc desc"`
	
	ID				*int		`form:"id"         binding:"omitempty,min=1"`
	AccountID 		*string		`form:"accountId"  binding:"omitempty,max=255"`
	Nickname		*string		`form:"nickname"   binding:"omitempty,max=255"`
	
	MatchType 		*string 	`form:"matchType"  binding:"omitempty,oneof=equal prefix suffix contains"`
	Slug   	    	*string    	`form:"slug"       binding:"omitempty,min=1,max=150"`
	Title    		*string    	`form:"title"      binding:"omitempty,min=1,max=100"`
	IsPrivate		*bool		`form:"isPrivate" binding:"omitempty"`

	CategoryID  	*int16     	`form:"categoryId" binding:"omitempty,min=1"`
	TagSlugs		[]string	`form:"tagSlugs"   binding:"omitempty,max=50"`

	DateFilter  	*string 	`form:"dateFilter"  binding:"omitempty,oneof=eq gt lt gte lte between"`
	DateTarget 		*string 	`form:"dateTarget"  binding:"omitempty,oneof=created_at updated_at published_at"`
	DateFrom    	*string 	`form:"dateFrom"    binding:"omitempty"`
	DateTo      	*string 	`form:"dateTo"      binding:"omitempty"`
}
func (r *ListPostsRequest) SetDefaults() {
	if r.Page == 0 {
		r.Page = 1
	}
	if r.PageLimit == 0 {
		r.PageLimit = 8
	}
	if r.SortBy == "" {
		r.SortBy = "created_at"
	}
	if r.SortDir == "" {
		r.SortDir = "desc"
	}
	if r.Slug != nil || r.Title != nil {
		match := "equal"
		r.MatchType = &match
	}
	if r.DateTarget != nil {
		dateFilter := "eq"
		r.DateFilter = &dateFilter
	}

}

type ReadPostRequest struct {
	Slug		string		`uri:"postSlug" binding:"required,min=1,max=150"`
}
type UpdatePostRequest struct {
	Slug			string		`json:"slug" binding:"max=150"`
	Title			string		`json:"title" binding:"max=100"`
	Content			string		`json:"content" binding:"max=100000"`
	Thumbnail		string		`json:"thumbnail" binding:"max=2048"`
	CategoryID		string		`json:"category_id"`
	TagsID			[]string	`json:"tags_id"`
	IsPublish		string		`json:"is_publish"`
	IsPrivate		string		`json:"is_private"`
}
