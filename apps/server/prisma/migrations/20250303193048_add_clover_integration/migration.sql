-- CreateTable
CREATE TABLE "CloverIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloverIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CloverIntegration_userId_key" ON "CloverIntegration"("userId");

-- CreateIndex
CREATE INDEX "CloverIntegration_userId_idx" ON "CloverIntegration"("userId");

-- CreateIndex
CREATE INDEX "CloverIntegration_merchantId_idx" ON "CloverIntegration"("merchantId");

-- AddForeignKey
ALTER TABLE "CloverIntegration" ADD CONSTRAINT "CloverIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
