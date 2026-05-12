package service

import (
	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
	"gorm.io/gorm"
)

// 관리자 계정 관련 비즈니스 로직
type AccountService struct {
	repo *repository.AccountRepository
	jwt *cryption.JWTManager
}

func NewAccountService(repo *repository.AccountRepository, jwtManager *cryption.JWTManager) *AccountService {
	return &AccountService{repo: repo, jwt:jwtManager}
}

func (s *AccountService) Create(ctx *gin.Context, req *dto.CreateAccountRequest) (*dto.CreateAccountReponse, error) {
	var existing *model.Account

	existing, err := s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, dto.CErrAlreadyExists
	}

	hash, err := cryption.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	newAccount := &model.Account{
		AccountID: req.AccountID,
		PasswordHash: hash,
		Nickname: req.Nickname,
		AvatarURL: req.AvatarURL,
		Role: req.Role,
		Status: req.Status,
	}

	createdAccount, err := s.repo.Create(ctx, newAccount)
	if err != nil {
		return nil, err
	}

	res := &dto.CreateAccountReponse{
		AccountDetail: dto.AccountDetail{
			AccountPublic: dto.AccountPublic{
				ID: createdAccount.ID,
				AccountID: createdAccount.AccountID,
				Nickname: createdAccount.Nickname,
				AvatarURL: createdAccount.AvatarURL,
				Role: createdAccount.Role,
				Status: createdAccount.Status,
			},
			CreatedAt: createdAccount.CreatedAt,
			UpdatedAt: createdAccount.UpdatedAt,
		},
	}

	return res, nil
}

func (s *AccountService) Login(ctx *gin.Context, req *dto.LoginAccountRequest) (*dto.LoginAccountResponse, error) {
	account, err := s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, dto.CErrLoginFailed
	}

	if cryption.VerifyPassword(req.Password, account.PasswordHash) == false {
		return nil, dto.CErrLoginFailed
	}

	token, jwtErr := s.jwt.GenerateJWT(account.AccountID, account.Role)
	if jwtErr != nil {
		return nil, jwtErr
	}

	res := &dto.LoginAccountResponse{
		AccountID: account.AccountID,
		Token: token,
	}

	return res, nil
}

func (s *AccountService) List(ctx *gin.Context, req *dto.ListAccountsRequest) (*dto.ListAccountsResponse, error) {
	var result	[]*dto.AccountPublic

	array, err := s.repo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.AccountPublic, len(array))

	for idx, item := range array {
		result[idx] = &dto.AccountPublic{
			ID: item.ID,
			AccountID: item.AccountID,
			Nickname: item.Nickname,
			AvatarURL: item.AvatarURL,
			Role: item.Role,
			Status: item.Status,
		}
	}

	res := &dto.ListAccountsResponse{
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
		Data: result,
	}

	return res, nil
}

func (s *AccountService) Read(ctx *gin.Context, req *dto.ReadAccountRequest) (*dto.ReadAccountResponse, error) {
	account, err := s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, gorm.ErrRecordNotFound
	}

	res := &dto.ReadAccountResponse{
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
	}

	return res, nil
}

func (s *AccountService) Update(ctx *gin.Context, req *dto.UpdateAccountRequest) (*dto.UpdateAccountResponse, error) {
	existing, err := s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, gorm.ErrRecordNotFound
	}

	updates := map[string]interface{}{}
	changedFields := []string{}
	isPasswordChanged := false

	if req.Password != nil {
		if !cryption.VerifyPassword(*req.Password, existing.PasswordHash) {
			hash, err := cryption.HashPassword(*req.Password)
			if err != nil {
				return nil, err
			}
			updates["password_hash"] = hash
			changedFields = append(changedFields, "passwordHash")
			isPasswordChanged = true
		}
	}

	if req.AvatarURL != nil {
		existingURL := ""
		if existing.AvatarURL != nil {
			existingURL = *existing.AvatarURL
		}
		if *req.AvatarURL != existingURL {
			updates["avatar_url"] = req.AvatarURL
			changedFields = append(changedFields, "avatarUrl")
		}
	}

	if req.Nickname != nil && *req.Nickname != existing.Nickname {
		updates["nickname"] = req.Nickname
		changedFields = append(changedFields, "nickname")
	}

	if req.Role != nil && *req.Role != existing.Role {
		updates["role"] = req.Role
		changedFields = append(changedFields, "role")
	}

	if req.Status != nil && *req.Status != existing.Status {
		updates["status"] = req.Status
		changedFields = append(changedFields, "status")
	}

	if len(updates) == 0 {
		return nil, dto.CErrUpdateEmptyParam
	}
	
	data, err := s.repo.Update(ctx, req, updates)
	if err != nil {
		return nil, err
	}

	res := &dto.UpdateAccountResponse{
		Data: dto.UpdateAccountData{
			IsPasswordChanged: isPasswordChanged,
			AccountDetail: dto.AccountDetail{
				AccountPublic: dto.AccountPublic{
					ID: data.ID,
					AccountID: data.AccountID,
					Nickname: data.Nickname,
					AvatarURL: data.AvatarURL,
					Role: data.Role,
					Status: data.Status,
				},
				CreatedAt: data.CreatedAt,
				UpdatedAt: data.UpdatedAt,
			},
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}

    return res, nil
}

func (s *AccountService) Delete(ctx *gin.Context, req *dto.DeleteAccountRequest) (*dto.DeleteAccountResponse, error) {
	current, err := s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, gorm.ErrRecordNotFound
	}

	result, err := s.repo.Delete(ctx, req)
	if err != nil {
		return nil, err
	}

	res := &dto.DeleteAccountResponse{
		AccountID: result.AccountID,
	}

	return res, nil
}