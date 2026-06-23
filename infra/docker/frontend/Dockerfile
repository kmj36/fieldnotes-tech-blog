# Node.js 빌드
FROM node:lts-alpine3.23 AS builder

WORKDIR /app

ARG VITE_APP_NAME
ARG VITE_MODE
ARG VITE_API_BASE_URL

COPY fieldnotes/package*.json .
RUN npm ci

COPY fieldnotes/ .
RUN npm run build

# Nginx 실행
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html