-- CreateTable
CREATE TABLE "TopicContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "userMessagePrefix" TEXT NOT NULL,
    "operatorConnectedMessage" TEXT NOT NULL,
    "operatorDisconnectedMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicContent_pkey" PRIMARY KEY ("id")
);
