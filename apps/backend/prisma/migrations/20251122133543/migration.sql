/*
  Warnings:

  - You are about to drop the column `enabled` on the `Command` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Command" DROP COLUMN "enabled";

-- CreateTable
CREATE TABLE "StartContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StartContent_pkey" PRIMARY KEY ("id")
);
