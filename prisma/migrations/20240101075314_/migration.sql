/*
  Warnings:

  - You are about to drop the column `instagramPostUrl` on the `SubmittedInstagramPost` table. All the data in the column will be lost.
  - You are about to drop the column `redditPostUrl` on the `SubmittedInstagramPost` table. All the data in the column will be lost.
  - Added the required column `instagramPostId` to the `SubmittedInstagramPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redditPostId` to the `SubmittedInstagramPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubmittedInstagramPost" DROP COLUMN "instagramPostUrl",
DROP COLUMN "redditPostUrl",
ADD COLUMN     "instagramPostId" TEXT NOT NULL,
ADD COLUMN     "redditPostId" TEXT NOT NULL;
