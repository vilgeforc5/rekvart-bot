-- AlterTable
ALTER TABLE "AutoMessageConfig" ALTER COLUMN "unsubscribeSuccessText" SET DEFAULT '✅ Вы отписались от автоматических сообщений.';

-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "isFullLine" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "ProektPriceContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProektPriceContent_pkey" PRIMARY KEY ("id")
);
