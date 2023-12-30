/*
  Warnings:

  - You are about to drop the column `attributionUrl` on the `QueuedInstagramPost` table. All the data in the column will be lost.
  - You are about to drop the column `redditPoster` on the `QueuedInstagramPost` table. All the data in the column will be lost.
  - Added the required column `artworkTitle` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isBackup` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkToArtworkSource` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postingTime` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redditOP` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SubmittedInstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "redditPostUrl" TEXT NOT NULL,
    "instagramPostUrl" TEXT NOT NULL
);

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
    "postingTime" INTEGER NOT NULL
);
INSERT INTO "new_QueuedInstagramPost" ("artistName", "id", "redditPostUrl") SELECT "artistName", "id", "redditPostUrl" FROM "QueuedInstagramPost";
DROP TABLE "QueuedInstagramPost";
ALTER TABLE "new_QueuedInstagramPost" RENAME TO "QueuedInstagramPost";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
