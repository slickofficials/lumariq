-- CreateTable
CREATE TABLE "LiquidityPool" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "baseReserve" DOUBLE PRECISION NOT NULL,
    "quoteReserve" DOUBLE PRECISION NOT NULL,
    "feeBps" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiquidityPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiquidityPool_symbol_key" ON "LiquidityPool"("symbol");
