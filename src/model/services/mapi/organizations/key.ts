import { IOrganization } from './types';

export function getOrganizationName(organization: IOrganization): string {
  let name = organization.metadata.name;
  name ??= 'Unnamed organization';

  return name;
}

export function getOrganizationUIName(organization: IOrganization): string {
  const uiAnnotation =
    organization.metadata.annotations?.[
      'ui.giantswarm.io/original-organization-name'
    ];

  return uiAnnotation || getOrganizationName(organization);
}
