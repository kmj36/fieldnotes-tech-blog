package dto

import (
	"time"
)

type PostPublic struct {
	ID				int					`json:"id"`

	Nickname		string				`json:"nickname"`
	AccountID		string				`json:"accountId,omitempty"` // ADMIN Only

	Slug			string				`json:"slug"`
	Title			string				`json:"title"`
	Excerpt			string				`json:"excerpt"`
	Thumbnail		*string				`json:"thumbnail"`

	IsPrivate		bool				`json:"isPrivate"`

	CreatedAt		time.Time			`json:"createdAt"`
	UpdatedAt		time.Time			`json:"updatedAt"`
	PublishedAt		*time.Time			`json:"publishedAt"`

	Category		*CategoryPublic		`json:"category"`
	Tags			[]TagPublic			`json:"tags"`
}

type PostDetail struct {
	PostPublic
	Content			string				`json:"content"`
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
type ListPostsMatchFilters struct {
	MatchType		*string		`json:"matchType"`

	ID				*int		`json:"id"`
	AccountID		*string		`json:"accountId,omitempty"` // ADMIN Only
	Nickname 		*string		`json:"nickname"`

	Slug   	    	*string    	`json:"slug"`
	Title    		*string    	`json:"title"`

	CategoryID  	*int16     	`json:"categoryId"`
	TagSlugs		[]string	`json:"tagSlugs"`

	IsPrivate		*bool		`json:"isPrivate"`
}

type ListPostsDateFilters struct {
	DateFilter  *string 		`json:"dateFilter"`
	DateTarget  *string 		`json:"dateTarget"`
	DateFrom    *string 		`json:"dateFrom"`
	DateTo      *string 		`json:"dateTo"`
}

type ListPostsFilter struct {
	Match			ListPostsMatchFilters	`json:"match"`
	Date			ListPostsDateFilters	`json:"date"`
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