FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

ENV PORT=4300
EXPOSE 4300

CMD ["node", "dist/index.js"]