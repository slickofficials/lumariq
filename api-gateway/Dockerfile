# Stage 1: builder
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: runtime (non-root)
FROM node:20-alpine
# create non-root user
RUN addgroup -S app && adduser -S -G app app
WORKDIR /app
# install curl for healthchecks
RUN apk add --no-cache ca-certificates curl
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# adjust permissions
RUN chown -R app:app /app
USER app
ENV NODE_ENV=production
EXPOSE 3050
CMD ["node", "dist/server.js"]