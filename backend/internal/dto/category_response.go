package dto

import "time"

// 응답 DTO (Client <- API)

type CategoryPublic struct {
	ID				int16		`json:"id"`
	ParentID		*int16		`json:"parentId"`
	Path			string		`json:"path"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
}
type CategoryDetail struct {
	CategoryPublic
	CreatedAt		time.Time	`json:"createdAt"`
	UpdatedAt		time.Time	`json:"updatedAt"`
}

type CreateCategoryReponse struct {
	CategoryDetail
}

type ReadCategoriesFilters struct {
	ID				*int16		`json:"id"`
	ParentID		*int16		`json:"parentId"`
	Name			*string		`json:"name"`
	Slug			*string		`json:"slug"`
}
type ReadCategoriesMetadata struct {
	Sort 		SortMeta				`json:"sort"`
	Limit 		int16					`json:"limit"`
	Filters 	ReadCategoriesFilters	`json:"filters"`
}
type ReadCategoriesResponse struct {
	Meta 	ReadCategoriesMetadata  `json:"meta"`
	Datas	[]*CategoryPublic		`json:"data"`
}

type UpdateCategoryResponse struct {
	Data		CategoryDetail		`json:"data"`
	Diff		CommonUpdateDiff	`json:"diff"`
}