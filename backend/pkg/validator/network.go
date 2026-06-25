package validator

import (
	"fmt"
	"net"
	"strconv"
)

/*
	addr 매개변수로 "192.168.0.1:80" 과 같은 'host:port' 문자열을 받습니다.
	전달된 네트워크 주소가 유효한 주소인 경우 nil 를 반환합니다.
*/
func ValidateHostPort(addr string) error {
	host, portStr, err := net.SplitHostPort(addr)
	if err != nil {
		return err
	}

	// IP 유효성 검사
	if ip := net.ParseIP(host); ip == nil {
		return fmt.Errorf("Invalid ip: %s", host)
	}

	// Port 유효성 검사
	port, err := strconv.Atoi(portStr)
	if err != nil || port < 1 || port > 65535 {
		return fmt.Errorf("Invalid port: %s", portStr)
	}

	return nil
}