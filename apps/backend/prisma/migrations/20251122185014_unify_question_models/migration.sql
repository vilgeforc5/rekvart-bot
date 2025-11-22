CREATE TYPE "FormType" AS ENUM ('ZAMER', 'CONSULTACYA');

CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT,
    "order" INTEGER NOT NULL,
    "formType" "FormType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionVariant" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "needsPhone" BOOLEAN NOT NULL DEFAULT false,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionVariant_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Question" ("text", "type", "order", "formType", "createdAt", "updatedAt")
SELECT "text", "type", "order", 'ZAMER'::"FormType", "createdAt", "updatedAt"
FROM "ZamerQuestion"
ORDER BY "id";

INSERT INTO "Question" ("text", "type", "order", "formType", "createdAt", "updatedAt")
SELECT "text", NULL, "order", 'CONSULTACYA'::"FormType", "createdAt", "updatedAt"
FROM "ConsultacyaQuestion"
ORDER BY "id";

DO $$
DECLARE
    old_question_id INT;
    new_question_id INT;
    question_record RECORD;
BEGIN
    FOR question_record IN 
        SELECT "id", "text", "type", "order" 
        FROM "ZamerQuestion" 
        ORDER BY "id"
    LOOP
        SELECT "id" INTO new_question_id 
        FROM "Question" 
        WHERE "formType" = 'ZAMER' AND "order" = question_record."order";
        
        INSERT INTO "QuestionVariant" ("text", "order", "needsPhone", "questionId", "createdAt", "updatedAt")
        SELECT "text", "order", "needsPhone", new_question_id, "createdAt", "updatedAt"
        FROM "ZamerVariant"
        WHERE "questionId" = question_record."id"
        ORDER BY "order";
    END LOOP;
    
    FOR question_record IN 
        SELECT "id", "text", "order" 
        FROM "ConsultacyaQuestion" 
        ORDER BY "id"
    LOOP
        SELECT "id" INTO new_question_id 
        FROM "Question" 
        WHERE "formType" = 'CONSULTACYA' AND "order" = question_record."order";
        
        INSERT INTO "QuestionVariant" ("text", "order", "needsPhone", "questionId", "createdAt", "updatedAt")
        SELECT "text", "order", "needsPhone", new_question_id, "createdAt", "updatedAt"
        FROM "ConsultacyaVariant"
        WHERE "questionId" = question_record."id"
        ORDER BY "order";
    END LOOP;
END $$;

DROP TABLE "ZamerVariant";
DROP TABLE "ConsultacyaVariant";
DROP TABLE "ZamerQuestion";
DROP TABLE "ConsultacyaQuestion";

CREATE UNIQUE INDEX "Question_formType_order_key" ON "Question"("formType", "order");

CREATE UNIQUE INDEX "QuestionVariant_questionId_order_key" ON "QuestionVariant"("questionId", "order");

ALTER TABLE "QuestionVariant" ADD CONSTRAINT "QuestionVariant_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

