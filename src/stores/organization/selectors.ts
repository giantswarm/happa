import { getOrganizationByID } from 'stores/organization/utils';
import { IState } from 'stores/state';

export const selectOrganizationByID = (id: string) => (
  state: IState
): IOrganization | undefined => {
  return getOrganizationByID(
    id,
    Object.values(state.entities.organizations.items)
  );
};
