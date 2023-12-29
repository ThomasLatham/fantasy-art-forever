-- CreateTable
CREATE TABLE "QueuedInstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "redditPostUrl" TEXT NOT NULL,
    "redditPoster" TEXT NOT NULL,
    "attributionUrl" TEXT NOT NULL,
    "artistName" TEXT NOT NULL
);
