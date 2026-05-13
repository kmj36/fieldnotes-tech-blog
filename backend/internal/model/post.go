package model

import "time"

// 게시물 모델
type Post struct {
	ID				int			`json:"id" db:"id"`
	AccountID 		string		`json:"accountId" db:"account_id"`
	Slug			string		`json:"slug" db:"slug"`
	Title			string		`json:"title" db:"title"`
	Content			string		`json:"content" db:"content"`
	Thumbnail		*string		`json:"thumbnail" db:"thumbnail"`
	CategoryID		*int16		`json:"categoryId" db:"category_id"`
	PublishedAt		*time.Time	`json:"publishedAt" db:"published_at"`
	IsPrivate		bool		`json:"isPrivate" db:"is_private"`
	CreatedAt		time.Time	`json:"createdAt" db:"created_at"`
	UpdatedAt		time.Time	`json:"updatedAt" db:"updated_at"`
}

type PostTag struct {
    PostID int `json:"postId" db:"post_id"`
    TagID  int16 `json:"tagId" db:"tag_id"`
}