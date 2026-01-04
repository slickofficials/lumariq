FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev=false

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4004
CMD ["npm", "start"]