-- CreateTable
CREATE TABLE "PostingScheduleDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT NOT NULL,
    "subreddits" TEXT NOT NULL,
    "isCyclicalRotation" BOOLEAN NOT NULL,
    "lastSourcedSubreddit" INTEGER NOT NULL
);
