/*
  Warnings:

  - The `subredditDisplayNames` column on the `PostingScheduleDay` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PostingScheduleDay" DROP COLUMN "subredditDisplayNames",
ADD COLUMN     "subredditDisplayNames" TEXT[];
