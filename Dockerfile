# Root Dockerfile for CI that runs `docker build .` from repository root.
# It builds backend service by default. If нужен frontend, можно сделать отдельный файл.

FROM node:20-alpine AS backend
WORKDIR /app
RUN apk add --no-cache openssl

COPY backend/package*.json ./
RUN npm install --only=production

COPY backend/prisma ./prisma
COPY backend .

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/esg_inventory?schema=public"

RUN npx prisma generate
EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
