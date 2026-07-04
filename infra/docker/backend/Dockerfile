# golang 빌드
FROM golang:1.26.4-alpine3.23 AS builder

WORKDIR /app

COPY backend/ .
RUN go build -o bin/fieldnotes_v1_0_0 ./cmd/api/main.go

# backend 실행
FROM alpine:3.23.5 AS runtime
WORKDIR /app

RUN apk add --no-cache tzdata \
&& mkdir -p static \
&& addgroup -S nonroot \
&& adduser -S nonroot -G nonroot

COPY --from=builder /app/bin/fieldnotes_v1_0_0 /usr/local/bin/fieldnotes_v1_0_0

USER nonroot

CMD ["fieldnotes_v1_0_0"]