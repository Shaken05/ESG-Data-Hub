/*
  Warnings:

  - You are about to drop the column `standard` on the `metrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "departments" ADD COLUMN "messenger" TEXT;
ALTER TABLE "departments" ADD COLUMN "phone" TEXT;
ALTER TABLE "departments" ADD COLUMN "roleInDepartment" TEXT;

-- AlterTable
ALTER TABLE "metric_links" ADD COLUMN "accuracy" INTEGER;
ALTER TABLE "metric_links" ADD COLUMN "completeness" INTEGER;
ALTER TABLE "metric_links" ADD COLUMN "issueType" TEXT;
ALTER TABLE "metric_links" ADD COLUMN "timeliness" INTEGER;

-- CreateTable
CREATE TABLE "standards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "metric_standards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metricId" INTEGER NOT NULL,
    "standardId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "metric_standards_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "metrics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "metric_standards_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "standards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "scope" TEXT,
    "definition" TEXT,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_metrics" ("category", "createdAt", "description", "id", "name", "status", "unit", "updatedAt") SELECT "category", "createdAt", "description", "id", "name", "status", "unit", "updatedAt" FROM "metrics";
DROP TABLE "metrics";
ALTER TABLE "new_metrics" RENAME TO "metrics";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "standards_name_key" ON "standards"("name");

-- CreateIndex
CREATE UNIQUE INDEX "metric_standards_metricId_standardId_key" ON "metric_standards"("metricId", "standardId");
