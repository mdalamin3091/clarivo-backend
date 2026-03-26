import { prisma }   from '../../lib/prisma';
import ApiError     from '../../utils/ApiError';
import { Prisma }   from '../../generated/client';
import {
  CreateFeedbackBody,
  UpdateFeedbackBody,
  FeedbackQueryParams,
  ToggleVoteBody,
  AddCommentBody,
  UpdateCommentBody,
  ToggleCommentVoteBody,
} from './feedback.validation';
import type {
  FeedbackListItem,
  FeedbackDetail,
  FeedbackListResponse,
  CommentResponse,
} from './feedback.types';
import { AUTHOR_SELECT, FEEDBACK_BASE_SELECT } from './feedback.constant';



// ── Helpers ────────────────────────────────────────────────────────────────────

/** Attach vote counts and caller's vote to a raw feedback row. */
async function attachVotes(
  feedbackId: string,
  viewerMemberId: string | null,
  raw: Record<string, unknown>,
): Promise<void> {
  const [upvotes, downvotes, myVoteRow] = await Promise.all([
    prisma.vote.count({ where: { feedbackId, type: 'upvote'   } }),
    prisma.vote.count({ where: { feedbackId, type: 'downvote' } }),
    viewerMemberId
      ? prisma.vote.findUnique({ where: { feedbackId_voterId: { feedbackId, voterId: viewerMemberId } } })
      : null,
  ]);
  raw['votes']  = { upvotes, downvotes };
  raw['myVote'] = myVoteRow?.type ?? null;
}

/** Resolve the Member.id for a given userId within an org, or null. */
async function getMemberId(orgId: string, userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const member = await prisma.member.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
    select: { id: true },
  });
  return member?.id ?? null;
}

function shapeFeedback(raw: {
  tags:      { tag:    { id: string; name: string; color: string } }[];
  assignees: { member: { id: string; role: string; user: { id: string; name: string; image: string | null } } }[];
  _count?:   { comments: number };
  [key: string]: unknown;
}): Omit<FeedbackListItem, 'votes' | 'myVote'> {
  const { _count, tags, assignees, ...rest } = raw;
  return {
    ...rest,
    tags:         tags.map((t) => t.tag),
    assignees:    assignees.map((a) => a.member),
    commentCount: _count?.comments ?? 0,
  } as Omit<FeedbackListItem, 'votes' | 'myVote'>;
}

// ── Feedback CRUD ──────────────────────────────────────────────────────────────

export const listFeedback = async (
  orgId:  string,
  userId: string,
  query:  FeedbackQueryParams,
): Promise<FeedbackListResponse> => {
  const page  = query.page  ?? 1;
  const limit = query.limit ?? 20;
  const skip  = (page - 1) * limit;

  const where: Prisma.FeedbackWhereInput = { organizationId: orgId };
  if (query.boardId)  where.boardId  = query.boardId;
  if (query.statusId) where.statusId = query.statusId;
  if (query.tagId)    where.tags     = { some: { tagId: query.tagId } };
  if (query.search)   where.title    = { contains: query.search, mode: 'insensitive' };

  // Sort: pinned items always first, then by chosen sort
  const sortField = query.sort ?? 'recent';
  const orderBy: Prisma.FeedbackOrderByWithRelationInput[] = [
    { pinnedAt: 'desc' },
  ];
  if (sortField === 'recent')   orderBy.push({ createdAt: 'desc' });
  if (sortField === 'oldest')   orderBy.push({ createdAt: 'asc'  });
  if (sortField === 'top')      orderBy.push({ votes:     { _count: 'desc' } });
  if (sortField === 'trending') orderBy.push({ createdAt: 'desc' }); // simplified

  const [rawList, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      select:  FEEDBACK_BASE_SELECT,
      orderBy,
      skip,
      take:   limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  const memberId = await getMemberId(orgId, userId);

  const feedbacks = await Promise.all(
    rawList.map(async (raw) => {
      const shaped = shapeFeedback(raw as Parameters<typeof shapeFeedback>[0]);
      await attachVotes(raw.id, memberId, shaped as unknown as Record<string, unknown>);
      return shaped as unknown as FeedbackListItem;
    }),
  );

  return { feedbacks, total, page, limit };
};

export const getFeedback = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
): Promise<FeedbackDetail> => {
  const raw = await prisma.feedback.findFirst({
    where:  { id: feedbackId, organizationId: orgId },
    select: FEEDBACK_BASE_SELECT,
  });
  if (!raw) throw new ApiError(404, 'Feedback not found');

  const memberId = await getMemberId(orgId, userId);
  const shaped   = shapeFeedback(raw as Parameters<typeof shapeFeedback>[0]);
  await attachVotes(raw.id, memberId, shaped as unknown as Record<string, unknown>);

  // Load top-level comments with replies
  const comments = await getCommentTree(feedbackId, null, memberId);

  return { ...(shaped as unknown as FeedbackListItem), comments };
};

export const createFeedback = async (
  orgId:  string,
  userId: string,
  input:  CreateFeedbackBody,
): Promise<FeedbackDetail> => {
  // Resolve the Member record for this user in this org
  const member = await prisma.member.findUnique({
    where:  { organizationId_userId: { organizationId: orgId, userId } },
    select: { id: true },
  });
  if (!member) throw new ApiError(403, 'You are not a member of this organization');

  // Validate board belongs to org
  const board = await prisma.board.findFirst({ where: { id: input.boardId, organizationId: orgId } });
  if (!board) throw new ApiError(404, 'Board not found');

  const feedback = await prisma.feedback.create({
    data: {
      organizationId: orgId,
      boardId:        input.boardId,
      authorId:       member.id,
      title:          input.title,
      description:    input.description !== undefined
        ? (input.description as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      statusId:       input.statusId ?? null,
      postVisibility: input.postVisibility ?? 'public',
      enableComment:  input.enableComment  ?? true,
      tags: input.tagIds?.length
        ? { create: input.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      assignees: input.assigneeIds?.length
        ? { create: input.assigneeIds.map((memberId) => ({ memberId })) }
        : undefined,
    },
    select: { id: true },
  });

  return getFeedback(orgId, userId, feedback.id);
};

export const updateFeedback = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
  input:      UpdateFeedbackBody,
): Promise<FeedbackDetail> => {
  const existing = await prisma.feedback.findFirst({ where: { id: feedbackId, organizationId: orgId } });
  if (!existing) throw new ApiError(404, 'Feedback not found');

  const data: Prisma.FeedbackUpdateInput = {};
  if (input.title          !== undefined) data.title          = input.title;
  if (input.description    !== undefined) data.description    = input.description as Prisma.InputJsonValue;
  if (input.postVisibility !== undefined) data.postVisibility = input.postVisibility;
  if (input.enableComment  !== undefined) data.enableComment  = input.enableComment;
  if (input.pinnedAt       !== undefined) data.pinnedAt       = input.pinnedAt ? new Date(input.pinnedAt) : null;
  if (input.statusId !== undefined)
    data.status = input.statusId ? { connect: { id: input.statusId } } : { disconnect: true };
  if (input.tagIds !== undefined)
    data.tags = {
      deleteMany: {},
      ...(input.tagIds?.length ? { create: input.tagIds.map((tagId) => ({ tagId })) } : {}),
    };
  if (input.assigneeIds !== undefined)
    data.assignees = {
      deleteMany: {},
      ...(input.assigneeIds?.length ? { create: input.assigneeIds.map((memberId) => ({ memberId })) } : {}),
    };
  if (input.boardId !== undefined)
    data.board = { connect: { id: input.boardId } };

  await prisma.feedback.update({ where: { id: feedbackId }, data });
  return getFeedback(orgId, userId, feedbackId);
};

export const deleteFeedback = async (
  orgId:      string,
  feedbackId: string,
): Promise<void> => {
  const existing = await prisma.feedback.findFirst({ where: { id: feedbackId, organizationId: orgId } });
  if (!existing) throw new ApiError(404, 'Feedback not found');
  await prisma.feedback.delete({ where: { id: feedbackId } });
};

// ── Vote ───────────────────────────────────────────────────────────────────────

export const toggleFeedbackVote = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
  input:      ToggleVoteBody,
): Promise<{ upvotes: number; downvotes: number; myVote: 'upvote' | 'downvote' | null }> => {
  const feedback = await prisma.feedback.findFirst({ where: { id: feedbackId, organizationId: orgId } });
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  const memberId = await getMemberId(orgId, userId);
  if (!memberId) throw new ApiError(403, 'Not a member of this organization');

  const existing = await prisma.vote.findUnique({
    where: { feedbackId_voterId: { feedbackId, voterId: memberId } },
  });

  if (existing) {
    if (existing.type === input.type) {
      // Same type → remove vote (toggle off)
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      // Different type → switch vote
      await prisma.vote.update({ where: { id: existing.id }, data: { type: input.type } });
    }
  } else {
    await prisma.vote.create({ data: { feedbackId, voterId: memberId, type: input.type } });
  }

  const [upvotes, downvotes, myVoteRow] = await Promise.all([
    prisma.vote.count({ where: { feedbackId, type: 'upvote'   } }),
    prisma.vote.count({ where: { feedbackId, type: 'downvote' } }),
    prisma.vote.findUnique({ where: { feedbackId_voterId: { feedbackId, voterId: memberId } } }),
  ]);

  return { upvotes, downvotes, myVote: myVoteRow?.type ?? null };
};

// ── Comments ───────────────────────────────────────────────────────────────────

/** Recursively build comment tree for a given parentId. */
async function getCommentTree(
  feedbackId:  string,
  parentId:    string | null,
  viewerMemberId: string | null,
): Promise<CommentResponse[]> {
  const rows = await prisma.comment.findMany({
    where:   { feedbackId, parentId: parentId ?? null },
    orderBy: { createdAt: 'asc' },
    select:  {
      id:         true,
      feedbackId: true,
      authorId:   true,
      parentId:   true,
      content:    true,
      isEdited:   true,
      createdAt:  true,
      updatedAt:  true,
      author:     { select: AUTHOR_SELECT },
    },
  });

  return Promise.all(
    rows.map(async (row) => {
      const [upvotes, downvotes, myVoteRow, replies] = await Promise.all([
        prisma.commentVote.count({ where: { commentId: row.id, type: 'upvote'   } }),
        prisma.commentVote.count({ where: { commentId: row.id, type: 'downvote' } }),
        viewerMemberId
          ? prisma.commentVote.findUnique({
              where: { commentId_voterId: { commentId: row.id, voterId: viewerMemberId } },
            })
          : null,
        getCommentTree(feedbackId, row.id, viewerMemberId),
      ]);

      return {
        ...row,
        votes:  { upvotes, downvotes },
        myVote: myVoteRow?.type ?? null,
        replies,
      } as CommentResponse;
    }),
  );
}

export const addComment = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
  input:      AddCommentBody,
): Promise<CommentResponse[]> => {
  const feedback = await prisma.feedback.findFirst({ where: { id: feedbackId, organizationId: orgId } });
  if (!feedback)           throw new ApiError(404, 'Feedback not found');
  if (!feedback.enableComment) throw new ApiError(403, 'Comments are disabled for this post');

  const memberId = await getMemberId(orgId, userId);
  if (!memberId) throw new ApiError(403, 'Not a member of this organization');

  // Validate parentId belongs to same feedback
  if (input.parentId) {
    const parent = await prisma.comment.findFirst({ where: { id: input.parentId, feedbackId } });
    if (!parent) throw new ApiError(404, 'Parent comment not found');
  }

  await prisma.comment.create({
    data: {
      feedbackId,
      authorId: memberId,
      parentId: input.parentId ?? null,
      content:  input.content as Prisma.InputJsonValue,
    },
  });

  return getCommentTree(feedbackId, null, memberId);
};

export const updateComment = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
  commentId:  string,
  input:      UpdateCommentBody,
): Promise<CommentResponse[]> => {
  const memberId = await getMemberId(orgId, userId);
  if (!memberId) throw new ApiError(403, 'Not a member of this organization');

  const comment = await prisma.comment.findFirst({ where: { id: commentId, feedbackId } });
  if (!comment)                    throw new ApiError(404, 'Comment not found');
  if (comment.authorId !== memberId) throw new ApiError(403, 'You can only edit your own comments');

  await prisma.comment.update({
    where: { id: commentId },
    data:  { content: input.content as Prisma.InputJsonValue, isEdited: true },
  });

  return getCommentTree(feedbackId, null, memberId);
};

export const deleteComment = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
  commentId:  string,
): Promise<CommentResponse[]> => {
  const memberId = await getMemberId(orgId, userId);
  if (!memberId) throw new ApiError(403, 'Not a member of this organization');

  // Check feedback belongs to org
  const feedback = await prisma.feedback.findFirst({ where: { id: feedbackId, organizationId: orgId } });
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  const comment = await prisma.comment.findFirst({ where: { id: commentId, feedbackId } });
  if (!comment) throw new ApiError(404, 'Comment not found');

  // Allow author or org admin/owner to delete
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { role: true } });
  const isAdmin = member?.role === 'admin' || member?.role === 'owner';
  if (comment.authorId !== memberId && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to delete this comment');
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return getCommentTree(feedbackId, null, memberId);
};

// ── Comment vote ───────────────────────────────────────────────────────────────

export const toggleCommentVote = async (
  orgId:      string,
  userId:     string,
  feedbackId: string,
  commentId:  string,
  input:      ToggleCommentVoteBody,
): Promise<{ upvotes: number; downvotes: number; myVote: 'upvote' | 'downvote' | null }> => {
  const feedback = await prisma.feedback.findFirst({ where: { id: feedbackId, organizationId: orgId } });
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  const comment = await prisma.comment.findFirst({ where: { id: commentId, feedbackId } });
  if (!comment) throw new ApiError(404, 'Comment not found');

  const memberId = await getMemberId(orgId, userId);
  if (!memberId) throw new ApiError(403, 'Not a member of this organization');

  const existing = await prisma.commentVote.findUnique({
    where: { commentId_voterId: { commentId, voterId: memberId } },
  });

  if (existing) {
    if (existing.type === input.type) {
      await prisma.commentVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentVote.update({ where: { id: existing.id }, data: { type: input.type } });
    }
  } else {
    await prisma.commentVote.create({ data: { commentId, voterId: memberId, type: input.type } });
  }

  const [upvotes, downvotes, myVoteRow] = await Promise.all([
    prisma.commentVote.count({ where: { commentId, type: 'upvote'   } }),
    prisma.commentVote.count({ where: { commentId, type: 'downvote' } }),
    prisma.commentVote.findUnique({ where: { commentId_voterId: { commentId, voterId: memberId } } }),
  ]);

  return { upvotes, downvotes, myVote: myVoteRow?.type ?? null };
};
