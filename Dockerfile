FROM node:22-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
# npm install (not ci) — avoids lockfile sync failures across npm versions
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
