import { Providers } from 'model/constants';

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

export function supportsMultiAccount(
  provider: PropertiesOf<typeof Providers>
): boolean {
  return provider === Providers.AWS || provider === Providers.AZURE;
}
