export interface BoardIcon {
  type:  'predefined' | 'emoji';
  value: string;
}

export interface BoardGreeting {
  welcomingTitle:         string;
  welcomingDescription:   string;
  postCreationButtonText: string;
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
