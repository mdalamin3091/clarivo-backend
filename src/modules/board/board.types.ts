export interface BoardIcon {
  type:  'predefined' | 'emoji';
  value: string;
}

export interface BoardGreeting {
  welcomingTitle:         string;
  welcomingDescription:   string;
  postCreationButtonText: string;
}

export interface BoardCustomFieldSummary {
  id:   string;
  name: string;
  type: string;
}

export interface BoardResponse {
  id:                      string;
  organizationId:          string;
  name:                    string;
  slug:                    string;
  icon:                    BoardIcon;
  defaultSorting:          string;
  greeting:                BoardGreeting | null;
  visibility:              string;
  allowSubscribe:          boolean;
  disableFollowupQuestions: boolean;
  disableEndUserPosting:   boolean;
  order:                   number;
  customFields:            BoardCustomFieldSummary[];
  createdAt:               Date;
  updatedAt:               Date;
}

export interface CreateBoardInput {
  name:                    string;
  icon:                    BoardIcon;
  defaultSorting?:         string;
  greeting?:               BoardGreeting | null;
  visibility?:             string;
  allowSubscribe?:         boolean;
  disableFollowupQuestions?: boolean;
  disableEndUserPosting?:  boolean;
}
