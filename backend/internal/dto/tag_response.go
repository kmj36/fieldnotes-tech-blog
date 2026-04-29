package dto

import "time"

// 응답 DTO (Client <- API)

type CreateTagResponse struct {
	ID				int32		`json:"id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

type TagSummary struct {
	ID				int32		`json:"id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
}

type ListTagsMeta struct {
	Sort	SortMeta	`json:"sort"`
	Limit	int			`json:"limit"`
	Filters	TagSummary	`json:"filters"`
}

type ListTagsResponse struct {
	Meta	ListTagsMeta	`json:"meta"`
	Data	[]*TagObject	`json:"data"`
}

type TagObject struct {
	ID				int32		`json:"id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
}

type UpdateTagResponse struct {
	Data	CreateTagResponse	`json:"data"`
	Diff	CommonUpdateDiff	`json:"diff"`
}

type ReadTagResponse struct {
	ID				int32		`json:"id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
}