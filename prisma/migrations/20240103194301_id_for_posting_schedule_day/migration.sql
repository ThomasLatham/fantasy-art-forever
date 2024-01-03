-- DropIndex
DROP INDEX "PostingScheduleDay_id_key";

-- AlterTable
ALTER TABLE "PostingScheduleDay" ADD CONSTRAINT "PostingScheduleDay_pkey" PRIMARY KEY ("id");
