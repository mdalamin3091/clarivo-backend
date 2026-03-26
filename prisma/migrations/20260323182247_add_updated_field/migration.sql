/*
  Warnings:

  - Added the required column `updatedAt` to the `CommentVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `Verification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Verification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CommentVote" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Verification" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL;
