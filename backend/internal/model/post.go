package model

import "time"

// 게시물 모델
type Post struct {
	ID				int			`db:"id"`
	AccountID 		string		`db:"account_id"`
	Slug			string		`db:"slug"`
	Title			string		`db:"title"`
	Content			string		`db:"content"`
	Thumbnail		*string		`db:"thumbnail"`
	CategoryID		*int16		`db:"category_id"`
	PublishedAt		*time.Time	`db:"published_at"`
	IsPrivate		bool		`db:"is_private"`
	CreatedAt		time.Time	`db:"created_at"`
	UpdatedAt		time.Time	`db:"updated_at"`
}

type PostTag struct {
    PostID int `db:"post_id"`
    TagID  int16 `db:"tag_id"`
}