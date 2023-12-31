-- CreateTable
CREATE TABLE "QueuedInstagramPost" (
    "id" TEXT NOT NULL,
    "redditPostId" TEXT NOT NULL,
    "subredditDisplayName" TEXT NOT NULL,
    "redditOP" TEXT NOT NULL,
    "artworkTitle" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "linkToArtworkSource" TEXT NOT NULL,
    "isBackup" BOOLEAN NOT NULL,
    "postingTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueuedInstagramPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedInstagramPost" (
    "id" TEXT NOT NULL,
    "redditPostUrl" TEXT NOT NULL,
    "instagramPostUrl" TEXT NOT NULL,

    CONSTRAINT "SubmittedInstagramPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingScheduleDay" (
    "id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subredditDisplayNames" TEXT NOT NULL,
    "isCyclicalRotation" BOOLEAN NOT NULL,
    "lastSourcedSubreddit" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "QueuedInstagramPost_redditPostId_key" ON "QueuedInstagramPost"("redditPostId");

-- CreateIndex
CREATE UNIQUE INDEX "PostingScheduleDay_id_key" ON "PostingScheduleDay"("id");
