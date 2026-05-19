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

type ReadPostRequest struct {
	Page			int32		`json:"page" binding:"min=1,max=10000"`
	PageSize		int32		`json:"page_size" binding:"max=200"`
	Search			string		`json:"search" binding:"max=100"`
	CategorySlug	string		`json:"category_slug" binding:"max=100"`
	TagSlugs		[]string	`json:"tag_slugs" binding:"max=50"`
	TagSort			string		`json:"tag_sort"`
	SortBy			string		`json:"sort_by"`
	SortDir			string		`json:"sort_dir"`
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
