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
	jwt  *cryption.JWTManager
}

func NewAccountService(repo *repository.AccountRepository, jwtManager *cryption.JWTManager) *AccountService {
	return &AccountService{repo: repo, jwt: jwtManager}
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
		AccountID:    req.AccountID,
		PasswordHash: hash,
		Nickname:     req.Nickname,
		AvatarURL:    req.AvatarURL,
		Role:         req.Role,
		Status:       req.Status,
	}

	createdAccount, err := s.repo.Create(ctx, newAccount)
	if err != nil {
		return nil, err
	}

	res := &dto.CreateAccountReponse{
		AccountDetail: dto.AccountDetail{
			AccountPublic: dto.AccountPublic{
				ID:        createdAccount.ID,
				AccountID: createdAccount.AccountID,
				Nickname:  createdAccount.Nickname,
				AvatarURL: createdAccount.AvatarURL,
				Role:      createdAccount.Role,
				Status:    createdAccount.Status,
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
		Token:     token,
	}

	return res, nil
}

func (s *AccountService) List(ctx *gin.Context, req *dto.ListAccountsRequest) (*dto.ListAccountsResponse, error) {
	var result []*dto.AccountPublic

	array, err := s.repo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	result = make([]*dto.AccountPublic, len(array))

	for idx, item := range array {
		result[idx] = &dto.AccountPublic{
			ID:        item.ID,
			AccountID: item.AccountID,
			Nickname:  item.Nickname,
			AvatarURL: item.AvatarURL,
			Role:      item.Role,
			Status:    item.Status,
		}
	}

	res := &dto.ListAccountsResponse{
		Meta: dto.ListAccountMeta{
			Sort: dto.SortMeta{
				SortBy:  req.SortBy,
				SortDir: req.SortDir,
			},
			Limit: req.Limit,
			Filters: dto.ListAccountFilter{
				ID:        req.ID,
				AccountID: req.AccountID,
				Nickname:  req.Nickname,
				AvatarURL: req.AvatarURL,
				Role:      req.Role,
				Status:    req.Status,
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
				ID:        account.ID,
				AccountID: account.AccountID,
				Nickname:  account.Nickname,
				AvatarURL: account.AvatarURL,
				Role:      account.Role,
				Status:    account.Status,
			},
			CreatedAt: account.CreatedAt,
			UpdatedAt: account.UpdatedAt,
		},
	}

	return res, nil
}

func (s *AccountService) Update(ctx *gin.Context, req *dto.UpdateAccountRequest) (*dto.UpdateAccountResponse, error) {
	// 계정이 존재하지 않으면 조기 반환
	existing, err := s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, gorm.ErrRecordNotFound
	}

	// 필드 업데이트 대상 파악
	updates, changedFields, isPasswordChanged, err := s.buildUpdateFields(req, existing)
	if err != nil {
		return nil, err
	}

	// 업데이트할 필드가 없는 경우
	if len(updates) == 0 {
		return nil, dto.CErrUpdateEmptyParam
	}

	// DB 에 업데이트 요청
	data, err := s.repo.Update(ctx, req, updates)
	if err != nil {
		return nil, err
	}

	// 데이터 반환 값 생성
	res := &dto.UpdateAccountResponse{
		Data: dto.UpdateAccountData{
			IsPasswordChanged: isPasswordChanged,
			AccountDetail: dto.AccountDetail{
				AccountPublic: dto.AccountPublic{
					ID:        data.ID,
					AccountID: data.AccountID,
					Nickname:  data.Nickname,
					AvatarURL: data.AvatarURL,
					Role:      data.Role,
					Status:    data.Status,
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

func (s *AccountService) buildUpdateFields(req *dto.UpdateAccountRequest, existing *model.Account) (map[string]interface{}, []string, bool, error) {
	// 필드 업데이트 대상 파악
	updates := map[string]interface{}{}
	changedFields := []string{}
	isPasswordChanged := false

	// 비밀번호 변경 여부 파악
	hash, err := s.checkUpdatePassword(req.Password, existing.PasswordHash)
	if err != nil {
		return nil, nil, false, err
	}
	if hash != "" {
		updates["password_hash"] = hash
		changedFields = append(changedFields, "passwordHash")
		isPasswordChanged = true
	}

	// 프로필 아바타 URL 변경 여부 파악
	if newURL, changed := s.checkUpdateAvatarURL(req.AvatarURL, existing.AvatarURL); changed {
		updates["avatar_url"] = newURL
		changedFields = append(changedFields, "avatarUrl")
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

	return updates, changedFields, isPasswordChanged, nil
}

func (s *AccountService) checkUpdatePassword(changedPassword *string, currentPasswordHash string) (string, error) {
	// 비밀번호를 변경하지 않는 경우 조기 반환
	if changedPassword == nil {
		return "", nil
	}

	// 변경하는 비밀번호와 바꾸려는 비밀번호가 같은 경우 반환
	if cryption.VerifyPassword(*changedPassword, currentPasswordHash) {
		return "", nil
	}

	// 바꾸려는 비밀번호 평문을 해시화
	hash, err := cryption.HashPassword(*changedPassword)
	if err != nil {
		return "", err
	}

	return hash, nil
}

func (s *AccountService) checkUpdateAvatarURL(changedAvatarURL, currentAvatarURL *string) (*string, bool) {
	// 프로필 아바타 URL 를 변경하지 않는 경우 조기 반환
	if changedAvatarURL == nil {
		return nil, false
	}

	existing := ""
	if currentAvatarURL != nil {
		existing = *currentAvatarURL
	}

	if *changedAvatarURL == existing {
		return nil, false
	}

	return changedAvatarURL, true
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
