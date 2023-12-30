/*
  Warnings:

  - You are about to drop the column `subreddits` on the `PostingScheduleDay` table. All the data in the column will be lost.
  - Added the required column `subredditDisplayNames` to the `PostingScheduleDay` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostingScheduleDay" (
    "id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subredditDisplayNames" TEXT NOT NULL,
    "isCyclicalRotation" BOOLEAN NOT NULL,
    "lastSourcedSubreddit" INTEGER NOT NULL
);
INSERT INTO "new_PostingScheduleDay" ("description", "id", "isCyclicalRotation", "lastSourcedSubreddit", "nickname") SELECT "description", "id", "isCyclicalRotation", "lastSourcedSubreddit", "nickname" FROM "PostingScheduleDay";
DROP TABLE "PostingScheduleDay";
ALTER TABLE "new_PostingScheduleDay" RENAME TO "PostingScheduleDay";
CREATE UNIQUE INDEX "PostingScheduleDay_id_key" ON "PostingScheduleDay"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
