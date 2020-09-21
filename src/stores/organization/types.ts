export interface IOrganizationState {
  lastUpdated: number;
  isFetching: boolean;
  items: Record<string, IOrganization>;
}
