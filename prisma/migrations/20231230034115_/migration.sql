-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QueuedInstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "redditPostUrl" TEXT NOT NULL,
    "redditOP" TEXT NOT NULL,
    "artworkTitle" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "linkToArtworkSource" TEXT NOT NULL,
    "isBackup" TEXT NOT NULL,
    "postingTime" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_QueuedInstagramPost" ("artistName", "artworkTitle", "id", "isBackup", "linkToArtworkSource", "postingTime", "redditOP", "redditPostUrl") SELECT "artistName", "artworkTitle", "id", "isBackup", "linkToArtworkSource", "postingTime", "redditOP", "redditPostUrl" FROM "QueuedInstagramPost";
DROP TABLE "QueuedInstagramPost";
ALTER TABLE "new_QueuedInstagramPost" RENAME TO "QueuedInstagramPost";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
