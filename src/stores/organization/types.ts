import { ORGANIZATION_SELECT } from 'stores/organization/constants';

export interface IOrganizationState {
  lastUpdated: number;
  isFetching: boolean;
  items: Record<string, IOrganization>;
}

export interface IOrganizationSelectAction {
  type: typeof ORGANIZATION_SELECT;
  orgId: string;
}

export interface IOrganizationSelectAction {
  type: typeof ORGANIZATION_SELECT;
  orgId: string;
}
