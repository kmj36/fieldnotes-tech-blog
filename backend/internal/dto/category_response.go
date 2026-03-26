package dto

import "time"

// 응답 DTO (Client <- API)

type CreateCategoryResponse struct {
	ID				int32		`json:"id"`
	ParentID		int32		`json:"parent_id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
	Path			string		`json:"path"`
	Breadcrumb		string		`json:"breadcrumb"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

type ReadCategoriesResponse struct {
	Meta	struct{
		Sort struct {
			SortBy		string	`json:"by"`
			SortDir		string	`json:"dir"`
		}	`json:"sort"`
		Total 		int32		`json:"total"`
		Filters struct {
			Search 	string		`json:"search"`
		}
	}		`json:"meta"`
	Data	[]CategoriesObject		`json:"data"`
}

type ReadCategoryResponse struct {
	ID				int32		`json:"id"`
	ParentID		int32		`json:"parent_id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
	Path			string		`json:"path"`
	Breadcrumb		string		`json:"breadcrumb"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}

type UpdateCategoryResponse struct {
	Data		CreateCategoryResponse	`json:"data"`
	Diff		CommonUpdateDiff		`json:"diff"`
}

type CategoriesObject struct {
	ID				int32		`json:"id"`
	Name			string		`json:"name"`
	Slug			string		`json:"slug"`
	Breadcrumb		string		`json:"breadcrumb"`
	Depth			int32		`json:"depth"`
}