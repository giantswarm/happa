import { determineRandomAZs, generateUID } from 'MAPI/utils';

describe('mapi::utils', () => {
  describe('generateUID', () => {
    it('generates unique IDs', () => {
      const tries = 250;

      const values = new Set<string>();
      for (let i = 0; i < tries; i++) {
        const id = generateUID(5);

        expect(values.has(id)).toBeFalsy();

        values.add(id);
      }
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
});
