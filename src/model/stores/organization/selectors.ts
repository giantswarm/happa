import { getOrganizationByID } from 'model/stores/organization/utils';
import { IState } from 'model/stores/state';

export const selectOrganizationByID =
  (id: string) =>
  (state: IState): IOrganization | undefined => {
    return getOrganizationByID(
      id,
      Object.values(state.entities.organizations.items)
    );
  };

export const selectOrganizations =
  () =>
  (state: IState): Record<string, IOrganization> => {
    return state.entities.organizations.items;
  };
