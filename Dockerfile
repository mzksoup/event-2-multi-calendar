# --- Builder ---
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# 依存関係インストール用ファイルを先にコピー
COPY package*.json tsconfig.json vite.config.ts postcss.config.js tailwind.config.ts drizzle.config.ts ./
# ソースをコピーDo
COPY client/ client/
COPY server/ server/
COPY shared/ shared/

RUN npm ci
# ビルド
RUN npm run build

# --- Production ---
FROM node:18-alpine AS production
WORKDIR /usr/src/app

# 本番依存のみインストール
COPY package*.json ./
RUN npm ci --production

# ビルド成果物をコピー
COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/index.js"]