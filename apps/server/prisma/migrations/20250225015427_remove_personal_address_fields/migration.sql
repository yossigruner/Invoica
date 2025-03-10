/*
  Warnings:

  - You are about to drop the column `address` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "zip";
