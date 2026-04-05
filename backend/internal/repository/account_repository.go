package repository

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/kmj36/fieldnotes-tech-blog/internal/dto"
	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

// 관리자 계정 관련 DB 작업
type AccountRepository struct {db *gorm.DB}

func NewAccountRepository(db *gorm.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (repo *AccountRepository) Create(ctx *gin.Context, newAccount *model.Account) error {
    query := repo.db.WithContext(ctx)

	return query.Create(newAccount).Error
}

func (repo *AccountRepository) Update(ctx *gin.Context, account string, updates map[string]interface{}) (*model.Account, error) {
    var accountData model.Account

    err := repo.db.WithContext(ctx).
        Where("account_id = ?", account).
        First(&accountData).Error
    if err != nil {
        return nil, err
    }

    // 업데이트 후 재조회
    err = repo.db.WithContext(ctx).
        Model(&accountData).
        Updates(updates).Error
    if err != nil {
        return nil, err
    }

    return &accountData, nil
}

func (repo *AccountRepository) FindByAccountID(ctx *gin.Context, accountID string) (*model.Account, error) {
    var account model.Account

    query := repo.db.WithContext(ctx)
	
    result := query.Where("account_id = ?", accountID).First(&account)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &account, nil
}

func (repo *AccountRepository) FindByNickname(ctx *gin.Context, accountNickname string) (*model.Account, error) {
    var account model.Account

    query := repo.db.WithContext(ctx)
	
    result := query.Where("nickname = ?", accountNickname).First(&account)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &account, nil
}

func (repo *AccountRepository) List(ctx *gin.Context, req *dto.ListAccountRequest) ([]*model.Account, error) {
    var accounts []*model.Account
    var err      error

    query := repo.db.WithContext(ctx)

    if req.ID != 0 {
        query = query.Where("id = ?", req.ID)
    }

    if req.AccountID != "" {
        query = query.Where("account_id = ?", req.AccountID)
    }

    if req.Role != "" {
        query = query.Order(req.SortBy + " " + req.SortDir)
    }

    query = query.Limit(req.Limit)
    err = query.Find(&accounts).Error

    return accounts, err
}

