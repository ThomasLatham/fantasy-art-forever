/*
  Warnings:

  - You are about to drop the column `artoworkImageUrl` on the `QueuedInstagramPost` table. All the data in the column will be lost.
  - Added the required column `artworkImageUrl` to the `QueuedInstagramPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QueuedInstagramPost" DROP COLUMN "artoworkImageUrl",
ADD COLUMN     "artworkImageUrl" TEXT NOT NULL;
