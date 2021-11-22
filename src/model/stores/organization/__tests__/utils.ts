import { getOrganizationByID } from 'model/stores/organization/utils';

describe('organization::utils', () => {
  describe('getOrganizationByID', () => {
    it('returns the organization with a given ID', () => {
      const organizations: IOrganization[] = [
        { id: 'giantswarm' },
        { id: 'medium-sw-arm' },
      ];

      expect(getOrganizationByID('medium-sw-arm', organizations)).toStrictEqual(
        organizations[1]
      );
    });

    it('returns the organization with a given lowercase ID, even if the organization ID has a mixed case', () => {
      const organizations: IOrganization[] = [
        { id: 'giantswarm' },
        { id: 'medium-SW-arm' },
      ];

      expect(getOrganizationByID('medium-sw-arm', organizations)).toStrictEqual(
        organizations[1]
      );
    });

    it('returns undefined if an organization could not be found', () => {
      const organizations: IOrganization[] = [
        { id: 'giantswarm' },
        { id: 'medium-SW-arm' },
      ];

      expect(getOrganizationByID('medium-sw-arm', organizations)).toStrictEqual(
        organizations[1]
      );
    });
  });
});
