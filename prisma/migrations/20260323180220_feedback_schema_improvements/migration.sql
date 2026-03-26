/*
  Warnings:

  - Added the required column `updatedAt` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('upvote', 'downvote');

-- CreateEnum
CREATE TYPE "RoadmapVisibility" AS ENUM ('everyone', 'teamOnly');

-- CreateEnum
CREATE TYPE "BoardDefaultSorting" AS ENUM ('trending', 'recent', 'oldest', 'top');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('text', 'number', 'url', 'date', 'boolean', 'dropdown', 'multiselect');

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "allowUserToTaggingPosts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "anonymousCommenting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "anonymousPosting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "anonymousUpvoting" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "boardGreeting" JSONB,
ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "commentModeration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "darkBgColor" TEXT,
ADD COLUMN     "defaultSorting" "BoardDefaultSorting" NOT NULL DEFAULT 'trending',
ADD COLUMN     "defaultTheme" TEXT DEFAULT 'system',
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "downVoting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideAllStatusesFromPublicView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideCompletedAndCanceledStatuses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideLeaderBoard" BOOLEAN DEFAULT false,
ADD COLUMN     "hideVotedCountUntilVoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postModeration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privateEta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicPortalMenus" JSONB,
ADD COLUMN     "socialImage" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "statusId" TEXT,
    "tagId" TEXT,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "description" JSONB,
    "postVisibility" "Visibility" NOT NULL DEFAULT 'public',
    "enableComment" BOOLEAN NOT NULL DEFAULT true,
    "pinnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL DEFAULT 'upvote',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" JSONB NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL DEFAULT 'upvote',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" JSONB NOT NULL,
    "defaultSorting" "BoardDefaultSorting" NOT NULL DEFAULT 'trending',
    "greeting" JSONB,
    "visibility" "Visibility" NOT NULL DEFAULT 'public',
    "allowSubscribe" BOOLEAN NOT NULL DEFAULT true,
    "disableFollowupQuestions" BOOLEAN NOT NULL DEFAULT false,
    "disableEndUserPosting" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" JSONB NOT NULL,
    "visibility" "RoadmapVisibility" NOT NULL DEFAULT 'everyone',
    "baseFilter" TEXT NOT NULL DEFAULT '',
    "copiedFromId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapColumn" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" JSONB,
    "color" TEXT NOT NULL,
    "baseFilter" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL,
    "options" TEXT[],
    "placeholder" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "showAnswerToEveryone" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BoardToCustomField" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BoardToCustomField_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Feedback_organizationId_idx" ON "Feedback"("organizationId");

-- CreateIndex
CREATE INDEX "Feedback_boardId_idx" ON "Feedback"("boardId");

-- CreateIndex
CREATE INDEX "Feedback_statusId_idx" ON "Feedback"("statusId");

-- CreateIndex
CREATE INDEX "Feedback_tagId_idx" ON "Feedback"("tagId");

-- CreateIndex
CREATE INDEX "Feedback_authorId_idx" ON "Feedback"("authorId");

-- CreateIndex
CREATE INDEX "Vote_feedbackId_idx" ON "Vote"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_feedbackId_voterId_key" ON "Vote"("feedbackId", "voterId");

-- CreateIndex
CREATE INDEX "Comment_feedbackId_idx" ON "Comment"("feedbackId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "CommentVote_commentId_idx" ON "CommentVote"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_commentId_voterId_key" ON "CommentVote"("commentId", "voterId");

-- CreateIndex
CREATE INDEX "Board_organizationId_idx" ON "Board"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Board_organizationId_slug_key" ON "Board"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "Roadmap_organizationId_idx" ON "Roadmap"("organizationId");

-- CreateIndex
CREATE INDEX "RoadmapColumn_roadmapId_idx" ON "RoadmapColumn"("roadmapId");

-- CreateIndex
CREATE INDEX "Status_organizationId_idx" ON "Status"("organizationId");

-- CreateIndex
CREATE INDEX "Tag_organizationId_idx" ON "Tag"("organizationId");

-- CreateIndex
CREATE INDEX "CustomField_organizationId_idx" ON "CustomField"("organizationId");

-- CreateIndex
CREATE INDEX "_BoardToCustomField_B_index" ON "_BoardToCustomField"("B");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapColumn" ADD CONSTRAINT "RoadmapColumn_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToCustomField" ADD CONSTRAINT "_BoardToCustomField_A_fkey" FOREIGN KEY ("A") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToCustomField" ADD CONSTRAINT "_BoardToCustomField_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
