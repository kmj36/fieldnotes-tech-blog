package dto

import "time"

// 응답 DTO (Client <- API)

type TagPublic struct {
	ID				int16		`json:"id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
}

type TagDetail struct {
	TagPublic
	CreatedAt		time.Time	`json:"createdAt"`
	UpdatedAt		time.Time	`json:"updatedAt"`
}

type CreateTagResponse struct {
	TagDetail
}

type ReadTagsFilters struct {
	ID				*int16		`json:"id"`
	Name			*string		`json:"name"`
	Slug			*string		`json:"slug"`
}
type ReadTagsMetadata struct {
	Sort 		SortMeta		`json:"sort"`
	Limit 		int16			`json:"limit"`
	Filters 	ReadTagsFilters	`json:"filters"`
}
type ReadTagsResponse struct {
	Meta 	ReadTagsMetadata	`json:"meta"`
	Datas	[]*TagPublic		`json:"data"`
}

type UpdateTagResponse struct {
	Data	TagDetail	`json:"data"`
	Diff	CommonUpdateDiff	`json:"diff"`
}

type DeleteTagResponse struct {
	Name	string
}