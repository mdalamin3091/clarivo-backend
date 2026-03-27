// ── Prisma SELECT projections shared across feedback service functions ─────────

const AUTHOR_SELECT = {
  id:   true,
  role: true,
  user: { select: { id: true, name: true, image: true } },
} as const;

const STATUS_SELECT = { id: true, name: true, color: true } as const;
const TAG_SELECT    = { id: true, name: true, color: true } as const;

/** Base projection for list and detail queries. */
const FEEDBACK_BASE_SELECT = {
  id:             true,
  organizationId: true,
  boardId:        true,
  authorId:       true,
  statusId:       true,
  title:          true,
  description:    true,
  postVisibility: true,
  enableComment:  true,
  pinnedAt:       true,
  eta:            true,
  createdAt:      true,
  updatedAt:      true,
  author:    { select: AUTHOR_SELECT },
  status:    { select: STATUS_SELECT },
  tags:      { select: { tag:    { select: TAG_SELECT    } } },
  assignees: { select: { member: { select: AUTHOR_SELECT } } },
  _count:    { select: { comments: true } },
} as const;

export { AUTHOR_SELECT, STATUS_SELECT, FEEDBACK_BASE_SELECT };
