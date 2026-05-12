package repository

import (
	"errors"
	"fmt"

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

func (repo *AccountRepository) Create(ctx *gin.Context, newAccount *model.Account) (*model.Account, error) {
    query := repo.db.WithContext(ctx)
    err := query.Create(newAccount).Error
    if err != nil {
        return nil, err
    }

	return newAccount, nil
}

func (repo *AccountRepository) Update(ctx *gin.Context, req *dto.UpdateAccountRequest, updates map[string]any) (*model.Account, error) {
    var accountData model.Account

    err := repo.db.WithContext(ctx).
        Where("account_id = ?", req.AccountID).
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

func (repo *AccountRepository) Delete(ctx *gin.Context, req *dto.DeleteAccountRequest) (*model.Account, error) {
    var accountData model.Account

    err := repo.db.WithContext(ctx).
        Where("account_id = ?", req.AccountID).
        First(&accountData).Error
    if err != nil {
        return nil, err
    }

    err = repo.db.WithContext(ctx).
        Delete(&accountData).Error
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
            return nil, nil
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

func (repo *AccountRepository) GetList(ctx *gin.Context, req *dto.ListAccountsRequest) ([]*model.Account, error) {
    var accounts []*model.Account

    query := repo.db.WithContext(ctx)

    if req.ID != nil {
        query = query.Where("id = ?", *req.ID)
    }
    
    if req.AccountID != nil {
        query = query.Where("account_id = ?", *req.AccountID)
    }

    if req.Nickname != nil {
        query = query.Where("nickname = ?", *req.Nickname)
    }

    if req.AvatarURL != nil {
        query = query.Where("avatar_url LIKE ?", fmt.Sprintf("%%%s%%", *req.AvatarURL))
    }

    if req.Role != nil {
        query = query.Where("role = ?", *req.Role)
    }
    
    if req.Status != nil {
        query = query.Where("status = ?", *req.Status)
    }

    query = query.Order(fmt.Sprintf("%s %s", req.SortBy, req.SortDir))
    query = query.Limit(int(req.Limit))

    if err := query.Find(&accounts).Error ; err != nil {
        return nil, err
    }

    return accounts, nil
}

