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

type ReadTagsResponse struct {
	Meta		struct{
		Sort	struct {
			SortBy		string		`json:"by"`
			SortDir		string		`json:"dir"`
		}	`json:"sort"`
		Total		int32		`json:"total"`	
		Filters struct {
			Search		string		`json:"search"`
		}
	}	`json:"meta"`
	Data		[]ReadTagResponse	`json:"data"`
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