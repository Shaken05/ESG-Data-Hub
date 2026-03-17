-- AlterTable
ALTER TABLE "data_sources" ADD COLUMN "sourceKind" TEXT;
ALTER TABLE "data_sources" ADD COLUMN "systemOrFile" TEXT;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN "accessLevel" TEXT;
ALTER TABLE "departments" ADD COLUMN "contactChannel" TEXT;
ALTER TABLE "departments" ADD COLUMN "dataSteward" TEXT;
ALTER TABLE "departments" ADD COLUMN "phone" TEXT;

-- AlterTable
ALTER TABLE "metrics" ADD COLUMN "scope" TEXT;
ALTER TABLE "metrics" ADD COLUMN "standards" TEXT;
ALTER TABLE "metrics" ADD COLUMN "subcategory" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "userEmail" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "action" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
