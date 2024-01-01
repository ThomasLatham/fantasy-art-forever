-- AlterTable
ALTER TABLE "QueuedInstagramPost" ALTER COLUMN "postingTime" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PersistedValuesRecord" (
    "id" TEXT NOT NULL,

    CONSTRAINT "PersistedValuesRecord_pkey" PRIMARY KEY ("id")
);
