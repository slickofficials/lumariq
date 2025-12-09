# -----------------------------
# Stage 1 — Builder
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for caching
COPY package*.json ./
RUN npm ci --omit=dev=false

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# -----------------------------
# Stage 2 — Production image
# -----------------------------
FROM node:20-alpine AS prod
WORKDIR /app

# Copy only what production needs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4001
CMD ["npm", "start"]