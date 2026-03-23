export const OPTION_TYPES = new Set(['dropdown', 'multiselect']);

export const CUSTOM_FIELD_SELECT = {
  id:                   true,
  organizationId:       true,
  name:                 true,
  type:                 true,
  options:              true,
  placeholder:          true,
  isRequired:           true,
  isPrivate:            true,
  showAnswerToEveryone: true,
  order:                true,
  createdAt:            true,
  updatedAt:            true,
} as const;