import { determineSelectedOrganization } from 'utils/organizationUtils';

describe('organizationUtils', () => {
  describe('determineSelectedOrganization', () => {
    it('returns the currently selected organization if it still exists', () => {
      const currentOrg = 'giantswarm';
      const orgs = ['someorg', 'otherorg', 'giantswarm', 'otherthing'];
      expect(determineSelectedOrganization(orgs, currentOrg)).toEqual(
        currentOrg
      );
    });

    it('returns the first organization in the list, if there is no org currently selected', () => {
      const orgs = ['someorg', 'otherorg', 'giantswarm', 'otherthing'];
      expect(determineSelectedOrganization(orgs, null)).toEqual('someorg');
    });

    it('returns the first organization in the list, if the currently selected organization was deleted', () => {
      const orgs = ['someorg', 'otherorg', 'giantswarm', 'otherthing'];
      expect(determineSelectedOrganization(orgs, 'randomorg')).toEqual(
        'someorg'
      );
    });

    it('returns null if there are no organizations in the list, and no org is currently selected', () => {
      expect(determineSelectedOrganization([], null)).toEqual(null);
    });

    it('returns null if there are no organizations in the list, and the currently selected org is no longer there', () => {
      expect(determineSelectedOrganization([], 'giantswarm')).toEqual(null);
    });
  });
});
