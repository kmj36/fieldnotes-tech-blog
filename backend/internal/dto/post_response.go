package dto

import (
	"time"
)

type PostPublic struct {
	ID				int					`json:"id"`
	Slug			string				`json:"slug"`
	Title			string				`json:"title"`
	Excerpt			string				`json:"excerpt"`
	Thumbnail		*string				`json:"thumbnail"`
	PublishedAt		*time.Time			`json:"publishedAt"`
	UpdatedAt		time.Time			`json:"updatedAt"`
	Category		*CategoryPublic		`json:"category"`
	Tags			[]TagPublic			`json:"tags"`
}

type PostDetail struct {
	ID				int					`json:"id"`
	Slug			string				`json:"slug"`
	Title			string				`json:"title"`
	Content			string				`json:"content"`
	Thumbnail		*string				`json:"thumbnail"`
	PublishedAt		*time.Time			`json:"publishedAt"`
	UpdatedAt		time.Time			`json:"updatedAt"`
	CreatedAt		*time.Time			`json:"createdAt,omitempty"`	// Role ADMIN only
	IsPrivate		*bool				`json:"isPrivate,omitempty"`	// Role ADMIN only
	Category		*CategoryPublic		`json:"category"`
	Tags			[]TagPublic			`json:"tags"`
}

// 응답 DTO (Client <- API)
type CreatePostResponse struct {
	PostPublic
}

type ListPostsPagination struct {
	Page			int			`json:"page"`
	PageLimit		int			`json:"pageLimit"`
	Total			int			`json:"total"`
	TotalPages		int			`json:"totalPages"`
	HasNextPage		bool		`json:"hasNextPage"`
	HasPrevPage		bool		`json:"hasPrevPage"`
}
type ListPostsFilter struct {
	ID				*int		`form:"id"`
	AccountID 		*string		`form:"accountId"`
	Slug   	    	*string    	`form:"slug"`
	Title    		*string    	`form:"title"`
	CategoryID  	*int16     	`form:"categoryId"`
	TagSlugs		[]string	`form:"tagSlugs"`
	IsPrivate   	*bool      	`form:"isPrivate"`
}
type ListPostsMetaData struct {
	Pagination		ListPostsPagination		`json:"pagination"`
	Sort			SortMeta				`json:"sort"`
	Filter			ListPostsFilter			`json:"filter"`
}
type ListPostsResponse struct {
	Meta	ListPostsMetaData	`json:"meta"`
	Datas	[]*PostPublic		`json:"data"`
}


type ReadPostResponse struct {
	ID				int32		`json:"id"`
	Slug			string		`json:"slug"`
	Title			string		`json:"title"`
	Content			string		`json:"content"`
	Thumbnail		string		`json:"thumbnail"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
	CategoryID		CategoryPublic	`json:"category"`
	TagID			[]ReadTagsResponse		`json:"tags"`
}

type UpdatedPostResponse struct {
	Data		CreatePostResponse	`json:"data"`
	Diff		CommonUpdateDiff	`json:"diff"`
}