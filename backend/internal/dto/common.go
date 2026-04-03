package dto

import (
	"errors"
	"time"
)

// 앱 에러 정의
type AppError struct {
    Status  int
    Code    string
    Message string
}

// 루트 기본 필드
type ResponseWrapper[T any] struct {
	Status    int       `json:"status"`
    Code      string    `json:"code"`
    Detail    string    `json:"detail"`
    Message   string    `json:"message"`
    Timestamp time.Time `json:"timestamp"`
    Path      string    `json:"path"`
    Result    T         `json:"result,omitempty"` // 결과 obj 선택 필드
}

// Update 작업 변경 필드
type CommonUpdateDiff struct {
    ChangedFields []string		`json:"changed_fields"`
}

var CErrAccountAlreadyExists = errors.New("account already exists.")
var CErrNicknameAlreadyExists = errors.New("nickname already exists.")
var CErrLoginFailed = errors.New("Invalid credentials.")

// 에러 공통 리터럴
var ( 
    // 2xx
    ErrOK      = AppError{200, "E200_001", "정상적으로 처리되었습니다."}
    ErrCreated = AppError{201, "E201_001", "리소스가 성공적으로 생성되었습니다."}

    // 4xx
    ErrBadRequestMissing  = AppError{400, "E400_001", "필수 파라미터가 누락되었습니다."}
    ErrBadRequestType     = AppError{400, "E400_002", "요청 파라미터의 타입 또는 형식이 올바르지 않습니다."}
    ErrBadRequestRange    = AppError{400, "E400_003", "요청 파라미터의 값이 허용된 범위를 벗어났습니다."}
    ErrUnauthorized       = AppError{401, "E401_001", "인증에 실패하였습니다."}
    ErrForbidden          = AppError{403, "E403_001", "접근 권한이 없습니다."}
    ErrNotFound           = AppError{404, "E404_001", "요청한 리소스를 찾을 수 없습니다."}
    ErrMethodNotAllowed   = AppError{405, "E405_001", "허용되지 않은 메소드입니다."}
    ErrConflict           = AppError{409, "E409_001", "서버의 현재 상태와 요청이 충돌하였습니다."}

    // 5xx
    ErrInternal           = AppError{500, "E500_001", "서버 내부 에러가 발생하였습니다."}
    ErrBadGateway         = AppError{502, "E502_001", "외부 API 호출에 실패하였습니다."}
    ErrServiceUnavailable = AppError{503, "E503_001", "서버에 일시적인 장애가 발생하였습니다."}
)