export interface TagResponse {
  id:             string;
  organizationId: string;
  name:           string;
  color:          string;
  isPrivate:      boolean;
  order:          number;
  createdAt:      Date;
  updatedAt:      Date;
}
