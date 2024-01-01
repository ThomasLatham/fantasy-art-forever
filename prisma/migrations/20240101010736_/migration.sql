/*
  Warnings:

  - You are about to drop the column `postingTime` on the `QueuedInstagramPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersistedValuesRecord" ADD COLUMN     "postingTimeForToday" INTEGER;

-- AlterTable
ALTER TABLE "QueuedInstagramPost" DROP COLUMN "postingTime";
