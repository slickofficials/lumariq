FROM node:20-alpine

WORKDIR /app

# System deps
RUN apk add --no-cache openssl ca-certificates

# Install deps (network hardened)
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && PRISMA_SKIP_POSTINSTALL_GENERATE=1 PRISMA_CLI_BINARY_TARGETS=linux-musl npm install --legacy-peer-deps --ignore-scripts

# App source
RUN npm ci --no-audit --no-fund
ENV NODE_ENV=production
COPY . .

# Build TS
RUN npm run build

CMD ["node","dist/index.js"]
