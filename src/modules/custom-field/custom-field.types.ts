export interface CustomFieldResponse {
  id:                   string;
  organizationId:       string;
  name:                 string;
  type:                 string;
  options:              string[];
  placeholder:          string | null;
  isRequired:           boolean;
  isPrivate:            boolean;
  showAnswerToEveryone: boolean;
  order:                number;
  createdAt:            Date;
  updatedAt:            Date;
}
