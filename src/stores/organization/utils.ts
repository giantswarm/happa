import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export function getOrganizationByID(
  id: string,
  organizations: IOrganization[]
): IOrganization | undefined {
  const idLowerCased = id.toLowerCase();

  for (const org of organizations) {
    if (org.id.toLowerCase() === idLowerCased) {
      return org;
    }
  }

  return undefined;
}

export function supportsBYOC(
  provider: PropertiesOf<typeof Providers>
): boolean {
  return provider === Providers.AWS || provider === Providers.AZURE;
}
