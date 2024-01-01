/*
  Warnings:

  - Added the required column `artoworkImageUrl` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QueuedInstagramPost" ADD COLUMN     "artoworkImageUrl" TEXT NOT NULL;
