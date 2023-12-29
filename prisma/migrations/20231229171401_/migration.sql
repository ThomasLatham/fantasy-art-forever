/*
  Warnings:

  - The primary key for the `PostingScheduleDay` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostingScheduleDay" (
    "id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
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
