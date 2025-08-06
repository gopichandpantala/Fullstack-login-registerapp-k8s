# ../backend/Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ⬇️ Make sure this copies the .env file into the image
COPY .env .env

EXPOSE 5000

CMD ["node", "server.js"]
