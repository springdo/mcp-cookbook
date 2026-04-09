FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # If using TypeScript
EXPOSE 3000
CMD ["node", "build/index.js"]