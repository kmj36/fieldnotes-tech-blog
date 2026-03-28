package repository

import (
	"errors"

	"github.com/kmj36/fieldnotes-tech-blog/internal/model"
	"gorm.io/gorm"
)

// 관리자 계정 관련 DB 작업
type AccountRepository struct {db *gorm.DB}

func NewAccountRepository(db *gorm.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (repo *AccountRepository) Create(newAccount *model.Account) error {
	return repo.db.Create(newAccount).Error
}

func (repo *AccountRepository) FindByAccountID(accountID string) (*model.Account, error) {
    var account model.Account
	
    result := repo.db.Where("account_id = ?", accountID).First(&account)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &account, nil
}

func (repo *AccountRepository) FindByNickname(accountNickname string) (*model.Account, error) {
    var account model.Account
	
    result := repo.db.Where("nickname = ?", accountNickname).First(&account)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil // 없으면 nil 반환
        }
        return nil, result.Error
    }
    return &account, nil
}