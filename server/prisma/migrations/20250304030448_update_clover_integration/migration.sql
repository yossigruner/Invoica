/*
  Warnings:

  - A unique constraint covering the columns `[merchantId]` on the table `CloverIntegration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CloverIntegration_merchantId_key" ON "CloverIntegration"("merchantId");
