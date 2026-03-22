export interface StatusResponse {
  id:             string;
  organizationId: string;
  name:           string;
  color:          string;
  isDefault:      boolean;
  createdAt:      Date;
  updatedAt:      Date;
}
