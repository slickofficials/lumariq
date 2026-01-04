FROM rust:1.84 AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/wallet-ledger /usr/local/bin/wallet-ledger

EXPOSE 7070
CMD ["wallet-ledger"]