-- CreateTable
CREATE TABLE "metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT,
    "standard" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT,
    "updateFrequency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "owner" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "storage_locations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "locationName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "metric_links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metricId" INTEGER NOT NULL,
    "sourceId" INTEGER,
    "departmentId" INTEGER,
    "storageId" INTEGER,
    "qualityScore" INTEGER,
    "lastUpdate" DATETIME,
    "issues" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "metric_links_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "metrics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "metric_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "data_sources" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "metric_links_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "metric_links_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "storage_locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
