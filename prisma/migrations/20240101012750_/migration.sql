/*
  Warnings:

  - Added the required column `hasPostingTimeBeenUpdatedToday` to the `PersistedValuesRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `postingTimeForToday` on table `PersistedValuesRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PersistedValuesRecord" ADD COLUMN     "hasPostingTimeBeenUpdatedToday" BOOLEAN NOT NULL,
ALTER COLUMN "postingTimeForToday" SET NOT NULL;
