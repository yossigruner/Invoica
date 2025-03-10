/*
  Warnings:

  - You are about to drop the column `billing_address` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billing_city` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billing_country` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billing_email` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billing_name` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billing_phone` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `billing_zip` on the `invoices` table. All the data in the column will be lost.
  - Made the column `customer_id` on table `invoices` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_customer_id_fkey";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "billing_address",
DROP COLUMN "billing_city",
DROP COLUMN "billing_country",
DROP COLUMN "billing_email",
DROP COLUMN "billing_name",
DROP COLUMN "billing_phone",
DROP COLUMN "billing_zip",
ALTER COLUMN "customer_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
