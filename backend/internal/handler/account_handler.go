package handler

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
)

// 관리자 계정 관련 HTTP 요청/응답 처리
type AccountHandler struct {
	BaseHandler
	service *service.AccountService
}

func NewAccountHandler(service *service.AccountService) *AccountHandler {
	return &AccountHandler{service: service}
}

func (h *AccountHandler) Create(ctx *gin.Context) {
	var req dto.CreateAccountRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	// 계정 추가 처리
	account, err := h.service.Create(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrCreated.Status, dto.ResponseWrapper[dto.CreateAccountReponse]{
		Status: dto.ErrCreated.Status,
		Code: dto.ErrCreated.Code,
		Message: dto.ErrCreated.Message,
		Detail: fmt.Sprintf("Successfully added columns to '%s' account.", account.AccountID),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.CreateAccountReponse{
			AccountDetail: dto.AccountDetail{
				AccountPublic: dto.AccountPublic{
					ID: account.ID,
					AccountID: account.AccountID,
					Nickname: account.Nickname,
					AvatarURL: account.AvatarURL,
					Role: account.Role,
					Status: account.Status,
				},
				CreatedAt: account.CreatedAt,
				UpdatedAt: account.UpdatedAt,
			},
		},
	})
}

func (h *AccountHandler) Login(ctx *gin.Context) {
	var req dto.LoginAccountRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	accountID, token, err := h.service.Login(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[dto.LoginAccountResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully login '%s' account.", accountID),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.LoginAccountResponse{
			Token: token,
		},
	})
}

func (h *AccountHandler) List(ctx *gin.Context) {
	var req dto.ListAccountsRequest

	req.SetDefaults()

	if err := ctx.ShouldBindQuery(&req); err != nil {
		h.respondBindError(ctx, err)
        return
	}

	accounts, err := h.service.GetList(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[dto.ListAccountsResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully retrieved %d accounts.", len(accounts)),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.ListAccountsResponse{
			Meta: dto.ListAccountMeta{
				Sort: dto.SortMeta{
					SortBy: req.SortBy,
					SortDir: req.SortDir,
				},
				Limit: req.Limit,
				Filters: dto.ListAccountFilter{
					ID: req.ID,
					AccountID: req.AccountID,
					Nickname: req.Nickname,
					AvatarURL: req.AvatarURL,
					Role: req.Role,
					Status: req.Status,
				},
			},
			Data: accounts,
		},
	})
}

func (h *AccountHandler) Read(ctx *gin.Context) {
	var req dto.ReadAccountRequest

	if err := ctx.ShouldBindUri(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	account, err := h.service.GetAccount(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.ReadAccountResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully retrieved '%s' account.", account.AccountID),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: &dto.ReadAccountResponse{AccountDetail: *account},
	})
}

func (h *AccountHandler) Update(ctx *gin.Context) {
	var req dto.UpdateAccountRequest

	if paramErr := ctx.ShouldBindUri(&req); paramErr != nil {
		h.respondBindError(ctx, paramErr)
		return
	}

	if bindErr := ctx.ShouldBindJSON(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
		return
	}

	if err := req.Validate(); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	res, err := h.service.UpdateFields(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[*dto.UpdateAccountResponse]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully changed '%s' account fields.", res.Data.AccountID),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: res,
	})
}

func (h *AccountHandler) Delete(ctx *gin.Context) {
	var req dto.DeleteAccountRequest

	if err := ctx.ShouldBindUri(&req); err != nil {
		h.respondBindError(ctx, err)
		return
	}

	res, err := h.service.Delete(ctx, &req)
	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(dto.ErrOK.Status, dto.ResponseWrapper[any]{
		Status: dto.ErrOK.Status,
		Code: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Detail: fmt.Sprintf("Successfully deleted '%s' account.", res.AccountID),
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
	})
}

