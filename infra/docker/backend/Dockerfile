# golang 빌드
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY backend/ .
RUN go build -o bin/fieldnotes_v1_0_0 ./cmd/api/main.go

# backend 실행
FROM alpine:latest

WORKDIR /app
RUN mkdir -p static

COPY --from=builder /app/bin/fieldnotes_v1_0_0 /usr/local/bin/fieldnotes_v1_0_0
CMD ["fieldnotes_v1_0_0"]