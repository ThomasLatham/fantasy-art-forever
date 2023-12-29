/*
  Warnings:

  - Added the required column `description` to the `PostingScheduleDay` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostingScheduleDay" (
    "id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subreddits" TEXT NOT NULL,
    "isCyclicalRotation" BOOLEAN NOT NULL,
    "lastSourcedSubreddit" INTEGER NOT NULL
);
INSERT INTO "new_PostingScheduleDay" ("id", "isCyclicalRotation", "lastSourcedSubreddit", "nickname", "subreddits") SELECT "id", "isCyclicalRotation", "lastSourcedSubreddit", "nickname", "subreddits" FROM "PostingScheduleDay";
DROP TABLE "PostingScheduleDay";
ALTER TABLE "new_PostingScheduleDay" RENAME TO "PostingScheduleDay";
CREATE UNIQUE INDEX "PostingScheduleDay_id_key" ON "PostingScheduleDay"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
