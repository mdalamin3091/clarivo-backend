export type OrgModule = 'feedback' | 'survey' | 'changelog' | 'roadmap';
export type OrgAccessibility = 'public' | 'private';
export type OrgTeamSize = '1' | '2-10' | '11-50' | '51-200' | '201+';

export interface PortalMenuIcon {
  type: 'predefined' | 'custom';
  value: string;
}

export interface PortalMenuItem {
  id:    string;
  name:  string;
  icon:  PortalMenuIcon;
  link:  string;
  order: number;
}

export interface SetupOrganizationInput {
  name: string;
  modules: OrgModule[];
  accessibility: OrgAccessibility;
  teamSize: OrgTeamSize;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  modules: string[];
  accessibility: string;
  teamSize: string | null;
  createdAt: Date;
}
