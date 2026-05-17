-- AlterEnum
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'OTHER';

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");

-- Migrate existing className values into Class rows
INSERT INTO "Class" ("id", "name", "code", "createdAt", "updatedAt")
SELECT
    'cls_' || substr(md5("className"), 1, 22),
    "className",
    'CLA' || upper(substr(md5("className"), 1, 6)),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "className" FROM "Student") AS distinct_classes;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "classId" TEXT;

UPDATE "Student" AS s
SET "classId" = c."id"
FROM "Class" AS c
WHERE c."name" = s."className";

ALTER TABLE "Student" DROP COLUMN "className";

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
