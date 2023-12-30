/*
  Warnings:

  - You are about to drop the column `redditPostUrl` on the `QueuedInstagramPost` table. All the data in the column will be lost.
  - Added the required column `redditPostId` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subredditDisplayName` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QueuedInstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "redditPostId" TEXT NOT NULL,
    "subredditDisplayName" TEXT NOT NULL,
    "redditOP" TEXT NOT NULL,
    "artworkTitle" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "linkToArtworkSource" TEXT NOT NULL,
    "isBackup" BOOLEAN NOT NULL,
    "postingTime" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_QueuedInstagramPost" ("artistName", "artworkTitle", "createdAt", "id", "isBackup", "linkToArtworkSource", "postingTime", "redditOP") SELECT "artistName", "artworkTitle", "createdAt", "id", "isBackup", "linkToArtworkSource", "postingTime", "redditOP" FROM "QueuedInstagramPost";
DROP TABLE "QueuedInstagramPost";
ALTER TABLE "new_QueuedInstagramPost" RENAME TO "QueuedInstagramPost";
CREATE UNIQUE INDEX "QueuedInstagramPost_redditPostId_key" ON "QueuedInstagramPost"("redditPostId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
