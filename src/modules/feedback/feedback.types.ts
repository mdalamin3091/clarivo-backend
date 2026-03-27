// ── Feedback module TypeScript types ──────────────────────────────────────────

export interface AuthorSummary {
  id:   string;
  role: string;
  user: { id: string; name: string; image: string | null };
}

export interface StatusSummary {
  id:    string;
  name:  string;
  color: string;
}

export interface TagSummary {
  id:    string;
  name:  string;
  color: string;
}

// ── Comment ────────────────────────────────────────────────────────────────────

export interface CommentVoteCount {
  upvotes:   number;
  downvotes: number;
}

export interface CommentResponse {
  id:         string;
  feedbackId: string;
  authorId:   string;
  parentId:   string | null;
  content:    unknown;           // Tiptap / ProseMirror JSON doc
  isEdited:   boolean;
  createdAt:  Date;
  updatedAt:  Date;
  author:     AuthorSummary;
  votes:      CommentVoteCount;
  myVote:     'upvote' | 'downvote' | null;
  replies:    CommentResponse[];
}

// ── Feedback ───────────────────────────────────────────────────────────────────

export interface FeedbackVoteCount {
  upvotes:   number;
  downvotes: number;
}

/** Shape returned in list and detail responses. */
export interface FeedbackListItem {
  id:             string;
  organizationId: string;
  boardId:        string;
  authorId:       string;
  statusId:       string | null;
  title:          string;
  description:    unknown | null;
  postVisibility: 'public' | 'private';
  enableComment:  boolean;
  pinnedAt:       Date | null;
  eta:            Date | null;
  createdAt:      Date;
  updatedAt:      Date;
  author:         AuthorSummary;
  status:         StatusSummary | null;
  tags:           TagSummary[];
  assignees:      AuthorSummary[];
  votes:          FeedbackVoteCount;
  myVote:         'upvote' | 'downvote' | null;
  commentCount:   number;
}

/** Full detail response — extends list item with nested comment tree. */
export interface FeedbackDetail extends FeedbackListItem {
  comments: CommentResponse[];
}

export interface FeedbackListResponse {
  feedbacks: FeedbackListItem[];
  total:     number;
  page:      number;
  limit:     number;
}
