# Node.js 빌드
FROM node:26.4.0-alpine3.24 AS builder

WORKDIR /app

ARG VITE_APP_NAME
ARG VITE_MODE
ARG VITE_API_BASE_URL

COPY fieldnotes/package*.json .
RUN npm ci

COPY fieldnotes/ .
RUN npm run build

# Nginx 실행
FROM nginx:1.30.3-alpine3.23 AS runtime

RUN addgroup -S nonroot \
&& adduser -S nonroot -G nonroot

COPY --from=builder /app/dist /usr/share/nginx/html

USER nonroot
