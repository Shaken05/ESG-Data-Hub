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
ENV DATABASE_URL="file:./prisma/dev.db"

RUN npx prisma generate

EXPOSE 3000

# При запуске контейнера прогоняем миграции и стартуем сервер
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]

