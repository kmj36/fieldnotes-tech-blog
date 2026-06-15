package repository

const (
	whereID = "id = ?"

	// Account
	accountWhereAccountID = "account_id = ?"

	// Category
	categoryWherePathLike = "path LIKE ?"
)

/*

type Account struct {
	ID				int16		`json:"id" db:"id"`
	AccountID		string		`json:"accountId" db:"account_id"`
	PasswordHash	string		`json:"passwordHash" db:"password_hash"`
	Nickname		string		`json:"nickname" db:"nickname"`
	AvatarURL		*string		`json:"avatarUrl" db:"avatar_url"`
	Role			string		`json:"role" db:"role"`
	Status			string		`json:"status" db:"status"`
	CreatedAt		time.Time	`json:"createdAt" db:"created_at"`
	UpdatedAt		time.Time	`json:"updatedAt" db:"updated_at"`
}

type Category struct {
	ID				int16		`json:"id" db:"id"`
	ParentID		*int16		`json:"parentId" db:"parent_id"`
	Path			string		`json:"path" db:"path"`
	Name			string		`json:"name" db:"name"`
	Slug			string		`json:"slug" db:"slug"`
	CreatedAt		time.Time	`json:"createdAt" db:"created_at"`
	UpdatedAt		time.Time	`json:"updatedAt" db:"updated_at"`
}

type Post struct {
	ID				int			`db:"id"`

	AccountID 		string		`db:"account_id"`

	Slug			string		`db:"slug"`
	Title			string		`db:"title"`
	Content			string		`db:"content"`
	Thumbnail		*string		`db:"thumbnail"`
	CategoryID		*int16		`db:"category_id"`

	IsPrivate		bool		`db:"is_private"`

	CreatedAt		time.Time	`db:"created_at"`
	UpdatedAt		time.Time	`db:"updated_at"`
	PublishedAt		*time.Time	`db:"published_at"`
}

type PostTag struct {
    PostID int `db:"post_id"`
    TagID  int16 `db:"tag_id"`
}

type Tag struct {
	ID				int16		`json:"id" db:"id"`
	Name			string		`json:"name" db:"name"`
	Slug			string		`json:"slug" db:"slug"`
	CreatedAt		time.Time	`json:"createdAt" db:"created_at"`
	UpdatedAt		time.Time	`json:"updatedAt" db:"updated_at"`
}

*/
