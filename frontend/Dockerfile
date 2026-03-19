FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Запускаем Vite dev-сервер, доступный снаружи
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

