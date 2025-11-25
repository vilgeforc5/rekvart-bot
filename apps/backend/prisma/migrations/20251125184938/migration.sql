-- CreateTable
CREATE TABLE "TopicConnection" (
    "id" SERIAL NOT NULL,
    "topicName" TEXT NOT NULL,
    "userChatId" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicConnection_topicId_key" ON "TopicConnection"("topicId");

-- CreateIndex
CREATE INDEX "TopicConnection_userChatId_isActive_idx" ON "TopicConnection"("userChatId", "isActive");
