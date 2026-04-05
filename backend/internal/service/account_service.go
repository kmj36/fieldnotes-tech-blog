package service

import (
	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"github.com/kmj36/fieldnotes-tech-blog/internal/repository"
	"github.com/kmj36/fieldnotes-tech-blog/pkg/cryption"
)

// 관리자 계정 관련 비즈니스 로직
type AccountService struct {
	repo *repository.AccountRepository
	jwt *cryption.JWTManager
}

func NewAccountService(repo *repository.AccountRepository, jwtManager *cryption.JWTManager) *AccountService {
	return &AccountService{repo: repo, jwt:jwtManager}
}

func (s *AccountService) Create(ctx *gin.Context, req *dto.CreateAccountRequest) error {
	var existing *model.Account
	var err error
	var hash string

	existing, err = s.repo.FindByAccountID(ctx, req.AccountID)
	if err != nil {
		return err
	}
	if existing != nil {
		return dto.CErrAccountAlreadyExists
	}

	existing, err = s.repo.FindByNickname(ctx, req.Nickname)
	if err != nil {
		return err
	}
	if existing != nil {
		return dto.CErrNicknameAlreadyExists
	}

	if hash, err = cryption.HashPassword(req.Password) ; err != nil {
		return err
	}

	newAccount := &model.Account{
		AccountID: req.AccountID,
		PasswordHash: hash,
		Nickname: req.Nickname,
		AvatarURL: req.AvatarURL,
		Role: "ADMIN",
		Status: "ACTIVE",
	}

	return s.repo.Create(ctx, newAccount)
}

func (s *AccountService) Login(ctx *gin.Context, req *dto.LoginAccountRequest) (string, error) {

	var existing *model.Account

	if existing, _ = s.repo.FindByAccountID(ctx, req.AccountID) ; existing == nil {
		return "", dto.CErrLoginFailed
	}

	//fmt.Print("[DEBUG] existing: ")
	//fmt.Println(existing)

	if cryption.VerifyPassword(req.Password, existing.PasswordHash) == false {
		return "", dto.CErrLoginFailed
	}

	//fmt.Print("[DEBUG] req.Password, existing.PasswordHash: ")
	//fmt.Print(req.Password)
	//fmt.Println(existing.PasswordHash)

	return s.jwt.GenerateJWT(existing.AccountID, existing.Role)
}

func (s *AccountService) List(ctx *gin.Context, req *dto.ListAccountRequest) ([]*dto.AccountSummary, error) {
	var accounts []*dto.AccountSummary
	var datas	 []*model.Account
	var err		 error

	//fmt.Print("[DEBUG] req : ")
	//fmt.Println(req)

	if req.SortBy == "" {
		req.SortBy = "id"
	}

	if req.SortDir == "" {
		req.SortDir = "desc"
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	datas, err = s.repo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	accounts = make([]*dto.AccountSummary, len(datas))

	for idx, data := range datas {
		accounts[idx] = &dto.AccountSummary{
			Id: data.ID,
			AccountID: data.AccountID,
			Role: data.Role,
		}
	}

	return accounts, nil
}

func (s *AccountService) GetAccount(ctx *gin.Context, accountName string) (*model.Account, error) {
	return s.repo.FindByAccountID(ctx, accountName)
}

func (s *AccountService) Update(ctx *gin.Context, account string, req dto.UpdateAccountRequest) (*dto.UpdateAccountResponse, error) {
	var changed *dto.UpdateAccountResponse
	var data *model.Account
	var err error

	updates := map[string]interface{}{}

    if req.Password != "" {
        hashed, _ := cryption.HashPassword(req.Password)
        updates["password_hash"] = hashed
    }
    if req.Nickname != "" {
        updates["nickname"] = req.Nickname
    }
    if req.AvatarURL != "" {
        updates["avatar_url"] = req.AvatarURL
    }

	var changedFields []string
    for key := range updates {
        changedFields = append(changedFields, key)
    }
	
	if data, err = s.repo.Update(ctx, account, updates) ; err != nil {
		return nil, err
	}

	changed = &dto.UpdateAccountResponse{
		Data: dto.UpdateAccountData{
			ID: data.ID,
			AccountID: data.AccountID,
			Password_updated: data.PasswordHash == updates["password_hash"],
			Nickname: data.Nickname,
			AvatarURL: data.AvatarURL,
		},
		Diff: dto.CommonUpdateDiff{
			ChangedFields: changedFields,
		},
	}

    return changed, err
}