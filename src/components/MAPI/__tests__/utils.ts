import {
  determineRandomAZs,
  generateUID,
  getNamespaceFromOrgName,
} from 'MAPI/utils';

describe('mapi::utils', () => {
  describe('generateUID', () => {
    it('generates unique IDs', () => {
      const tries = 250;
      const minLength = 3;
      const maxLength = 10;

      const values = new Set<string>();
      for (let i = 0; i < tries; i++) {
        const randomLength = Math.floor(minLength + maxLength * Math.random());
        const id = generateUID(randomLength);

        expect(id).toHaveLength(randomLength);
        expect(values.has(id)).toBeFalsy();

        values.add(id);
      }
    });

    it('throws an error if the length parameter is incorrect', () => {
      expect(() => generateUID(2)).toThrow('Length is too short');
    });
  });

  describe('determineRandomAZs', () => {
    it('returns a collection of random availability zones', () => {
      function runTest(tries: number, count: number, fromList: string[]) {
        const values = new Set<string>();
        for (let i = 0; i < tries; i++) {
          const azs = determineRandomAZs(count, fromList).join();

          if (values.has(azs)) return false;

          values.add(azs);
        }

        return true;
      }

      const runs = 50;
      let successRuns = 0;
      for (let i = 0; i < runs; i++) {
        const result = runTest(3, 2, ['1', '2', '3', '4', '5']);
        if (!result) continue;

        successRuns++;
      }

      // Expect a 50% success rate.
      // eslint-disable-next-line no-magic-numbers
      expect(successRuns).toBeGreaterThan(0.05 * runs);
    });

    it('returns an empty collection for no given availability zones', () => {
      const azs = determineRandomAZs(3, []);
      expect(azs).toStrictEqual([]);
    });

    it('returns an empty collection for 0 desired availability zones', () => {
      const azs = determineRandomAZs(0, ['1', '2', '3', '4', '5']);
      expect(azs).toStrictEqual([]);
    });

    it('includes the existing availability zones and only gets random values for the other required ones', () => {
      const azs = determineRandomAZs(3, ['1', '2', '3', '4', '5'], ['1', '2']);
      expect(azs[0]).toEqual('1');
      expect(azs[1]).toEqual('2');
    });

    it('includes the existing availability zones and only gets random values for the other required ones', () => {
      const azs = determineRandomAZs(3, ['1', '2', '3', '4', '5'], ['1', '2']);
      expect(azs[0]).toEqual('1');
      expect(azs[1]).toEqual('2');
      expect(azs[2]).not.toEqual('1');
      expect(azs[2]).not.toEqual('2');
      expect(['3', '4', '5'].includes(azs[2])).toBeTruthy();
    });

    it('does not include the existing availability zones if they are not in the list of supported ones', () => {
      const azs = determineRandomAZs(2, ['1', '2', '3'], ['4', '5']);
      expect(azs.includes('4')).toBeFalsy();
      expect(azs.includes('5')).toBeFalsy();
    });

    it('returns the right number of availability zones when the list of supported ones is the same as the existing ones', () => {
      const azs = determineRandomAZs(2, ['1', '2', '3'], ['1', '2', '3']);
      expect(['1', '2', '3'].includes(azs[0])).toBeTruthy();
      expect(['1', '2', '3'].includes(azs[1])).toBeTruthy();
    });

    it('returns the maximum number of availability zones possible, even if the available ones are less than we need', () => {
      const azs = determineRandomAZs(3, ['1', '2']);
      expect(azs).toStrictEqual(['1', '2']);
    });
  });

  describe('getNamespaceFromOrgName', () => {
    test.each`
      orgName                                                                            | expected
      ${''}                                                                              | ${''}
      ${'%_#!'}                                                                          | ${''}
      ${'someorg'}                                                                       | ${'org-someorg'}
      ${'someOrg'}                                                                       | ${'org-someorg'}
      ${'some-org'}                                                                      | ${'org-some-org'}
      ${'some-Org'}                                                                      | ${'org-some-org'}
      ${'some_org'}                                                                      | ${'org-some-org'}
      ${'some_Org'}                                                                      | ${'org-some-org'}
      ${'some____Org'}                                                                   | ${'org-some-org'}
      ${'some$Org'}                                                                      | ${'org-some-org'}
      ${'some-random%org'}                                                               | ${'org-some-random-org'}
      ${'some-org-'}                                                                     | ${'org-some-org'}
      ${'-some-org-'}                                                                    | ${'org-some-org'}
      ${'-some-org----'}                                                                 | ${'org-some-org'}
      ${'-some-org%'}                                                                    | ${'org-some-org'}
      ${'-some-random123_org'}                                                           | ${'org-some-random123-org'}
      ${'some-random_org401'}                                                            | ${'org-some-random-org401'}
      ${'some-random-org-with-random-keys-in-a-random-order-just-to-get-a-lot-of-chars'} | ${'org-some-random-org-with-random-keys-in-a-random-order-just-to'}
    `(
      `computes namespace from '$orgName'`,
      ({ orgName, expected }: { orgName: string; expected: string }) => {
        const result = getNamespaceFromOrgName(orgName);
        expect(result).toEqual(expected);
      }
    );
  });
});
