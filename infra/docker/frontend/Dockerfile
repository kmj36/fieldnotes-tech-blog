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
  && adduser -S nonroot -G nonroot \
  && mkdir -p /var/cache/nginx/client_temp \
              /var/cache/nginx/proxy_temp \
              /var/cache/nginx/fastcgi_temp \
              /var/cache/nginx/uwsgi_temp \
              /var/cache/nginx/scgi_temp \
              /var/run \
  && chown -R nonroot:nonroot /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html /etc/nginx

COPY --from=builder /app/dist /usr/share/nginx/html

USER nonroot