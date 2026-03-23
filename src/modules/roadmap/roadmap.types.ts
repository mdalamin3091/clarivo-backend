export interface RoadmapIcon {
  type:  'predefined' | 'emoji';
  value: string;
}

export interface RoadmapColumnResponse {
  id:          string;
  roadmapId:   string;
  name:        string;
  description: string | null;
  icon:        RoadmapIcon | null;
  color:       string;
  baseFilter:  string;
  order:       number;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface RoadmapResponse {
  id:             string;
  organizationId: string;
  name:           string;
  description:    string | null;
  icon:           RoadmapIcon;
  visibility:     string;
  baseFilter:     string;
  copiedFromId:   string | null;
  order:          number;
  columns:        RoadmapColumnResponse[];
  createdAt:      Date;
  updatedAt:      Date;
}
