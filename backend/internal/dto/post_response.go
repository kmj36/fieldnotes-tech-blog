package dto

import (
	"time"
)

// 응답 DTO (Client <- API)
type CreatePostResponse struct {
	ID				int32		`json:"id"`
	Slug			string		`json:"slug"`
	Title			string		`json:"title"`
	Content			string		`json:"content"`
	Thumbnail		string		`json:"thumbnail"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
	IsPublish		bool		`json:"is_publish"`
	IsPrivate		bool		`json:"is_private"`
	CategoryID		CategoryPublic	`json:"category"`
	TagID			[]ReadTagsResponse		`json:"tags"`
}

type ReadPostsResponse struct {
	Meta		PostMetadataObject	`json:"meta"`
	Data 		[]CommonPostObject	`json:"data"`
}

type ReadEachPostResponse struct {
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

type PostMetadataObject struct {
	Pagination		struct {
		Page		int32		`json:"page"`
		PageSize	int32		`json:"page_size"`
		Total		int32		`json:"total"`
		TotalPages	int32		`json:"total_pages"`
		HasNextPage	bool		`json:"has_nextpage"`
		HasPrevPage bool		`json:"has_prevpage"`
	}	`json:"pagination"`
	Sort			struct {
		SortBy		string		`json:"by"`
		SortDir		string		`json:"desc"`
	}	`json:"sort"`
	Filters			struct {
		Search		string		`json:"search"`
		CategorySlug	string	`json:"category_slug"`
		TagSlugs		[]string	`json:"tag_slugs"`
	}	`json:"filters"`
}

type CommonPostObject struct {
	ID				int32		`json:"id"`
	Slug			string		`json:"slug"`
	Title			string		`json:"title"`
	Excerpt			string		`json:"excerpt"`
	Thumbnail		string		`json:"thumbnail"`
	CreatedAt		time.Time	`json:"created_at"`
	CategoryID		CategoryPublic	`json:"category"`
	TagID			[]ReadTagsResponse		`json:"tags"`
}