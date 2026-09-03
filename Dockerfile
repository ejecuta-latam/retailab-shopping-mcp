# Multi-stage: npm build (Astro static) → nginx
# Matches the RealsLab VM pipeline; this app has no Node adapter.

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shopping-mcp/package.json ./packages/shopping-mcp/package.json
RUN npm install

COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
