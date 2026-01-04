FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/wallet-ledger .
ENV RUST_LOG=info
EXPOSE 7070
CMD ["./wallet-ledger"]
