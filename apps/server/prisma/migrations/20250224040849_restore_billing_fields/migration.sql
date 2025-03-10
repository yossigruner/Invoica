/*
  Warnings:

  - Added the required column `billing_email` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billing_name` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_customer_id_fkey";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "billing_address" TEXT,
ADD COLUMN     "billing_city" TEXT,
ADD COLUMN     "billing_country" TEXT,
ADD COLUMN     "billing_email" TEXT NOT NULL,
ADD COLUMN     "billing_name" TEXT NOT NULL,
ADD COLUMN     "billing_phone" TEXT,
ADD COLUMN     "billing_zip" TEXT,
ALTER COLUMN "customer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
