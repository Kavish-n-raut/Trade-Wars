-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stockId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "symbol" TEXT,
    "sentiment" TEXT,
    "publishedAt" DATETIME,
    "authorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_News" ("authorId", "content", "createdAt", "id", "title", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "title", "updatedAt" FROM "News";
DROP TABLE "News";
ALTER TABLE "new_News" RENAME TO "News";
CREATE TABLE "new_Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentPrice" REAL NOT NULL,
    "changePercent" REAL NOT NULL,
    "apiPrice" REAL NOT NULL DEFAULT 0,
    "manualOffset" REAL NOT NULL DEFAULT 0,
    "isTracking" BOOLEAN NOT NULL DEFAULT true,
    "sector" TEXT,
    "marketCap" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Stock" ("changePercent", "createdAt", "currentPrice", "id", "name", "symbol", "updatedAt") SELECT "changePercent", "createdAt", "currentPrice", "id", "name", "symbol", "updatedAt" FROM "Stock";
DROP TABLE "Stock";
ALTER TABLE "new_Stock" RENAME TO "Stock";
CREATE UNIQUE INDEX "Stock_symbol_key" ON "Stock"("symbol");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
