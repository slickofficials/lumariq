-- CreateTable
CREATE TABLE "LiquidityProvider" (
    "id" SERIAL NOT NULL,
    "poolId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiquidityProvider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LiquidityProvider" ADD CONSTRAINT "LiquidityProvider_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "LiquidityPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
