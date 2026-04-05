package handler

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/service"
)

// 관리자 계정 관련 HTTP 요청/응답 처리
type AccountHandler struct {service *service.AccountService}

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
	if err := h.service.Create(ctx, &req) ; err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusCreated, dto.ResponseWrapper[any]{
		Status: http.StatusCreated,
		Code: dto.ErrCreated.Code,
		Detail: "Account created successfully.",
		Message: dto.ErrCreated.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
	})
}

func (h *AccountHandler) Login(ctx *gin.Context) {
	var req dto.LoginAccountRequest

	if bindErr := ctx.ShouldBindJSON(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}

	//fmt.Print("[DEBUG] req: ")
	//fmt.Println(req)

	var auth string
	var err error

	auth, err = h.service.Login(ctx, &req)

	//fmt.Print("[DEBUG] auth, err: ")
	//fmt.Print(auth)
	//fmt.Println(err)

	if err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[dto.LoginAccountResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Code,
		Detail: "Login successfully.",
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.LoginAccountResponse{
			Token: auth,
		},
	})
}

func (h *AccountHandler) List(ctx *gin.Context) {
	var req dto.ListAccountRequest
	var accounts []*dto.AccountSummary
	var err error

	if bindErr := ctx.ShouldBindQuery(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}

	if accounts, err = h.service.List(ctx, &req); err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[dto.ListAccountResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Message,
		Detail: "Successfully retrieved accounts.",
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: dto.ListAccountResponse{
			Meta: dto.ListAccountMeta{
				Sort: dto.SortMeta{
					SortBy: req.SortBy,
					SortDir: req.SortDir,
				},
				Limit: req.Limit,
				Filters: dto.AccountSummary{
					Id: req.ID,
					AccountID: req.AccountID,
					Role: req.Role,
				},
			},
			Data: accounts,
		},
	})
}

func (h *AccountHandler) Get(ctx *gin.Context) {
	var targetAccount = ctx.Param("account")

	if targetAccount == "" {
		h.respondBindError(ctx, errors.New("The 'account' parameter is empty."))
        return
	}

	var data *model.Account
	var err error
	var retrieval *dto.ReadAccountResponse

	if data, err = h.service.GetAccount(ctx, targetAccount); err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	retrieval = &dto.ReadAccountResponse{
		ID: data.ID,
		AccountID: data.AccountID,
		Nickname: data.Nickname,
		AvatarURL: data.AvatarURL,
		Role: data.Role,
		Status: data.Status,
		CreatedAt: data.CreatedAt,
		UpdatedAt: data.UpdatedAt,
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[*dto.ReadAccountResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Code,
		Detail: dto.ErrOK.Code,
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: retrieval,
	})
}

func (h *AccountHandler) Update(ctx *gin.Context) {
	var req dto.UpdateAccountRequest
	var data *dto.UpdateAccountResponse
	var err error

	// JWT에서 account_id 추출
    accountID, exists := ctx.Get("account_id")
    if !exists {
        h.respondBindError(ctx, dto.CErrLoginFailed)
        return
    }

	if bindErr := ctx.ShouldBindJSON(&req); bindErr != nil {
		h.respondBindError(ctx, bindErr)
        return
	}

	if req == (dto.UpdateAccountRequest{}) {
		h.respondBindError(ctx, dto.CErrUpdateEmptyParam)
        return
	}

	if data, err = h.service.Update(ctx, accountID.(string), req) ; err != nil {
		h.respondProcessError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, dto.ResponseWrapper[*dto.UpdateAccountResponse]{
		Status: http.StatusOK,
		Code: dto.ErrOK.Message,
		Detail: "Successfully changed account data.",
		Message: dto.ErrOK.Message,
		Timestamp: time.Now().UTC(),
		Path: ctx.Request.URL.Path,
		Result: data,
	})
}

func (h *AccountHandler) respondBindError(ctx *gin.Context, err error) {
	var ve validator.ValidationErrors
    switch {
    case errors.As(err, &ve):
        fe := ve[0]
        ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
            Status:    http.StatusBadRequest,
            Code:      dto.ErrBadRequestType.Code,
            Detail:    fmt.Sprintf("'%s' does not satisfy '%s' condition", fe.Field(), fe.Tag()),
            Message:   dto.ErrBadRequestType.Message,
            Timestamp: time.Now().UTC(),
            Path:      ctx.Request.URL.Path,
        })
    case errors.Is(err, io.EOF):
        ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
            Status:    http.StatusBadRequest,
            Code:      dto.ErrBadRequestMissing.Code,
            Detail:    "request body is empty",
            Message:   dto.ErrBadRequestMissing.Message,
            Timestamp: time.Now().UTC(),
            Path:      ctx.Request.URL.Path,
        })
	case errors.Is(err, dto.CErrLoginFailed):
		ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
			Status: http.StatusUnauthorized,
			Code: dto.ErrUnauthorized.Code,
			Message: dto.ErrUnauthorized.Message,
			Detail: dto.CErrLoginFailed.Error(),
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	case errors.Is(err, dto.CErrUpdateEmptyParam):
		ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
			Status: http.StatusBadRequest,
			Code: dto.ErrBadRequestMissing.Code,
			Message: dto.ErrBadRequestMissing.Message,
			Detail: dto.CErrUpdateEmptyParam.Error(),
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
    default:
        ctx.JSON(http.StatusBadRequest, dto.ResponseWrapper[any]{
            Status:    http.StatusBadRequest,
            Code:      dto.ErrBadRequestMissing.Code,
            Detail:    err.Error(),
            Message:   dto.ErrBadRequestMissing.Message,
            Timestamp: time.Now().UTC(),
            Path:      ctx.Request.URL.Path,
        })
    }
}

func (h *AccountHandler) respondProcessError(ctx *gin.Context, err error) {
	switch {
	case errors.Is(err, dto.CErrAccountAlreadyExists),
		 errors.Is(err, dto.CErrNicknameAlreadyExists):
		ctx.JSON(http.StatusConflict, dto.ResponseWrapper[any]{
			Status: http.StatusConflict,
			Code: dto.ErrConflict.Code,
			Detail: err.Error(),
			Message: dto.ErrConflict.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	case errors.Is(err, dto.CErrLoginFailed):
		ctx.JSON(http.StatusUnauthorized, dto.ResponseWrapper[any]{
			Status: http.StatusUnauthorized,
			Code: dto.ErrUnauthorized.Code,
			Detail: err.Error(),
			Message: dto.ErrUnauthorized.Message,
			Timestamp: time.Now().UTC(),
			Path: ctx.Request.URL.Path,
		})
	default:
		ctx.JSON(http.StatusInternalServerError, dto.ResponseWrapper[any]{
			Status:    http.StatusInternalServerError,
			Code:      dto.ErrInternal.Code,
			Detail:    err.Error(),
			Message:   dto.ErrInternal.Message,
			Timestamp: time.Now().UTC(),
			Path:      ctx.Request.URL.Path,
		})
	}
}