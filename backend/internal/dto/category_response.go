package dto

import "time"

// 응답 DTO (Client <- API)

type CreateCategoryResponse struct {
	ID				int32		`json:"id"`
	ParentID		*int32		`json:"parent_id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
	Path			string		`json:"path"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

type CategorySummary struct {
	Id				int32		`json:"id"`
	ParentId		*int32		`json:"parent_id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
}
type ListCategoriesMeta struct {
	Sort 		SortMeta	`json:"sort"`
	Limit 		int			`json:"limit"`
	Filters 	CategorySummary	`json:"filters"`
}

type ListCategoriesResponse struct {
	Meta 	ListCategoriesMeta      `json:"meta"`
	Data	[]*CategoriesObject		`json:"data"`
}

type CategoriesObject struct {
	ID				int32		`json:"id"`
	ParentID		*int32		`json:"parent_id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
	Path			string		`json:"path"`
}
type UpdateCategoryResponse struct {
	Data		CreateCategoryResponse	`json:"data"`
	Diff		CommonUpdateDiff		`json:"diff"`
}