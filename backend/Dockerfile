FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl

# Установим только production-зависимости
COPY package*.json ./
RUN npm install --only=production

# Prisma schema и миграции
COPY prisma ./prisma

# Остальной код
COPY . .

ENV NODE_ENV=production
ENV PORT=3000
# DATABASE_URL должен быть задан внешним окружением в проде (например, Render, Heroku и т.п.)
# для локальной разработки через docker-compose можно использовать:
# postgresql://postgres:postgres@postgres:5432/esg_inventory?schema=public

RUN npx prisma generate

EXPOSE 3000

# При запуске прогоняем синхронизацию схемы с БД и стартуем сервер
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]

