-- CreateTable
CREATE TABLE "ZamerQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZamerQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZamerVariant" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZamerVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZamerSummary" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZamerSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZamerQuestion_order_key" ON "ZamerQuestion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ZamerVariant_questionId_order_key" ON "ZamerVariant"("questionId", "order");

-- AddForeignKey
ALTER TABLE "ZamerVariant" ADD CONSTRAINT "ZamerVariant_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ZamerQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
