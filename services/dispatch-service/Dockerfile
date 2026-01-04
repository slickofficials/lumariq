# ---- Builder Stage ----
FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY . .
RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -tags production -o dispatch-service ./cmd/dispatch

RUN addgroup -S app && adduser -S -G app app

# ---- Runtime Stage ----
FROM alpine:3.18

RUN addgroup -S app && adduser -S -G app app
USER app

WORKDIR /app

COPY --from=builder /app/dispatch-service .

EXPOSE 4015

CMD ["./dispatch-service"]