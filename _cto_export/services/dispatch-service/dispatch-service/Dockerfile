# ---- Builder Stage ----
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git (needed for go modules)
RUN apk add --no-cache git

# Copy go.mod and download deps
COPY go.mod go.sum ./
RUN go mod download

# Copy the service source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o dispatch-service ./cmd/dispatch

# ---- Runtime Stage ----
FROM alpine:3.18

# Add non-root user
RUN addgroup -S app && adduser -S -G app app
USER app

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/dispatch-service .

EXPOSE 8080

CMD ["./dispatch-service"]