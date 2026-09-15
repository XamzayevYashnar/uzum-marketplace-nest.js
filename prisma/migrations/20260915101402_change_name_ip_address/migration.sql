/*
  Warnings:

  - You are about to drop the column `idAddress` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "idAddress",
ADD COLUMN     "ipAddress" TEXT;
