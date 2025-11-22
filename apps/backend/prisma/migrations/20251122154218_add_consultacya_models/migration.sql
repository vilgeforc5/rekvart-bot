-- CreateTable
CREATE TABLE "ConsultacyaQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultacyaQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultacyaVariant" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "needsPhone" BOOLEAN NOT NULL DEFAULT false,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultacyaVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultacyaSummary" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultacyaSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultacyaQuestion_order_key" ON "ConsultacyaQuestion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultacyaVariant_questionId_order_key" ON "ConsultacyaVariant"("questionId", "order");

-- AddForeignKey
ALTER TABLE "ConsultacyaVariant" ADD CONSTRAINT "ConsultacyaVariant_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ConsultacyaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
