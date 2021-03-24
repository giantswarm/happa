import { IOrganization } from './types';

export function getOrganizationName(organization: IOrganization): string {
  let name = organization.metadata.name;
  name ??= 'Unnamed organization';

  return name;
}
