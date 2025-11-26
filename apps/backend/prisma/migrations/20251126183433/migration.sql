-- AlterTable
ALTER TABLE "TelegramUser" ADD COLUMN     "autoMessageCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TopicConnection" ADD COLUMN     "lastAdminMessageText" TEXT,
ADD COLUMN     "telegramUserId" INTEGER;

-- CreateTable
CREATE TABLE "AutoMessageConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "scheduleHour" INTEGER NOT NULL DEFAULT 9,
    "scheduleMinute" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoMessageConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TopicConnection" ADD CONSTRAINT "TopicConnection_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "TelegramUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
