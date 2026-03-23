export interface StatusResponse {
  id:             string;
  organizationId: string;
  name:           string;
  color:          string;
  isDefault:      boolean;
  order:          number;
  createdAt:      Date;
  updatedAt:      Date;
}
